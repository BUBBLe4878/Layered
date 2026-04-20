import { DEVLOGS_PAGE_SIZE, fetchExploreDevlogs, type SortType } from './devlogs.js';
import { error as svelteError, json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { devlogLike } from '$lib/server/db/schema.js';
import { eq, and, sql } from 'drizzle-orm';

export async function load({ url, locals }) {
	const sortParam = url.searchParams.get('sort') as SortType | null;
	const sort: SortType = sortParam || 'newest';

	try {
		const devlogs = await fetchExploreDevlogs(0, sort, locals.user?.id);

		if (!Array.isArray(devlogs)) {
			throw new Error('Devlogs not an array');
		}

		return {
			devlogs,
			nextOffset: devlogs.length,
			hasMore: devlogs.length === DEVLOGS_PAGE_SIZE
		};
	} catch (err) {
		throw svelteError(500, 'Failed to load explore');
	}
}

export const actions = {
	toggleLike: async ({ request, locals }) => {
		// 🔐 auth check
		if (!locals.user?.id) {
			return json({
				success: false,
				error: 'Not authenticated'
			});
		}

		const form = await request.formData();
		const raw = form.get('devlogId');

		const devlogId = Number(raw);

		// 🛑 validation
		if (!devlogId || Number.isNaN(devlogId)) {
			return json({
				success: false,
				error: 'Invalid devlogId'
			});
		}

		try {
			// check if like exists
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

			// toggle DB state
			if (alreadyLiked) {
				await db
					.delete(devlogLike)
					.where(
						and(
							eq(devlogLike.devlogId, devlogId),
							eq(devlogLike.userId, locals.user.id)
						)
					);
			} else {
				await db.insert(devlogLike).values({
					devlogId,
					userId: locals.user.id
				});
			}

			// 🔥 ALWAYS get real count from DB (fixes 2→4 bug)
			const likeCountResult = await db
				.select({ count: devlogLike.id })
				.from(devlogLike)
				.where(eq(devlogLike.devlogId, devlogId));
			
			const likeCount = likeCountResult.length;

			return json({
				success: true,
				liked: !alreadyLiked,
				likeCount
			});
		} catch (err) {
			console.error('toggleLike error:', err);

			return json({
				success: false,
				error: 'Database error'
			});
		}
	}
};
