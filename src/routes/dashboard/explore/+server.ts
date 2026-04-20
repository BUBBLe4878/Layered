// src/routes/explore/+server.ts (or a +page.server.ts action)
import { db } from '$lib/server/db/index.js';
import { devlogLike } from '$lib/server/db/schema.js';
import { eq, and } from 'drizzle-orm';

export const actions = {
  toggleLike: async ({ request, locals }) => {
    if (!locals.user?.id) {
      return { error: 'Not authenticated' };
    }

    const data = await request.formData();
    const devlogId = parseInt(data.get('devlogId') as string);

    try {
      // Check if already liked
      const existing = await db
        .select()
        .from(devlogLike)
        .where(
          and(
            eq(devlogLike.devlogId, devlogId),
            eq(devlogLike.userId, locals.user.id)
          )
        );

      if (existing.length > 0) {
        // Unlike
        await db
          .delete(devlogLike)
          .where(
            and(
              eq(devlogLike.devlogId, devlogId),
              eq(devlogLike.userId, locals.user.id)
            )
          );
      } else {
        // Like
        await db.insert(devlogLike).values({
          devlogId,
          userId: locals.user.id
        });
      }

      return { success: true };
    } catch (err) {
      console.error('Like toggle error:', err);
      return { error: 'Failed to toggle like' };
    }
  }
};
