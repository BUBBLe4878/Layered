import { db } from '$lib/server/db/index.js';
import { project, devlog, user } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq, ne, and, count } from 'drizzle-orm';
import { withSlackProfile } from '$lib/server/slack';

export async function load({ locals }) {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	// ─────────────────────────────────────────
	// fresh user (optional but safer than stale locals)
	// ─────────────────────────────────────────
	const dbUser = await db
		.select()
		.from(user)
		.where(eq(user.id, locals.user.id))
		.limit(1)
		.then(r => r[0]);

	if (!dbUser) {
		throw error(404, 'User not found');
	}

	const slackUser = await withSlackProfile(dbUser);

	// ─────────────────────────────────────────
	// PROJECT COUNT
	// ─────────────────────────────────────────
	const projectCount = await db
		.select({ count: count() })
		.from(project)
		.where(
			and(
				eq(project.userId, locals.user.id),
				eq(project.deleted, false)
			)
		)
		.then(r => r[0]?.count ?? 0);

	// ─────────────────────────────────────────
	// DEVLOG COUNT
	// ─────────────────────────────────────────
	const devlogCount = await db
		.select({ count: count() })
		.from(devlog)
		.where(
			and(
				eq(devlog.userId, locals.user.id),
				eq(devlog.deleted, false)
			)
		)
		.then(r => r[0]?.count ?? 0);

	// ─────────────────────────────────────────
	// SHIP COUNT
	// ─────────────────────────────────────────
	const shipCount = await db
		.select({ count: count() })
		.from(project)
		.where(
			and(
				eq(project.userId, locals.user.id),
				ne(project.status, 'building'),
				eq(project.deleted, false)
			)
		)
		.then(r => r[0]?.count ?? 0);

	// ─────────────────────────────────────────
	// RETURN CONTRACT (matches Benchy)
	// ─────────────────────────────────────────
	return {
		requestedUser: {
			id: slackUser.id,
			name: slackUser.name,
			profilePicture: slackUser.profilePicture,

			clay: slackUser.clay ?? 0,
			brick: slackUser.brick ?? 0,

			isPrinter: slackUser.isPrinter,
			hasAdmin: slackUser.hasAdmin,

			shopScore: slackUser.shopScore,
			lastLoginAt: slackUser.lastLoginAt
		},

		stats: {
			projectCount,
			devlogCount,
			shipCount
		}
	};
}
