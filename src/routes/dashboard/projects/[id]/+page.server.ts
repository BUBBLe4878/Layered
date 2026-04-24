import { db } from '$lib/server/db/index.js';
import { devlog, project, user } from '$lib/server/db/schema.js';
import { error, fail } from '@sveltejs/kit';
import { eq, and, desc, sql, or } from 'drizzle-orm';
import type { Actions } from './$types';
import { extname } from 'path';
import {
	ALLOWED_IMAGE_TYPES,
	ALLOWED_MODEL_EXTS,
	ALLOWED_MODEL_TYPES,
	MAX_UPLOAD_SIZE
} from './config';
import sharp from 'sharp';
import {
	DEVLOG_DESCRIPTION_MAX_WORDS,
	DEVLOG_DESCRIPTION_MIN_WORDS,
	DEVLOG_MAX_TIME,
	DEVLOG_MIN_TIME
} from '$lib/defs';
import { put } from '@vercel/blob';
import { getIdFromLapseUrl, getLapse, type Lapse } from '$lib/lapse';

export async function load({ params, locals }) {
	const id: number = parseInt(params.id);

	if (!id) {
		throw error(404);
	}

	const [queriedProject] = await db
		.select({
			project: project,
			timeSpent: sql<number>`COALESCE(SUM(${devlog.timeSpent}), 0)`
		})
		.from(project)
		.leftJoin(devlog, and(eq(project.id, devlog.projectId), eq(devlog.deleted, false)))
		.where(and(eq(project.id, id), eq(project.deleted, false)))
		.groupBy(project.id)
		.limit(1);

	if (!queriedProject) {
		throw error(404);
	}

	let projectUser = null;

	if (queriedProject.project.userId !== locals.user?.id) {
		[projectUser] = await db
			.select({
				name: user.name
			})
			.from(user)
			.where(eq(user.id, queriedProject.project.userId))
			.limit(1);
	}

	const devlogs = await db
		.select()
		.from(devlog)
		.where(and(eq(devlog.projectId, queriedProject.project.id), eq(devlog.deleted, false)))
		.orderBy(desc(devlog.createdAt));

	return {
		project: {
			id: queriedProject.project.id,
			userId: queriedProject.project.userId,
			name: queriedProject.project.name,
			description: queriedProject.project.description,

			url: queriedProject.project.url,
			editorFileType: queriedProject.project.editorFileType,
			editorUrl: queriedProject.project.editorUrl,
			uploadedFileUrl: queriedProject.project.uploadedFileUrl,
			modelFile: queriedProject.project.modelFile,
			doubleDippingWith: queriedProject.project.doubleDippingWith,

			createdAt: queriedProject.project.createdAt,
			updatedAt: queriedProject.project.updatedAt,
			timeSpent: queriedProject.timeSpent,
			status: queriedProject.project.status
		},
		projectUser,
		devlogs: devlogs.map((devlog) => {
			return {
				id: devlog.id,
				description: devlog.description,
				timeSpent: devlog.timeSpent,
				image: devlog.image,
				model: devlog.model,
				lapseId: queriedProject.project.userId === locals.user?.id ? devlog.lapseId : null,
				createdAt: devlog.createdAt
			};
		}),
		validationConstraints: {
			timeSpent: {
				min: DEVLOG_MIN_TIME,
				max: DEVLOG_MAX_TIME,
				currentMax: await getMaxDevlogTime(id)
			},
			description: {
				min: DEVLOG_DESCRIPTION_MIN_WORDS,
				max: DEVLOG_DESCRIPTION_MAX_WORDS
			}
		}
	};
}

export const actions = {
	default: async ({ request, locals, params }) => {
		if (!locals.user) {
			throw error(500);
		}

		const id: number = parseInt(params.id);

		const [queriedProject] = await db
			.select()
			.from(project)
			.where(
				and(
					eq(project.id, id),
					eq(project.userId, locals.user.id),
					eq(project.deleted, false),
					or(eq(project.status, 'building'), eq(project.status, 'rejected'))
				)
			)
			.limit(1);

		if (!queriedProject) {
			throw error(404);
		}

		const data = await request.formData();
		const description = data.get('description');
		const timeSpent = data.get('timeSpent');
		const lapseUrl = data.get('lapseUrl')?.toString();
		const imageFile = data.get('image') as File;
		const modelFile = data.get('model') as File;

		if (
			!description ||
			description.toString().trim().length < DEVLOG_DESCRIPTION_MIN_WORDS ||
			description.toString().trim().length > DEVLOG_DESCRIPTION_MAX_WORDS
		) {
			return fail(400, {
				fields: { description, timeSpent },
				invalid_description: true
			});
		}

		let lapseUrlValid = false;
		let lapseId: string | null = null;
		let lapse: Lapse | null = null;

		if (lapseUrl && lapseUrl.length > 0) {
			lapseId = getIdFromLapseUrl(lapseUrl);

			if (lapseId) {
				lapse = await getLapse(lapseId);

				if (lapse?.ok) {
					lapseUrlValid = true;
				}
			}
		}

		if (
			!lapseUrlValid &&
			(!timeSpent ||
				!parseInt(timeSpent.toString()) ||
				parseInt(timeSpent.toString()) < DEVLOG_MIN_TIME ||
				parseInt(timeSpent.toString()) > (await getMaxDevlogTime(id)))
		) {
			return fail(400, {
				fields: { description, timeSpent },
				invalid_timeSpent: true
			});
		}

		// Validate image
		if (!(imageFile instanceof File)) {
			return fail(400, {
				fields: { description, timeSpent },
				invalid_image_file: true
			});
		}

		if (imageFile.size > MAX_UPLOAD_SIZE) {
			return fail(400, {
				fields: { description, timeSpent },
				invalid_image_file: true
			});
		}

		if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
			return fail(400, {
				fields: { description, timeSpent },
				invalid_image_file: true
			});
		}

		// Validate model
		if (!(modelFile instanceof File) || modelFile.size > MAX_UPLOAD_SIZE) {
			return fail(400, {
				fields: { description, timeSpent },
				invalid_model_file: true
			});
		}

		if (
			!ALLOWED_MODEL_TYPES.includes(modelFile.type) ||
			!ALLOWED_MODEL_EXTS.includes(extname(modelFile.name).toLowerCase())
		) {
			return fail(400, {
				fields: { description, timeSpent },
				invalid_model_file: true
			});
		}

		try {
			// Upload model to Vercel Blob
			const modelBlob = await put(
				`devlogs/models/${crypto.randomUUID()}${extname(modelFile.name).toLowerCase()}`,
				modelFile,
				{
					access: 'public'
				}
			);

			// Remove Exif metadata and upload image
			const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
			const processedImage = await sharp(imageBuffer).toBuffer();

			const imageBlob = await put(
				`devlogs/images/${crypto.randomUUID()}${extname(imageFile.name).toLowerCase()}`,
				processedImage,
				{
					access: 'public'
				}
			);

			const now = new Date();

			await db.transaction(async (tx) => {
				const [streakUser] = await tx
					.select({
						journalStreak: user.journalStreak,
						journalStreakLastJournalAt: user.journalStreakLastJournalAt
					})
					.from(user)
					.where(eq(user.id, locals.user.id))
					.limit(1);

				const streak = calculateNextJournalStreak(
					streakUser?.journalStreak ?? 0,
					streakUser?.journalStreakLastJournalAt ?? null,
					now
				);

				await tx
					.update(user)
					.set({
						journalStreak: streak,
						journalStreakLastJournalAt: now
					})
					.where(eq(user.id, locals.user.id));

				// Store the full URLs in the database
				await tx.insert(devlog).values({
					userId: locals.user.id,
					projectId: queriedProject.id,
					description: description.toString().trim(),
					image: imageBlob.url,
					model: modelBlob.url,
					timeSpent:
						lapseUrlValid && lapse?.ok ? lapse.timelapse.durationMins : parseInt(timeSpent!.toString()),
					lapseId: lapseUrlValid && lapse?.ok ? lapseId : null,
					createdAt: now,
					updatedAt: now
				});

				await tx
					.update(project)
					.set({
						updatedAt: now
					})
					.where(and(eq(project.id, queriedProject.id)));
			});

			return { success: true };
		} catch (err) {
			console.error('Upload error:', err);
			return fail(500, {
				fields: { description, timeSpent },
				upload_error: true
			});
		}
	}
} satisfies Actions;

function calculateNextJournalStreak(currentStreak: number, lastJournalAt: Date | null, now: Date) {
	const today = getUtcDayKey(now);

	if (!lastJournalAt) {
		return 1;
	}

	const lastJournalDay = getUtcDayKey(lastJournalAt);

	if (lastJournalDay === today) {
		return currentStreak;
	}

	if (today - lastJournalDay === 1) {
		return currentStreak + 1;
	}

	return 1;
}

function getUtcDayKey(date: Date) {
	return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) / 86400000;
}

async function getMaxDevlogTime(id: number) {
	const queriedDevlogArray = await db
		.select()
		.from(devlog)
		.where(and(eq(devlog.projectId, id), eq(devlog.deleted, false)))
		.orderBy(desc(devlog.createdAt))
		.limit(1);

	let devlogCurrentMaxTime;

	if (queriedDevlogArray.length == 0) {
		devlogCurrentMaxTime = DEVLOG_MAX_TIME;
	} else {
		const diff = new Date(Date.now()).valueOf() - queriedDevlogArray[0].createdAt.valueOf();

		devlogCurrentMaxTime = Math.min(Math.floor(Math.abs(diff / 1000 / 60)), DEVLOG_MAX_TIME);
	}

	return devlogCurrentMaxTime;
}
