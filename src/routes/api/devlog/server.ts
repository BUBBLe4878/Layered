// This goes in: src/routes/api/devlog/+server.ts

import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db/index';
import { devlogLike } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	const { action, devlogId } = await request.json();

	if (action === 'like') {
		try {
			await db.insert(devlogLike).values({
				devlogId,
				userId: locals.user.id
			});
			return json({ success: true, liked: true });
		} catch (error) {
			return json({ error: 'Already liked' }, { status: 400 });
		}
	}

	if (action === 'unlike') {
		await db.delete(devlogLike).where(
			and(
				eq(devlogLike.devlogId, devlogId),
				eq(devlogLike.userId, locals.user.id)
			)
		);
		return json({ success: true, liked: false });
	}

	return json({ error: 'Invalid action' }, { status: 400 });
};
