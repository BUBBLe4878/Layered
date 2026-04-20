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
	const baseQuery = db
		.select({
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
		})
		.from(devlog)
		.innerJoin(project, eq(devlog.projectId, project.id))
		.innerJoin(user, eq(devlog.userId, user.id))
		.leftJoin(devlogLike, eq(devlog.id, devlogLike.devlogId))
		.leftJoin(devlogView, eq(devlog.id, devlogView.devlogId))
		.where(eq(devlog.deleted, false))
		.groupBy(devlog.id, project.id, user.id);

	let query = baseQuery;

	if (sort === 'newest') {
		query = query.orderBy(desc(devlog.createdAt), desc(devlog.id));
	} else if (sort === 'trending') {
		// Trending: most views/likes in last 7 days
		const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
		query = db
			.select({
				devlog: baseQuery._.selectedFields.devlog,
				project: baseQuery._.selectedFields.project,
				user: baseQuery._.selectedFields.user,
				likeCount: baseQuery._.selectedFields.likeCount,
				viewCount: baseQuery._.selectedFields.viewCount,
				userLiked: baseQuery._.selectedFields.userLiked
			})
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
				desc(sql`COUNT(${devlogLike.id}) + COUNT(${devlogView.id})`),
				desc(devlog.createdAt)
			);
	} else if (sort === 'random') {
		query = query.orderBy(sql`RANDOM()`);
	} else if (sort === 'liked') {
		// Only show devlogs liked by the user
		query = db
			.select({
				devlog: baseQuery._.selectedFields.devlog,
				project: baseQuery._.selectedFields.project,
				user: baseQuery._.selectedFields.user,
				likeCount: baseQuery._.selectedFields.likeCount,
				viewCount: baseQuery._.selectedFields.viewCount,
				userLiked: baseQuery._.selectedFields.userLiked
			})
			.from(devlogLike)
			.innerJoin(devlog, eq(devlogLike.devlogId, devlog.id))
			.innerJoin(project, eq(devlog.projectId, project.id))
			.innerJoin(user, eq(devlog.userId, user.id))
			.leftJoin(
				devlogLike,
				eq(devlog.id, devlogLike.devlogId)
			)
			.where(and(eq(devlogLike.userId, userId || -1), eq(devlog.deleted, false)))
			.groupBy(devlog.id, project.id, user.id)
			.orderBy(desc(devlog.createdAt));
	}

	return query.offset(offset).limit(limit);
}
