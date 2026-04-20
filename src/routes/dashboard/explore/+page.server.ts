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
		if (!locals.user?.id) {
			return {
				success: false,
				error: 'Not authenticated'
			};
		}

		const form = await request.formData();
		const raw = form.get('devlogId');
		const devlogId = Number(raw);

		if (!devlogId || Number.isNaN(devlogId)) {
			return {
				success: false,
				error: 'Invalid devlogId'
			};
		}

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

			const alreadyLiked = existing.length > 0;

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

			// count likes (safe version)
			const likeCount = (
				await db
					.select({ id: devlogLike.id })
					.from(devlogLike)
					.where(eq(devlogLike.devlogId, devlogId))
			).length;

			return {
				success: true,
				liked: !alreadyLiked,
				likeCount
			};
		} catch (err) {
			console.error(err);

			return {
				success: false,
				error: 'Database error'
			};
		}
	}
};
