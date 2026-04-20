import { DEVLOGS_PAGE_SIZE, fetchExploreDevlogs, type SortType } from './devlogs.js';
import { error as svelteError } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { devlogLike } from '$lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';

export async function load({ url, locals }) {
	console.log('🔍 [Load] Starting explore page load');
	
	const sortParam = url.searchParams.get('sort') as SortType | null;
	const sort: SortType = sortParam || 'newest';
	console.log('🔍 [Load] Sort:', sort, 'User:', locals.user?.id);

	try {
		console.log('🔍 [Load] Calling fetchExploreDevlogs with sort:', sort);
		const devlogs = await fetchExploreDevlogs(0, sort, locals.user?.id);
		
		console.log('🔍 [Load] Got result:', {
			isArray: Array.isArray(devlogs),
			length: Array.isArray(devlogs) ? devlogs.length : 'N/A',
			type: typeof devlogs
		});

		if (!Array.isArray(devlogs)) {
			console.error('❌ [Load] devlogs is not an array:', devlogs);
			throw new Error(`Expected array, got ${typeof devlogs}`);
		}

		const nextOffset = devlogs.length;
		const hasMore = devlogs.length === DEVLOGS_PAGE_SIZE;

		console.log('🔍 [Load] Returning data:', { 
			devlogsCount: devlogs.length, 
			nextOffset, 
			hasMore 
		});

		return {
			devlogs,
			nextOffset,
			hasMore
		};
	} catch (err) {
		console.error('❌ [Load] Error:', err);
		const msg = err instanceof Error ? err.message : String(err);
		console.error('❌ [Load] Full stack:', err);
		throw svelteError(500, `Failed to load explore: ${msg}`);
	}
}

// Add this export to +page.server.ts
export const actions = {
	toggleLike: async ({ request, locals }) => {
		console.log('🔵 toggleLike action called');
		console.log('User ID:', locals.user?.id);
		
		if (!locals.user?.id) {
			console.log('❌ No user ID');
			return { error: 'Not authenticated' };
		}

		const data = await request.formData();
		const devlogId = parseInt(data.get('devlogId') as string);
		console.log('📌 Like/Unlike devlog:', devlogId);
		
		try {
			const existing = await db
				.select()
				.from(devlogLike)
				.where(
					and(
						eq(devlogLike.devlogId, devlogId),
						eq(devlogLike.userId, locals.user.id)
					)
				);
			
			console.log('Found existing:', existing.length > 0);
			
			if (existing.length > 0) {
				console.log('🗑️ Deleting like');
				await db
					.delete(devlogLike)
					.where(
						and(
							eq(devlogLike.devlogId, devlogId),
							eq(devlogLike.userId, locals.user.id)
						)
					);
			} else {
				console.log('➕ Inserting like');
				await db.insert(devlogLike).values({
					devlogId,
					userId: locals.user.id
				});
			}
			
			return { success: true };
		} catch (err) {
			console.error('❌ Like toggle error:', err);
			return { error: 'Failed to toggle like' };
		}
	}
};
