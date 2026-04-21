import { db } from '$lib/server/db/index.js';
import { printshopItem } from '$lib/server/db/schema.js';
import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';
import { eq, and } from 'drizzle-orm';

export async function load({ locals, params }) {
	if (!locals.user?.hasAdmin) {
		throw error(403, { message: 'oi get out' });
	}

	const id: number = parseInt(params.id);

	const [item] = await db
		.select()
		.from(printshopItem)
		.where(and(eq(printshopItem.deleted, false), eq(printshopItem.id, id)));

	if (!item) {
		return error(404, { message: 'item not found' });
	}

	return {
		printshopItem: item
	};
}

export const actions: Actions = {
	default: async ({ locals, params }) => {
		if (!locals.user?.hasAdmin) {
			throw error(403, { message: 'oi get out' });
		}

		const id: number = parseInt(params.id);

		const [item] = await db
			.select()
			.from(printshopItem)
			.where(and(eq(printshopItem.deleted, false), eq(printshopItem.id, id)));

		if (!item) {
			return error(404, { message: 'item not found' });
		}

		await db
			.update(printshopItem)
			.set({ deleted: true, updatedAt: new Date() })
			.where(eq(printshopItem.id, id));

		return redirect(302, '/dashboard/admin/admin/printshop');
	}
};
