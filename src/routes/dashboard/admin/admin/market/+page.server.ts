import { db } from '$lib/server/db/index.js';
import { printshopItem } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions } from './$types';

export async function load({ locals }) {
	if (!locals.user?.hasAdmin) {
		throw error(403, { message: 'oi get out' });
	}

	const printshopItems = await db.select().from(printshopItem).where(eq(printshopItem.deleted, false));

	return {
		printshopItems
	};
}

export const actions: Actions = {
	delete: async ({ request, locals }) => {
		if (!locals.user?.hasAdmin) {
			throw error(403, { message: 'oi get out' });
		}

		const formData = await request.formData();
		const id = parseInt(formData.get('id')?.toString() || '0');

		if (!id) {
			throw error(400, { message: 'Missing item id' });
		}

		await db
			.update(printshopItem)
			.set({ deleted: true, updatedAt: new Date() })
			.where(eq(printshopItem.id, id));

		return { success: true };
	}
};
