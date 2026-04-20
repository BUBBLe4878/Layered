export const actions = {
	toggleLike: async ({ request, locals }) => {
		// 🔐 auth guard
		if (!locals.user?.id) {
			return {
				success: false,
				error: 'Not authenticated'
			};
		}

		const form = await request.formData();
		const raw = form.get('devlogId');

		const devlogId = Number(raw);

		// 🛑 validation
		if (!devlogId || Number.isNaN(devlogId)) {
			return {
				success: false,
				error: 'Invalid devlogId'
			};
		}

		try {
			// check existing like
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

			// toggle like/unlike
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
				.select({ count: sql<number>`count(*)` })
				.from(devlogLike)
				.where(eq(devlogLike.devlogId, devlogId));

			const likeCount = Number(likeCountResult[0]?.count ?? 0);

			return {
				success: true,
				liked: !alreadyLiked,
				likeCount
			};
		} catch (err) {
			console.error('toggleLike error:', err);

			return {
				success: false,
				error: 'Database error'
			};
		}
	}
};
