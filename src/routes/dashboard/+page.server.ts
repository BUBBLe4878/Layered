import { db } from '$lib/server/db/index.js';
import { user, project, devlog } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq, and, desc } from 'drizzle-orm';
import { withSlackProfile } from '$lib/server/slack';

export async function load({ params, locals }) {
	const id = Number(params.id);

	if (!id) {
		throw error(404);
	}

	// ─────────────────────────────────────────
	// USER
	// ─────────────────────────────────────────
	const requestedUser = await db
		.select()
		.from(user)
		.where(eq(user.id, id))
		.limit(1)
		.then(r => r[0]);

	if (!requestedUser) {
		throw error(404);
	}

	const slackUser = await withSlackProfile(requestedUser);

	// ─────────────────────────────────────────
	// PROJECTS
	// ─────────────────────────────────────────
	const projects = await db
		.select({
			id: project.id,
			name: project.name,
			url: project.url
		})
		.from(project)
		.where(and(eq(project.userId, id), eq(project.deleted, false)));

	// ─────────────────────────────────────────
	// DEVLOGS
	// ─────────────────────────────────────────
	const devlogs = await db
		.select({
			id: devlog.id,
			projectId: devlog.projectId,
			projectName: project.name,
			description: devlog.description,
			timeSpent: devlog.timeSpent,
			image: devlog.image,
			model: devlog.model,
			createdAt: devlog.createdAt
		})
		.from(devlog)
		.innerJoin(project, eq(devlog.projectId, project.id))
		.where(
			and(
				eq(devlog.userId, id),
				eq(devlog.deleted, false),
				eq(project.deleted, false)
			)
		)
		.orderBy(desc(devlog.createdAt));

	// ─────────────────────────────────────────
	// RETURN (CLEAN CONTRACT)
	// ─────────────────────────────────────────
	return {
		requestedUser: {
			id: slackUser.id,
			slackId: slackUser.slackId,
			profilePicture: slackUser.profilePicture,
			name: slackUser.name,

			isPrinter: slackUser.isPrinter,
			hasT1Review: slackUser.hasT1Review,
			hasT2Review: slackUser.hasT2Review,
			hasAdmin: slackUser.hasAdmin,

			shopScore: slackUser.shopScore,

			// 🔥 IMPORTANT (your Benchy fix)
			clay: slackUser.clay ?? 0,
			brick: slackUser.brick ?? 0,

			createdAt: slackUser.createdAt,
			lastLoginAt:
				locals.user?.id === slackUser.id
					? slackUser.lastLoginAt
					: null
		},

		projects,
		devlogs
	};
}
