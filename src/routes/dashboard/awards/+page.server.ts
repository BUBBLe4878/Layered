import { db } from '$lib/server/db/index.js';
import {
	user,
	weeklyAwardCategory,
	weeklyAwardFinalist,
	weeklyAwardRound,
	weeklyAwardVote
} from '$lib/server/db/schema.js';
import { error, fail } from '@sveltejs/kit';
import { and, desc, eq, inArray, sql } from 'drizzle-orm';
import type { Actions } from './$types';

function parsePositiveInt(value: FormDataEntryValue | null): number | null {
	if (!value) return null;
	const parsed = Number.parseInt(value.toString(), 10);
	if (!Number.isInteger(parsed) || parsed <= 0) return null;
	return parsed;
}

export async function load({ locals }) {
	if (!locals.user) {
		throw error(401, { message: 'Unauthorized' });
	}

	const [activeRound] = await db
		.select({
			id: weeklyAwardRound.id,
			label: weeklyAwardRound.label,
			weekStart: weeklyAwardRound.weekStart
		})
		.from(weeklyAwardRound)
		.where(eq(weeklyAwardRound.votingOpen, true))
		.orderBy(desc(weeklyAwardRound.weekStart))
		.limit(1);

	if (!activeRound) {
		return {
			activeRound: null,
			categories: [],
			votesByCategory: {}
		};
	}

	const categories = await db
		.select({
			id: weeklyAwardCategory.id,
			name: weeklyAwardCategory.name,
			description: weeklyAwardCategory.description,
			bonusLayers: weeklyAwardCategory.bonusLayers
		})
		.from(weeklyAwardCategory)
		.where(eq(weeklyAwardCategory.roundId, activeRound.id));

	const categoryIds = categories.map((category) => category.id);

	if (categoryIds.length === 0) {
		return {
			activeRound,
			categories: [],
			votesByCategory: {}
		};
	}

	const finalists = await db
		.select({
			id: weeklyAwardFinalist.id,
			categoryId: weeklyAwardFinalist.categoryId,
			reason: weeklyAwardFinalist.reason,
			user: {
				id: user.id,
				name: user.name,
				profilePicture: user.profilePicture
			}
		})
		.from(weeklyAwardFinalist)
		.leftJoin(user, eq(user.id, weeklyAwardFinalist.userId))
		.where(inArray(weeklyAwardFinalist.categoryId, categoryIds));

	const voteCounts = await db
		.select({
			finalistId: weeklyAwardVote.finalistId,
			voteCount: sql<number>`COUNT(*)`
		})
		.from(weeklyAwardVote)
		.where(inArray(weeklyAwardVote.categoryId, categoryIds))
		.groupBy(weeklyAwardVote.finalistId);

	const myVotes = await db
		.select({
			categoryId: weeklyAwardVote.categoryId,
			finalistId: weeklyAwardVote.finalistId
		})
		.from(weeklyAwardVote)
		.where(
			and(
				eq(weeklyAwardVote.voterUserId, locals.user.id),
				inArray(weeklyAwardVote.categoryId, categoryIds)
			)
		);

	const voteCountByFinalist = new Map(voteCounts.map((row) => [row.finalistId, Number(row.voteCount)]));
	const myVoteByCategory = Object.fromEntries(myVotes.map((vote) => [vote.categoryId, vote.finalistId]));

	const finalistsByCategory = new Map<number, Array<(typeof finalists)[number] & { voteCount: number }>>();
	for (const finalist of finalists) {
		const current = finalistsByCategory.get(finalist.categoryId) ?? [];
		current.push({
			...finalist,
			voteCount: voteCountByFinalist.get(finalist.id) ?? 0
		});
		finalistsByCategory.set(finalist.categoryId, current);
	}

	return {
		activeRound,
		categories: categories.map((category) => ({
			...category,
			finalists: finalistsByCategory.get(category.id) ?? []
		})),
		votesByCategory: myVoteByCategory
	};
}

export const actions = {
	vote: async ({ locals, request }) => {
		if (!locals.user) {
			throw error(401, { message: 'Unauthorized' });
		}

		const [activeRound] = await db
			.select({ id: weeklyAwardRound.id })
			.from(weeklyAwardRound)
			.where(eq(weeklyAwardRound.votingOpen, true))
			.orderBy(desc(weeklyAwardRound.weekStart))
			.limit(1);

		if (!activeRound) {
			return fail(400, { voteError: 'Voting is currently closed.' });
		}

		const formData = await request.formData();
		const categoryId = parsePositiveInt(formData.get('categoryId'));
		const finalistId = parsePositiveInt(formData.get('finalistId'));

		if (!categoryId || !finalistId) {
			return fail(400, { voteError: 'Invalid vote payload.' });
		}

		const [category] = await db
			.select({ id: weeklyAwardCategory.id })
			.from(weeklyAwardCategory)
			.where(and(eq(weeklyAwardCategory.id, categoryId), eq(weeklyAwardCategory.roundId, activeRound.id)));

		if (!category) {
			return fail(404, { voteError: 'Category is not open for voting.' });
		}

		const [finalist] = await db
			.select({ id: weeklyAwardFinalist.id })
			.from(weeklyAwardFinalist)
			.where(
				and(eq(weeklyAwardFinalist.id, finalistId), eq(weeklyAwardFinalist.categoryId, categoryId))
			);

		if (!finalist) {
			return fail(404, { voteError: 'Finalist not found in this category.' });
		}

		const [existingVote] = await db
			.select({ id: weeklyAwardVote.id })
			.from(weeklyAwardVote)
			.where(
				and(
					eq(weeklyAwardVote.categoryId, categoryId),
					eq(weeklyAwardVote.voterUserId, locals.user.id)
				)
			);

		if (existingVote) {
			await db
				.update(weeklyAwardVote)
				.set({ finalistId, updatedAt: new Date() })
				.where(eq(weeklyAwardVote.id, existingVote.id));
		} else {
			await db.insert(weeklyAwardVote).values({
				categoryId,
				finalistId,
				voterUserId: locals.user.id
			});
		}

		return { voted: true, categoryId };
	}
} satisfies Actions;
