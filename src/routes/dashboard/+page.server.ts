import { db } from '$lib/server/db/index.js';
import { project, devlog } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq, ne, and, count } from 'drizzle-orm';

export async function load({ locals }) {
	if (!locals.user) {
		throw error(500);
	}

	const [{ projectCount }] = await db
		.select({ projectCount: count() })
		.from(project)
		.where(and(eq(project.userId, locals.user.id), eq(project.deleted, false)));

	const [{ devlogCount }] = await db
		.select({ devlogCount: count() })
		.from(devlog)
		.where(and(eq(devlog.userId, locals.user.id), eq(devlog.deleted, false)));

	const [{ shipCount }] = await db
		.select({ shipCount: count() })
		.from(project)
		.where(
			and(
				eq(project.userId, locals.user.id),
				ne(project.status, 'building'),
				eq(project.deleted, false)
			)
		);

	return {
		projectCount: projectCount ?? 0,
		devlogCount: devlogCount ?? 0,
		shipCount: shipCount ?? 0,

		// ✅ ADD THIS (fixes Benchy)
		requestedUser: {
			id: locals.user.id,
			clay: locals.user.clay ?? 0,
			brick: locals.user.brick ?? 0
		}
	};
}
