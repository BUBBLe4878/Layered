import { db } from '$lib/server/db/index.js';
import { devlog, project, user, devlogLike, devlogView } from '$lib/server/db/schema.js';
import { desc, eq, count, sql, and, gte } from 'drizzle-orm';

export const DEVLOGS_PAGE_SIZE = 15;
export type SortType = 'newest' | 'trending' | 'random' | 'liked';

export async function fetchExploreDevlogs(
	offset: number,
	sort: SortType = 'newest',
	userId?: number,
	limit = DEVLOGS_PAGE_SIZE
) {
	console.log(`[fetchExploreDevlogs] Starting with sort=${sort}, offset=${offset}, userId=${userId}, limit=${limit}`);

	// Base select fields (consistent across all queries)
	// Use the original table references here (not aliases) for aggregates to work properly
	const selectFields = {
		devlog: {
			id: devlog.id,
			description: devlog.description,
			image: devlog.image,
			model: devlog.model,
			timeSpent: devlog.timeSpent,
			createdAt: devlog.createdAt
		},
		project: {
			id: project.id,
			name: project.name
		},
		user: {
			id: user.id,
			name: user.name
		},
		likeCount: count(devlogLike.id).as('likeCount'),
		viewCount: count(devlogView.id).as('viewCount'),
		userLiked: sql<boolean>`COUNT(CASE WHEN ${devlogLike.userId} = ${userId || null} THEN 1 END) > 0`.as(
			'userLiked'
		)
	};

	// Create an alias for the second join in 'liked' sort (to avoid duplicate table names)
	const devlogLikeForJoin = alias(devlogLike, 'devlog_like_for_join');

	let query;

	if (sort === 'newest') {
		console.log('[fetchExploreDevlogs] Building NEWEST query');
		query = db
			.select(selectFields)
			.from(devlog)
			.innerJoin(project, eq(devlog.projectId, project.id))
			.innerJoin(user, eq(devlog.userId, user.id))
			.leftJoin(devlogLike, eq(devlog.id, devlogLike.devlogId))
			.leftJoin(devlogView, eq(devlog.id, devlogView.devlogId))
			.where(eq(devlog.deleted, false))
			.groupBy(devlog.id, project.id, user.id)
			.orderBy(desc(devlog.createdAt), desc(devlog.id))
			.offset(offset)
			.limit(limit);
		console.log('[fetchExploreDevlogs] NEWEST query built');
	} else if (sort === 'trending') {
		console.log('[fetchExploreDevlogs] Building TRENDING query');
		const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
		console.log(`[fetchExploreDevlogs] Seven days ago: ${sevenDaysAgo.toISOString()}`);
		
		query = db
			.select(selectFields)
			.from(devlog)
			.innerJoin(project, eq(devlog.projectId, project.id))
			.innerJoin(user, eq(devlog.userId, user.id))
			.leftJoin(
				devlogLike,
				and(eq(devlog.id, devlogLike.devlogId), gte(devlogLike.createdAt, sevenDaysAgo))
			)
			.leftJoin(
				devlogView,
				and(eq(devlog.id, devlogView.devlogId), gte(devlogView.createdAt, sevenDaysAgo))
			)
			.where(eq(devlog.deleted, false))
			.groupBy(devlog.id, project.id, user.id)
			.orderBy(
				desc(
					sql`COALESCE(COUNT(DISTINCT ${devlogLike.id}), 0) + COALESCE(COUNT(DISTINCT ${devlogView.id}), 0)`
				),
				desc(devlog.createdAt)
			)
			.offset(offset)
			.limit(limit);
		console.log('[fetchExploreDevlogs] TRENDING query built');
	} else if (sort === 'random') {
		console.log('[fetchExploreDevlogs] Building RANDOM query');
		query = db
			.select(selectFields)
			.from(devlog)
			.innerJoin(project, eq(devlog.projectId, project.id))
			.innerJoin(user, eq(devlog.userId, user.id))
			.leftJoin(devlogLike, eq(devlog.id, devlogLike.devlogId))
			.leftJoin(devlogView, eq(devlog.id, devlogView.devlogId))
			.where(eq(devlog.deleted, false))
			.groupBy(devlog.id, project.id, user.id)
			.orderBy(sql`RANDOM()`)
			.offset(offset)
			.limit(limit);
		console.log('[fetchExploreDevlogs] RANDOM query built');
	} else if (sort === 'liked') {
		console.log('[fetchExploreDevlogs] Building LIKED query');
		if (!userId) {
			console.log('[fetchExploreDevlogs] No userId provided, returning empty result');
			query = db
				.select(selectFields)
				.from(devlog)
				.innerJoin(project, eq(devlog.projectId, project.id))
				.innerJoin(user, eq(devlog.userId, user.id))
				.leftJoin(devlogLike, eq(devlog.id, devlogLike.devlogId))
				.leftJoin(devlogView, eq(devlog.id, devlogView.devlogId))
				.where(eq(devlog.deleted, false))
				.groupBy(devlog.id, project.id, user.id)
				.limit(0);
		} else {
			console.log(`[fetchExploreDevlogs] Filtering likes by userId=${userId}`);
			// For 'liked' sort, we start from the user's likes, so we need an alias for the count join
			query = db
				.select(selectFields)
				.from(devlogLike)
				.innerJoin(devlog, eq(devlogLike.devlogId, devlog.id))
				.innerJoin(project, eq(devlog.projectId, project.id))
				.innerJoin(user, eq(devlog.userId, user.id))
				.leftJoin(devlogLikeForJoin, eq(devlog.id, devlogLikeForJoin.devlogId))
				.leftJoin(devlogView, eq(devlog.id, devlogView.devlogId))
				.where(and(eq(devlogLike.userId, userId), eq(devlog.deleted, false)))
				.groupBy(devlog.id, project.id, user.id)
				.orderBy(desc(devlog.createdAt))
				.offset(offset)
				.limit(limit);
		}
		console.log('[fetchExploreDevlogs] LIKED query built');
	} else {
		console.error(`[fetchExploreDevlogs] Unknown sort type: ${sort}`);
		throw new Error(`Unknown sort type: ${sort}`);
	}

	try {
		console.log('[fetchExploreDevlogs] Executing query...');
		const results = await query;
		console.log(`[fetchExploreDevlogs] Query returned ${results?.length || 0} results`);
		
		if (results && results.length > 0) {
			console.log('[fetchExploreDevlogs] First result sample:', {
				devlogId: results[0].devlog.id,
				projectName: results[0].project.name,
				likeCount: results[0].likeCount,
				viewCount: results[0].viewCount,
				userLiked: results[0].userLiked
			});
		}
		
		return results;
	} catch (err) {
		console.error('[fetchExploreDevlogs] Query execution failed:', err);
		throw err;
	}
}
