import { db } from '$lib/server/db/index.js';
import {
	currencyAuditLog,
	user,
	weeklyAwardCategory,
	weeklyAwardFinalist,
	weeklyAwardPayout,
	weeklyAwardRound,
	weeklyAwardVote
} from '$lib/server/db/schema.js';
import { isMissingWeeklyAwardsSchemaError } from '$lib/server/weekly-awards';
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
	if (!locals.user?.hasAdmin) {
		throw error(403, { message: 'oi get out' });
	}

	try {
		const rounds = await db
			.select({
				id: weeklyAwardRound.id,
				label: weeklyAwardRound.label,
				weekStart: weeklyAwardRound.weekStart,
				votingOpen: weeklyAwardRound.votingOpen,
				createdAt: weeklyAwardRound.createdAt
			})
			.from(weeklyAwardRound)
			.orderBy(desc(weeklyAwardRound.weekStart));

		const roundIds = rounds.map((round) => round.id);

		const categories =
			roundIds.length > 0
				? await db
						.select({
							id: weeklyAwardCategory.id,
							roundId: weeklyAwardCategory.roundId,
							name: weeklyAwardCategory.name,
							description: weeklyAwardCategory.description,
							bonusLayers: weeklyAwardCategory.bonusLayers,
							createdAt: weeklyAwardCategory.createdAt
						})
						.from(weeklyAwardCategory)
						.where(inArray(weeklyAwardCategory.roundId, roundIds))
				: [];

		const categoryIds = categories.map((category) => category.id);

		const finalists =
			categoryIds.length > 0
				? await db
						.select({
							id: weeklyAwardFinalist.id,
							categoryId: weeklyAwardFinalist.categoryId,
							reason: weeklyAwardFinalist.reason,
							createdAt: weeklyAwardFinalist.createdAt,
							user: {
								id: user.id,
								name: user.name
							}
						})
						.from(weeklyAwardFinalist)
						.leftJoin(user, eq(user.id, weeklyAwardFinalist.userId))
						.where(inArray(weeklyAwardFinalist.categoryId, categoryIds))
				: [];

		const voteCounts =
			categoryIds.length > 0
				? await db
						.select({
							finalistId: weeklyAwardVote.finalistId,
							voteCount: sql<number>`COUNT(*)`
						})
						.from(weeklyAwardVote)
						.where(inArray(weeklyAwardVote.categoryId, categoryIds))
						.groupBy(weeklyAwardVote.finalistId)
				: [];

		const payouts =
			categoryIds.length > 0
				? await db
						.select({
							id: weeklyAwardPayout.id,
							categoryId: weeklyAwardPayout.categoryId,
							winnerUserId: weeklyAwardPayout.winnerUserId,
							layersGranted: weeklyAwardPayout.layersGranted,
							createdAt: weeklyAwardPayout.createdAt,
							winnerName: user.name
						})
						.from(weeklyAwardPayout)
						.leftJoin(user, eq(user.id, weeklyAwardPayout.winnerUserId))
						.where(inArray(weeklyAwardPayout.categoryId, categoryIds))
				: [];

		const awardUsers = await db
			.select({
				id: user.id,
				name: user.name
			})
			.from(user)
			.orderBy(user.name);

		const voteCountByFinalistId = new Map(voteCounts.map((row) => [row.finalistId, Number(row.voteCount)]));
		const payoutByCategoryId = new Map(payouts.map((payout) => [payout.categoryId, payout]));

		const finalistsByCategoryId = new Map<number, typeof finalists>();
		for (const finalist of finalists) {
			const current = finalistsByCategoryId.get(finalist.categoryId) ?? [];
			current.push(finalist);
			finalistsByCategoryId.set(finalist.categoryId, current);
		}

		const categoriesByRoundId = new Map<number, Array<(typeof categories)[number] & {
			finalists: Array<(typeof finalists)[number] & { voteCount: number }>;
			payout: (typeof payouts)[number] | null;
		}>>();

		for (const category of categories) {
			const current = categoriesByRoundId.get(category.roundId) ?? [];
			current.push({
				...category,
				finalists: (finalistsByCategoryId.get(category.id) ?? []).map((finalist) => ({
					...finalist,
					voteCount: voteCountByFinalistId.get(finalist.id) ?? 0
				})),
				payout: payoutByCategoryId.get(category.id) ?? null
			});
			categoriesByRoundId.set(category.roundId, current);
		}

		return {
			rounds: rounds.map((round) => ({
				...round,
				categories: categoriesByRoundId.get(round.id) ?? []
			})),
			awardUsers,
			weeklyAwardsReady: true
		};
	} catch (error) {
		if (isMissingWeeklyAwardsSchemaError(error)) {
			return {
				rounds: [],
				awardUsers: [],
				weeklyAwardsReady: false
			};
		}

		throw error;
	}
}

export const actions = {
	createRound: async ({ locals, request }) => {
		if (!locals.user?.hasAdmin) {
			throw error(403, { message: 'oi get out' });
		}

		const formData = await request.formData();
		const weekStartRaw = formData.get('weekStart')?.toString().trim();
		const label = formData.get('label')?.toString().trim();

		if (!weekStartRaw) {
			return fail(400, { createRoundError: 'Week start is required.' });
		}

		const weekStart = new Date(`${weekStartRaw}T00:00:00.000Z`);
		if (Number.isNaN(weekStart.getTime())) {
			return fail(400, { createRoundError: 'Invalid week start date.' });
		}

		await db.insert(weeklyAwardRound).values({
			label: label && label.length > 0 ? label : `Week of ${weekStartRaw}`,
			weekStart,
			createdBy: locals.user.id
		});

		return { createdRound: true };
	},

	toggleVoting: async ({ locals, request }) => {
		if (!locals.user?.hasAdmin) {
			throw error(403, { message: 'oi get out' });
		}

		const formData = await request.formData();
		const roundId = parsePositiveInt(formData.get('roundId'));
		const votingOpen = formData.get('votingOpen')?.toString() === 'true';

		if (!roundId) {
			return fail(400, { toggleVotingError: 'Invalid round id.' });
		}

		await db
			.update(weeklyAwardRound)
			.set({
				votingOpen,
				updatedAt: new Date()
			})
			.where(eq(weeklyAwardRound.id, roundId));

		return { toggledVoting: true };
	},

	createCategory: async ({ locals, request }) => {
		if (!locals.user?.hasAdmin) {
			throw error(403, { message: 'oi get out' });
		}

		const formData = await request.formData();
		const roundId = parsePositiveInt(formData.get('roundId'));
		const name = formData.get('name')?.toString().trim();
		const description = formData.get('description')?.toString().trim() || null;
		const bonusLayersRaw = parsePositiveInt(formData.get('bonusLayers'));
		const bonusLayers = bonusLayersRaw ?? 50;

		if (!roundId || !name) {
			return fail(400, { createCategoryError: 'Round and category name are required.' });
		}

		await db.insert(weeklyAwardCategory).values({
			roundId,
			name,
			description,
			bonusLayers,
			createdBy: locals.user.id
		});

		return { createdCategory: true };
	},

	addFinalist: async ({ locals, request }) => {
		if (!locals.user?.hasAdmin) {
			throw error(403, { message: 'oi get out' });
		}

		const formData = await request.formData();
		const categoryId = parsePositiveInt(formData.get('categoryId'));
		const userId = parsePositiveInt(formData.get('userId'));
		const reason = formData.get('reason')?.toString().trim() || null;

		if (!categoryId || !userId) {
			return fail(400, { addFinalistError: 'Category and finalist are required.' });
		}

		await db.insert(weeklyAwardFinalist).values({
			categoryId,
			userId,
			reason,
			createdBy: locals.user.id
		});

		return { createdFinalist: true };
	},

	removeFinalist: async ({ locals, request }) => {
		if (!locals.user?.hasAdmin) {
			throw error(403, { message: 'oi get out' });
		}

		const formData = await request.formData();
		const finalistId = parsePositiveInt(formData.get('finalistId'));

		if (!finalistId) {
			return fail(400, { removeFinalistError: 'Invalid finalist id.' });
		}

		// load finalist and category
		const [finalist] = await db
			.select({ id: weeklyAwardFinalist.id, categoryId: weeklyAwardFinalist.categoryId })
			.from(weeklyAwardFinalist)
			.where(eq(weeklyAwardFinalist.id, finalistId));

		if (!finalist) {
			return fail(404, { removeFinalistError: 'Finalist not found.' });
		}

		// don't allow removal if payout already granted for category
		const [payout] = await db
			.select({ id: weeklyAwardPayout.id })
			.from(weeklyAwardPayout)
			.where(eq(weeklyAwardPayout.categoryId, finalist.categoryId));

		if (payout) {
			return fail(400, { removeFinalistError: 'Cannot remove finalist after payout has been granted.' });
		}

		await db.transaction(async (tx) => {
			// remove any votes for this finalist
			await tx.delete(weeklyAwardVote).where(eq(weeklyAwardVote.finalistId, finalistId));

			// remove finalist
			await tx.delete(weeklyAwardFinalist).where(eq(weeklyAwardFinalist.id, finalistId));
		});

		return { removedFinalist: true };
	},

	grantWinner: async ({ locals, request }) => {
		if (!locals.user?.hasAdmin) {
			throw error(403, { message: 'oi get out' });
		}

		const formData = await request.formData();
		const categoryId = parsePositiveInt(formData.get('categoryId'));
		const finalistId = parsePositiveInt(formData.get('finalistId'));

		if (!categoryId || !finalistId) {
			return fail(400, { grantWinnerError: 'Category and finalist are required.' });
		}

		const [category] = await db
			.select({
				id: weeklyAwardCategory.id,
				name: weeklyAwardCategory.name,
				bonusLayers: weeklyAwardCategory.bonusLayers
			})
			.from(weeklyAwardCategory)
			.where(eq(weeklyAwardCategory.id, categoryId));

		if (!category) {
			return fail(404, { grantWinnerError: 'Category not found.' });
		}

		const [finalist] = await db
			.select({
				id: weeklyAwardFinalist.id,
				userId: weeklyAwardFinalist.userId
			})
			.from(weeklyAwardFinalist)
			.where(
				and(eq(weeklyAwardFinalist.id, finalistId), eq(weeklyAwardFinalist.categoryId, categoryId))
			);

		if (!finalist) {
			return fail(404, { grantWinnerError: 'Finalist not found for this category.' });
		}

		const [alreadyGranted] = await db
			.select({ id: weeklyAwardPayout.id })
			.from(weeklyAwardPayout)
			.where(eq(weeklyAwardPayout.categoryId, categoryId));

		if (alreadyGranted) {
			return fail(400, { grantWinnerError: 'A payout was already granted for this category.' });
		}

		const [winner] = await db
			.select({
				id: user.id,
				clay: user.clay,
				brick: user.brick,
				shopScore: user.shopScore
			})
			.from(user)
			.where(eq(user.id, finalist.userId));

		if (!winner) {
			return fail(404, { grantWinnerError: 'Winner user not found.' });
		}

		const bonusLayers = category.bonusLayers;
		const oldClay = winner.clay;
		const newClay = oldClay + bonusLayers;

		await db.transaction(async (tx) => {
			await tx.update(user).set({ clay: newClay }).where(eq(user.id, winner.id));

			await tx.insert(weeklyAwardPayout).values({
				categoryId,
				winnerUserId: winner.id,
				layersGranted: bonusLayers,
				grantedBy: locals.user!.id
			});

			await tx.insert(currencyAuditLog).values({
				adminUserId: locals.user!.id,
				targetUserId: winner.id,
				reason: `Weekly Awards winner payout (${category.name})`,
				oldClay,
				oldBrick: winner.brick,
				oldShopScore: winner.shopScore,
				newClay,
				newBrick: winner.brick,
				newShopScore: winner.shopScore
			});
		});

		return { grantedWinner: true };
	}
	,

	deleteCategory: async ({ locals, request }) => {
		if (!locals.user?.hasAdmin) {
			throw error(403, { message: 'oi get out' });
		}

		const formData = await request.formData();
		const categoryId = parsePositiveInt(formData.get('categoryId'));

		if (!categoryId) {
			return fail(400, { deleteCategoryError: 'Invalid category id.' });
		}

		// don't allow deletion if payout exists
		const [payout] = await db
			.select({ id: weeklyAwardPayout.id })
			.from(weeklyAwardPayout)
			.where(eq(weeklyAwardPayout.categoryId, categoryId));

		if (payout) {
			return fail(400, { deleteCategoryError: 'Cannot delete category after payout has been granted.' });
		}

		await db.transaction(async (tx) => {
			// find finalists for this category
			const finalists = await tx.select({ id: weeklyAwardFinalist.id }).from(weeklyAwardFinalist).where(eq(weeklyAwardFinalist.categoryId, categoryId));

			const finalistIds = finalists.map((f) => f.id);

			if (finalistIds.length > 0) {
				// delete votes for those finalists
				await tx.delete(weeklyAwardVote).where(inArray(weeklyAwardVote.finalistId, finalistIds));
				// delete finalists
				await tx.delete(weeklyAwardFinalist).where(inArray(weeklyAwardFinalist.id, finalistIds));
			}

			// delete category
			await tx.delete(weeklyAwardCategory).where(eq(weeklyAwardCategory.id, categoryId));
		});

		return { deletedCategory: true };
	}
} satisfies Actions;
