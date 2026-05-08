import { error as svelteError } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import {
  project, user, devlog, devlogLike, devlogComment } from '$lib/server/db/schema.js';
import { eq, desc, count, sql, and } from 'drizzle-orm';

export async function load({ params, locals }) {
  const projectId = Number(params.id);
  if (!projectId || isNaN(projectId)) throw svelteError(400, 'Invalid project ID');

  try {
    //comment for redeploy
    // Project + author
    const projectResult = await db
      .select({
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        url: project.url,
        editorUrl: project.editorUrl,
        createdAt: project.createdAt,
        userId: project.userId,
        authorName: user.name
      })
      .from(project)
      .innerJoin(user, eq(project.userId, user.id))
      .where(eq(project.id, projectId))
      .limit(1);

    if (!projectResult.length) throw svelteError(404, 'Project not found');
    const projectData = projectResult[0];

    // Devlogs for this project
    const devlogs = await db
      .select({
        id: devlog.id,
        description: devlog.description,
        image: devlog.image,
        timeSpent: devlog.timeSpent,
        createdAt: devlog.createdAt,
        likeCount: count(devlogLike.id),
        userLiked: sql<boolean>`COUNT(CASE WHEN ${devlogLike.userId} = ${locals.user?.id ?? null} THEN 1 END) > 0`
      })
      .from(devlog)
      .leftJoin(devlogLike, eq(devlog.id, devlogLike.devlogId))
      .where(and(eq(devlog.projectId, projectId), eq(devlog.deleted, false)))
      .groupBy(devlog.id)
      .orderBy(desc(devlog.createdAt));

    // Comments across all devlogs in this project
    const comments = await db
      .select({
        id: devlogComment.id,
        comment: devlogComment.comment,
        createdAt: devlogComment.createdAt,
        devlogId: devlogComment.devlogId,
        devlogDescription: devlog.description,
        authorId: user.id,
        authorName: user.name
      })
      .from(devlogComment)
      .innerJoin(devlog, eq(devlogComment.devlogId, devlog.id))
      .innerJoin(user, eq(devlogComment.userId, user.id))
      .where(eq(devlog.projectId, projectId))
      .orderBy(desc(devlogComment.createdAt))  
      .limit(50);

    const totalHours = devlogs.reduce((s, d) => s + (d.timeSpent ?? 0), 0) / 600;

    return {
      project: projectData,
      devlogs,
      comments,
      totalHours,
      isOwner: locals.user?.id === projectData.userId,
      currentUserId: locals.user?.id ?? null,
      reactions: [],
    };
  } catch (err) {
    if ((err as any).status) throw err;
    throw svelteError(500, `Failed to load: ${err instanceof Error ? err.message : String(err)}`);
  }
}

export const actions = {
  addComment: async ({ request, locals, params }) => {
    if (!locals.user?.id) return { success: false, error: 'Not authenticated' };
    const form = await request.formData();
    const comment = String(form.get('comment') ?? '').trim();
    const devlogId = Number(form.get('devlogId'));
    if (!comment) return { success: false, error: 'Comment is empty' };
    if (!devlogId || isNaN(devlogId)) return { success: false, error: 'Invalid devlogId' };
    try {
      await db.insert(devlogComment).values({ comment, devlogId, userId: locals.user.id });
      return { success: true };
    } catch (err) {
      return { success: false, error: `DB error: ${err instanceof Error ? err.message : String(err)}` };
    }
  }
};