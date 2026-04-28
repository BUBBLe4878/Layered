import { DEVLOGS_PAGE_SIZE, fetchExploreDevlogs, type SortType } from './devlogs.js';
import { error as svelteError, json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { user, devlog, devlogLike, project } from '$lib/server/db/schema.js';
import { eq, and, sql } from 'drizzle-orm';

export async function load({ url, locals }) {
	console.log('[explore/+page.server.ts] Load starting');

	const sortParam = url.searchParams.get('sort') as SortType | null;
	const sort: SortType = sortParam || 'newest';

	console.log(`[explore/+page.server.ts] Sort: ${sort}`);
	console.log(`[explore/+page.server.ts] User ID: ${locals.user?.id}`);

	try {
		const devlogs = await fetchExploreDevlogs(0, sort, locals.user?.id);

		if (!Array.isArray(devlogs)) {
			throw new Error('Devlogs not an array');
		}

		const hasMore = devlogs.length === DEVLOGS_PAGE_SIZE;

		// -----------------------------
		// LEADERBOARD QUERY (FIXED)
		// -----------------------------
		const leaderboardRaw = await db
			.select({
				id: user.id,
				name: user.name,
		
				totalHours: sql<number>`COALESCE(SUM(COALESCE(${devlog.timeSpent}, 0)), 0)`,
				totalLogs: sql<number>`COUNT(DISTINCT ${devlog.id})`,
				totalLikes: sql<number>`COUNT(DISTINCT ${devlogLike.id})`,
				totalProjects: sql<number>`COUNT(DISTINCT ${project.id})`,
				totalClay: sql<number>`COALESCE(${user.clay}, 0)`
			})
			.from(user)
			.leftJoin(devlog, eq(devlog.userId, user.id))
			.leftJoin(devlogLike, eq(devlogLike.userId, user.id))
			.leftJoin(project, eq(project.userId, user.id))
			.groupBy(user.id, user.name);
		
		const leaderboard = leaderboardRaw
			.map((u) => {
				const hours = (Number(u.totalHours ?? 0)/10);
				const logs = Number(u.totalLogs ?? 0);
				const likes = Number(u.totalLikes ?? 0);
				const projects = Number(u.totalProjects ?? 0);

				const score =
				    hours * 0.4 +
				    logs * 0.35 +
				    likes * 0.25;

				return {
					...u,
					totalHours: hours,
					totalLogs: logs,
					totalLikes: likes,
					totalProjects: projects,
					score
				};
			})
			.sort((a, b) => b.score - a.score);

		console.log(`[explore] leaderboard size: ${leaderboard.length}`);

		return {
			devlogs,
			nextOffset: devlogs.length,
			hasMore,
			leaderboard
		};
	} catch (err) {
		console.error('[explore/+page.server.ts] Load failed:', err);
		throw svelteError(
			500,
			`Failed to load explore: ${err instanceof Error ? err.message : String(err)}`
		);
	}
}
export const actions = {
	toggleLike: async ({ request, locals }) => {
		console.log('[explore/+page.server.ts] toggleLike action starting');
		console.log(`[explore/+page.server.ts] User ID: ${locals.user?.id}`);
		
		if (!locals.user?.id) {
			console.log('[explore/+page.server.ts] User not authenticated');
			return {
				success: false,
				error: 'Not authenticated'
			};
		}

		const form = await request.formData();
		const raw = form.get('devlogId');
		const devlogId = Number(raw);
		
		console.log(`[explore/+page.server.ts] Raw devlogId: ${raw}, parsed: ${devlogId}`);

		if (!devlogId || Number.isNaN(devlogId)) {
			console.log('[explore/+page.server.ts] Invalid devlogId');
			return {
				success: false,
				error: 'Invalid devlogId'
			};
		}

		try {
			console.log(`[explore/+page.server.ts] Checking if user already liked devlog ${devlogId}`);
			const existing = await db
				.select()
				.from(devlogLike)
				.where(
					and(
						eq(devlogLike.devlogId, devlogId),
						eq(devlogLike.userId, locals.user.id)
					)
				);

			const alreadyLiked = existing.length > 0;
			console.log(`[explore/+page.server.ts] Already liked: ${alreadyLiked}`);

			if (alreadyLiked) {
				console.log(`[explore/+page.server.ts] Deleting like for devlog ${devlogId}`);
				await db
					.delete(devlogLike)
					.where(
						and(
							eq(devlogLike.devlogId, devlogId),
							eq(devlogLike.userId, locals.user.id)
						)
					);
			} else {
				console.log(`[explore/+page.server.ts] Inserting like for devlog ${devlogId}`);
				await db.insert(devlogLike).values({
					devlogId,
					userId: locals.user.id
				});
			}

			// Count likes
			console.log(`[explore/+page.server.ts] Counting likes for devlog ${devlogId}`);
			const likeCount = (
				await db
					.select({ id: devlogLike.id })
					.from(devlogLike)
					.where(eq(devlogLike.devlogId, devlogId))
			).length;

			console.log(`[explore/+page.server.ts] Final like count: ${likeCount}`);

			return {
				success: true,
				liked: !alreadyLiked,
				likeCount
			};
		} catch (err) {
			console.error('[explore/+page.server.ts] toggleLike error:', err);
			return {
				success: false,
				error: `Database error: ${err instanceof Error ? err.message : String(err)}`
			};
		}
	}
};
