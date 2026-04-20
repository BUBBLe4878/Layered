import { DEVLOGS_PAGE_SIZE, fetchExploreDevlogs, type SortType } from './devlogs.js';
import { error as svelteError } from '@sveltejs/kit';

export async function load({ url, locals }) {
	console.log('🔍 [Explore Load] Starting...');
	
	try {
		console.log('🔍 [Explore Load] Fetching devlogs (simple test)...');
		
		// Simple test - just get the newest devlogs without any joins
		const { db } = await import('$lib/server/db/index.js');
		const { devlog, project, user } = await import('$lib/server/db/schema.js');
		const { eq, desc } = await import('drizzle-orm');
		
		const devlogs = await db
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
				likeCount: 0,
				viewCount: 0,
				userLiked: false
			})
			.from(devlog)
			.innerJoin(project, eq(devlog.projectId, project.id))
			.innerJoin(user, eq(devlog.userId, user.id))
			.where(eq(devlog.deleted, false))
			.orderBy(desc(devlog.createdAt))
			.limit(DEVLOGS_PAGE_SIZE);

		console.log('🔍 [Explore Load] Got devlogs:', devlogs.length);
		
		return {
			devlogs,
			nextOffset: devlogs.length,
			hasMore: devlogs.length === DEVLOGS_PAGE_SIZE
		};
	} catch (err) {
		console.error('❌ [Explore Load] Error:', err);
		const errorMsg = err instanceof Error ? err.message : String(err);
		console.error('❌ [Explore Load] Full error:', err);
		throw svelteError(500, `Failed to load devlogs: ${errorMsg}`);
	}
}
