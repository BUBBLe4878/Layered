import { db } from '$lib/server/db/index.js';
import { contest } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user?.hasAdmin) {
		throw error(403, { message: 'oi get out' });
	}

	const contests = await db
		.select()
		.from(contest)
		.where(eq(contest.deleted, false));
		console.log('Contests from DB:', contests); // debugging
	return { contests };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user?.hasAdmin) {
			throw error(403, { message: 'oi get out' });
		}

		const formData = await request.formData();

		await db.insert(contest).values({
			title: formData.get('title')?.toString() || '',
			description: formData.get('description')?.toString() || '',
			image: formData.get('image')?.toString() || '',
			status: formData.get('status')?.toString() || 'upcoming',
			prize: formData.get('prize')?.toString() || '',
			deadline: new Date(formData.get('deadline')?.toString() || '')
		});

		return { success: true };
	},

	update: async ({ request, locals }) => {
		if (!locals.user?.hasAdmin) {
			throw error(403, { message: 'oi get out' });
		}

		const formData = await request.formData();
		const id = parseInt(formData.get('id')?.toString() || '0');

		if (!id) {
			throw error(400, { message: 'Missing contest id' });
		}

		await db
			.update(contest)
			.set({
				title: formData.get('title')?.toString(),
				description: formData.get('description')?.toString(),
				image: formData.get('image')?.toString(),
				status: formData.get('status')?.toString(),
				prize: formData.get('prize')?.toString(),
				deadline: new Date(formData.get('deadline')?.toString() || ''),
				updatedAt: new Date()
			})
			.where(eq(contest.id, id));

		return { success: true };
	},

	delete: async ({ request, locals }) => {
		if (!locals.user?.hasAdmin) {
			throw error(403, { message: 'oi get out' });
		}

		const formData = await request.formData();
		const id = parseInt(formData.get('id')?.toString() || '0');

		if (!id) {
			throw error(400, { message: 'Missing contest id' });
		}

		await db
			.update(contest)
			.set({ deleted: true, updatedAt: new Date() })
			.where(eq(contest.id, id));

		return { success: true };
	}
};
