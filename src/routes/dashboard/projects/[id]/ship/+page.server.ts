import { db } from '$lib/server/db/index.js';
import { devlog, project, clubMembership, club } from '$lib/server/db/schema.js';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq, and, or, sql } from 'drizzle-orm';
import type { Actions } from './$types';
import { sendSlackDM } from '$lib/server/slack.js';
import { isValidUrl } from '$lib/utils';
import { MAX_UPLOAD_SIZE } from '../config';
import { extname } from 'path';
import { env } from '$env/dynamic/private';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { S3 } from '$lib/server/s3';
import { ship } from '$lib/server/db/schema.js';
import { sanitizeUrl } from '@braintree/sanitize-url';
import { put } from '@vercel/blob';

function parseProjectId(rawId: string): number {
	const id = Number.parseInt(rawId, 10);

	if (!Number.isInteger(id) || id <= 0) {
		throw error(404, { message: 'project not found' });
	}

	return id;
}

export async function load({ params, locals }) {
	const id = parseProjectId(params.id);

	if (!locals.user) {
		throw error(500);
	}

	const [queriedProject] = await db
		.select({
			id: project.id,
			name: project.name,
			description: project.description,

			url: project.url,
			editorFileType: project.editorFileType,
			editorUrl: project.editorUrl,
			uploadedFileUrl: project.uploadedFileUrl,
			modelFile: project.modelFile,

			createdAt: project.createdAt,
			status: project.status,
			timeSpent: sql<number>`COALESCE(SUM(${devlog.timeSpent}), 0)`,
			devlogCount: sql<number>`COALESCE(COUNT(${devlog.id}), 0)`
		})
		.from(project)
		.leftJoin(devlog, and(eq(project.id, devlog.projectId), eq(devlog.deleted, false)))
		.where(
			and(
				eq(project.id, id),
				eq(project.userId, locals.user.id),
				eq(project.deleted, false),
				or(eq(project.status, 'building'), eq(project.status, 'rejected'))
			)
		)
		.groupBy(
			project.id,
			project.name,
			project.description,
			project.url,
			project.editorFileType,
			project.editorUrl,
			project.uploadedFileUrl,
			project.modelFile,
			project.createdAt,
			project.status
		)
		.limit(1);

	if (!queriedProject) {
		throw error(404);
	}

	// Check if user has a club membership
	const membership = await db
		.select({
			clubId: clubMembership.clubId,
			clubName: club.name
		})
		.from(clubMembership)
		.innerJoin(club, eq(clubMembership.clubId, club.id))
		.where(eq(clubMembership.userId, locals.user.id))
		.limit(1);

	return {
		project: queriedProject,
		clubMembership: membership.length > 0 ? membership[0] : null
	};
}

export const actions = {
	default: async ({ locals, params, request }) => {
		if (!locals.user) {
			throw error(500);
		}

		const id = parseProjectId(params.id);

		const data = await request.formData();
		const printablesUrl = data.get('printables_url');
		const editorUrl = data.get('editor_url');
		const editorFile = data.get('editor_file') as File;
		const modelFile = data.get('model_file') as File;
		const submitAsClub = data.get('submit_as_club') === 'true';
		const doubleDippingWith = data.get('doubledip') as typeof project.doubleDippingWith._.data;

		const printablesUrlString =
			printablesUrl && printablesUrl.toString() ? sanitizeUrl(printablesUrl.toString()) : null;

		const printablesUrlValid =
			printablesUrlString &&
			printablesUrlString.trim().length < 8000 &&
			isValidUrl(printablesUrlString.trim()) &&
			printablesUrlString !== 'about:blank';

		if (!printablesUrlValid) {
			return fail(400, {
				invalid_printables_url: true
			});
		}

        // Double dipping
		if (doubleDippingWith !== 'none' && doubleDippingWith !== 'enclosure') {
			throw error(400, { message: 'invalid double dip selection' });
		}

		const printablesUrlObj = new URL(printablesUrlString.trim());

		const pathMatch = printablesUrlObj.pathname.match(/\/model\/(\d+)/);
		const modelId = pathMatch ? pathMatch[1] : '';

		const allowedLicenseIds = (env.PRINTABLES_ALLOWED_LICENSES_ID ?? '7,1,2,9,12,10,11')
			.split(',')
			.map((s) => s.trim())
			.filter((s) => s.length > 0);
		if (allowedLicenseIds.length === 0) {
			throw error(500, { message: 'license validation not configured' });
		}

		let timeoutId: ReturnType<typeof setTimeout> | null = null;
		try {
			const controller = new AbortController();
			timeoutId = setTimeout(() => controller.abort(), 10_000);

			const graphqlResponse = await fetch('https://api.printables.com/graphql/', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				signal: controller.signal,
				body: JSON.stringify({
					operationName: 'PrintDetail',
					query: `query PrintDetail($id: ID!) {
						print(id: $id) {
							id
							name
							license {
								id
								name
							}
						}
					}`,
					variables: { id: modelId }
				})
			});

			if (!graphqlResponse.ok) {
				return fail(400, {
					invalid_printables_url: true
				});
			}
			const graphqlData = await graphqlResponse.json();
			const license = graphqlData?.data?.print?.license;

			if (!license || !license.id) {
				return fail(400, {
					invalid_printables_url: true
				});
			}

			const licenseMatch = allowedLicenseIds.some((allowed) => allowed === license.id.toString());

			if (!licenseMatch) {
				return fail(400, {
					invalid_license: true
				});
			}
		} catch {
			return fail(400, {
				invalid_printables_url: true
			});
		} finally {
			if (timeoutId) clearTimeout(timeoutId);
		}

		// Editor URL
		const editorUrlExists = editorUrl && editorUrl.toString();

		const editorUrlString = editorUrlExists ? sanitizeUrl(editorUrl.toString()) : null;

		const editorUrlValid =
			editorUrlString && editorUrlString.trim().length < 8000 && isValidUrl(editorUrlString.trim());

		if (editorUrlExists && (!editorUrlValid || editorUrlString === 'about:blank')) {
			return fail(400, {
				invalid_editor_url: true
			});
		}

		// Editor file
		const editorFileExists = editorFile instanceof File && editorFile.size > 0;
		const editorFileValid = editorFileExists && editorFile.size <= MAX_UPLOAD_SIZE;

		if (!editorUrlExists && !editorFileExists) {
			throw error(400, { message: "editor file or url doesn't exist" });
		}

		if (editorUrlExists && editorFileExists) {
			throw error(400, { message: 'editor file or url both exist' });
		}

		if (editorFileExists && !editorFileValid) {
			return fail(400, {
				invalid_editor_file: true
			});
		}

		// Model file
		const modelFileValid =
			modelFile instanceof File &&
			modelFile.size > 0 &&
			modelFile.size <= MAX_UPLOAD_SIZE &&
			extname(modelFile.name).toLowerCase() == '.3mf' &&
			[
				'model/3mf',
				'application/vnd.ms-package.3dmanufacturing-3dmodel+xml',
				'application/vnd.ms-3mfdocument',
				'application/octet-stream',
				'text/plain'
			].includes(modelFile.type);

		if (!modelFileValid) {
			return fail(400, {
				invalid_model_file: true
			});
		}

		const [queriedProject] = await db
			.select({
				id: project.id,
				name: project.name,
				description: project.description,
				url: project.url,
				timeSpent: sql<number>`COALESCE(SUM(${devlog.timeSpent}), 0)`,
				devlogCount: sql<number>`COALESCE(COUNT(${devlog.id}), 0)`
			})
			.from(project)
			.leftJoin(devlog, and(eq(project.id, devlog.projectId), eq(devlog.deleted, false)))
			.where(
				and(
					eq(project.id, id),
					eq(project.userId, locals.user.id),
					eq(project.deleted, false),
					or(eq(project.status, 'building'), eq(project.status, 'rejected'))
				)
			)
			.groupBy(project.id, project.name, project.description, project.url)
			.limit(1);

		if (!queriedProject) {
			throw error(404, { message: 'project not found' });
		}

		// Make sure it has at least 1h
		if (queriedProject.timeSpent < 60) {
			throw error(400, { message: 'minimum 1h needed to ship' });
		}

		// Make sure it has at least 2 devlogs
		if (queriedProject.devlogCount < 2) {
			throw error(400, { message: 'minimum 2 journal logs required to ship' });
		}

		if (queriedProject.description == '') {
			throw error(400, { message: 'project must have a description' });
		}

		const useR2 = Boolean(env.S3_BUCKET_NAME && env.S3_API_URL && env.S3_ACCESS_KEY_ID && env.S3_SECRET_ACCESS_KEY);

		let editorFileUrl: string | null = null;
		let modelFileUrl: string | null = null;

		try {
			if (editorFileExists) {
				if (useR2) {
					const editorFilePath = `ships/editor-files/${crypto.randomUUID()}${extname(editorFile.name)}`;
					const editorFileCommand = new PutObjectCommand({
						Bucket: env.S3_BUCKET_NAME!,
						Key: editorFilePath,
						Body: Buffer.from(await editorFile.arrayBuffer())
					});
					await S3.send(editorFileCommand);
					editorFileUrl = editorFilePath;
				} else {
					const editorBlob = await put(
						`ships/editor-files/${crypto.randomUUID()}${extname(editorFile.name)}`,
						editorFile,
						{ access: 'public' }
					);
					editorFileUrl = editorBlob.url;
				}
			}

			if (useR2) {
				const modelPath = `ships/models/${crypto.randomUUID()}${extname(modelFile.name).toLowerCase()}`;
				const modelCommand = new PutObjectCommand({
					Bucket: env.S3_BUCKET_NAME!,
					Key: modelPath,
					Body: Buffer.from(await modelFile.arrayBuffer())
				});
				await S3.send(modelCommand);
				modelFileUrl = modelPath;
			} else {
				const modelBlob = await put(
					`ships/models/${crypto.randomUUID()}${extname(modelFile.name).toLowerCase()}`,
					modelFile,
					{ access: 'public' }
				);
				modelFileUrl = modelBlob.url;
			}
		} catch (err) {
			console.error('Ship submission failed [upload]:', err);
			return fail(500, {
				ship_submit_error: true,
				ship_error_message: 'Failed to upload ship assets. Please retry in a moment.'
			});
		}

		if (!editorFileUrl || !modelFileUrl) {
			console.error('Ship submission failed [upload-state]: missing uploaded file url(s)');
			return fail(500, {
				ship_submit_error: true,
				ship_error_message: 'Failed to prepare uploaded file URLs. Please retry.'
			});
		}

		try {
			await db
				.update(project)
				.set({
					status: 'submitted',
					url: printablesUrlString,
					editorFileType: editorUrlExists ? 'url' : 'upload',
					editorUrl: editorUrlExists ? editorUrlString : undefined,
					uploadedFileUrl: editorFileExists ? editorFileUrl : undefined,

					modelFile: modelFileUrl,
					doubleDippingWith
				})
				.where(
					and(
						eq(project.id, queriedProject.id),
						eq(project.userId, locals.user.id),
						eq(project.deleted, false)
					)
				);
		} catch (err) {
			console.error('Ship submission failed [db-project-update]:', err);
			return fail(500, {
				ship_submit_error: true,
				ship_error_message: 'Failed to save project ship state. Please retry.'
			});
		}

		// Get club ID if submitting as club
		let clubIdForShip: number | null = null;
		if (submitAsClub) {
			const [membership] = await db
				.select({ clubId: clubMembership.clubId })
				.from(clubMembership)
				.where(eq(clubMembership.userId, locals.user.id))
				.limit(1);
			if (membership) {
				clubIdForShip = membership.clubId;
			}
 		}

		try {
			await db.insert(ship).values({
				userId: locals.user.id,
				projectId: queriedProject.id,
				url: printablesUrlString,

				editorFileType: editorUrlExists ? 'url' : 'upload',
				editorUrl: editorUrlExists ? editorUrlString : undefined,
				uploadedFileUrl: editorFileExists ? editorFileUrl : undefined,

				modelFile: modelFileUrl,
				clubId: clubIdForShip
			});
		} catch (err) {
			console.error('Ship submission failed [db-ship-insert]:', err);
			return fail(500, {
				ship_submit_error: true,
				ship_error_message: 'Failed to create ship record in database. Please retry.'
			});
		}

		void sendSlackDM(
			locals.user.slackId,
			`Hii :hyper-dino-wave:\n Your project <https://construct.hackclub.com/dashboard/projects/${queriedProject.id}|${queriedProject.name}> has been shipped and is now under review, we'll take a look and get back to you soon! :woooo:`
		);

		return redirect(303, '/dashboard/projects');
	}
} satisfies Actions;
