import { db } from '$lib/server/db/index.js';
import { project, devlog, user } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq, ne, and, count } from 'drizzle-orm';
import { withSlackProfile } from '$lib/server/slack';

export async function load({ locals }) {
	console.log('[dashboard] load start');
	console.log('[dashboard] locals.user:', locals.user);
	
	try {
		if (!locals.user) {
			console.error('[dashboard] NO LOCALS USER');
			throw error(401, 'Unauthorized');
		}

		console.log('[dashboard] fetching db user...');
		const dbUser = await db
			.select()
			.from(user)
			.where(eq(user.id, locals.user.id))
			.limit(1)
			.then(r => r[0]);

		console.log('[dashboard] dbUser:', dbUser);

		if (!dbUser) {
			console.error('[dashboard] USER NOT FOUND IN DB');
			throw error(404, 'User not found');
		}

		console.log('[dashboard] calling slack profile...');
		const slackUser = await withSlackProfile(dbUser);
		console.log('[dashboard] slackUser:', slackUser);

		console.log('[dashboard] counting projects...');
		const projectCount = await db
			.select({ count: count() })
			.from(project)
			.where(and(eq(project.userId, locals.user.id), eq(project.deleted, false)))
			.then(r => r[0]?.count ?? 0);
		console.log('[dashboard] projectCount:', projectCount);

		console.log('[dashboard] counting devlogs...');
		const devlogCount = await db
			.select({ count: count() })
			.from(devlog)
			.where(and(eq(devlog.userId, locals.user.id), eq(devlog.deleted, false)))
			.then(r => r[0]?.count ?? 0);
		console.log('[dashboard] devlogCount:', devlogCount);

		console.log('[dashboard] counting ships...');
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
		console.log('[dashboard] shipCount:', shipCount);

		console.log('[dashboard] returning payload');
		return {
			user: {
				id: slackUser.id,
				name: slackUser.name,
				profilePicture: slackUser.profilePicture,
				benchies: slackUser.benchies ?? 0,
				layer: slackUser.layer ?? 0,
				isPrinter: slackUser.isPrinter,
				hasAdmin: slackUser.hasAdmin
			},
			stats: {
				projectCount,
				devlogCount,
				shipCount
			}
		};
	} catch (err) {
		console.error('[dashboard] FATAL ERROR:', err);
		throw err;
	}
}
