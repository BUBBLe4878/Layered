import { db } from '$lib/server/db/index.js';
import { user, session } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import type { Actions } from './$types';

export const load = async ({ locals }: { locals: App.Locals }) => {
	if (!locals.user) {
		throw error(500);
	}
	if (!locals.user.hasAdmin) {
		throw error(403, { message: 'oi get out' });
	}

	const users = await db
		.select({
			id: user.id,
			name: user.name,
			slackId: user.slackId,
			isPrinter: user.isPrinter,
			hasT1Review: user.hasT1Review,
			hasT2Review: user.hasT2Review,
			hasAdmin: user.hasAdmin,
			hackatimeTrust: user.hackatimeTrust,
			trust: user.trust,
			clay: user.clay,
			brick: user.brick,
			shopScore: user.shopScore
		})
		.from(user)
		.orderBy(user.name);

	return {
		users
	};
};

export const actions = {
	logoutEveryone: async ({ locals }: { locals: App.Locals }) => {
		if (!locals.user) {
			throw error(500);
		}
		if (!locals.user.hasAdmin) {
			throw error(403, { message: 'oi get out' });
		}

		await db.delete(session);

		return {};
	}
} satisfies Actions;
