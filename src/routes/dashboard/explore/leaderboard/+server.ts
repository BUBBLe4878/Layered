import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { devlog, devlogLike, project, user } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function GET() {
	// Aggregate per user
	const results = await db
		.select({
			userId: user.id,
			name: user.name,

			// raw stats
			totalHours: sql<number>`COALESCE(SUM(${devlog.timeSpent}), 0) / 60`,
			totalLogs: sql<number>`COUNT(DISTINCT ${devlog.id})`,
			totalLikes: sql<number>`COUNT(DISTINCT ${devlogLike.id})`,
			totalProjects: sql<number>`COUNT(DISTINCT ${project.id})`
		})
		.from(user)
		.leftJoin(devlog, eq(devlog.userId, user.id))
		.leftJoin(devlogLike, eq(devlogLike.userId, user.id))
		.leftJoin(project, eq(project.userId, user.id))
		.groupBy(user.id);

	// compute weighted score in JS (simple + readable)
	const leaderboard = results.map((u) => {
		const score =
			u.totalHours * 0.5 +
			u.totalLogs * 0.2 +
			u.totalLikes * 0.2 +
			u.totalProjects * 0.1;

		return {
			...u,
			score
		};
	});

	// sort descending
	leaderboard.sort((a, b) => b.score - a.score);

	return json({ leaderboard });
}
