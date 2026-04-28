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
	// Base select fields (consistent across all queries)
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

	if (sort === 'newest') {
		return db
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
	} else if (sort === 'trending') {
		// Trending: most likes + views in last 7 days
		const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
		return db
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
	} else if (sort === 'random') {
		return db
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
	} else if (sort === 'liked') {
		// Only show devlogs liked by the current user
		if (!userId) {
			// Return empty result if not authenticated
			return db
				.select(selectFields)
				.from(devlog)
				.innerJoin(project, eq(devlog.projectId, project.id))
				.innerJoin(user, eq(devlog.userId, user.id))
				.leftJoin(devlogLike, eq(devlog.id, devlogLike.devlogId))
				.leftJoin(devlogView, eq(devlog.id, devlogView.devlogId))
				.where(eq(devlog.deleted, false))
				.groupBy(devlog.id, project.id, user.id)
				.limit(0);
		}
		return db
			.select(selectFields)
			.from(devlogLike)
			.innerJoin(devlog, eq(devlogLike.devlogId, devlog.id))
			.innerJoin(project, eq(devlog.projectId, project.id))
			.innerJoin(user, eq(devlog.userId, user.id))
			.leftJoin(devlogLike, eq(devlog.id, devlogLike.devlogId))
			.leftJoin(devlogView, eq(devlog.id, devlogView.devlogId))
			.where(and(eq(devlogLike.userId, userId), eq(devlog.deleted, false)))
			.groupBy(devlog.id, project.id, user.id)
			.orderBy(desc(devlog.createdAt))
			.offset(offset)
			.limit(limit);
	}

	// Fallback (should never reach)
	throw new Error(`Unknown sort type: ${sort}`);
}
