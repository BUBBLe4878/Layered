import { db } from '$lib/server/db/index.js';
import { contest } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	console.log('=== LOAD FUNCTION START ===');
	console.log('User object:', locals.user);
	console.log('Has admin?:', locals.user?.hasAdmin);

	if (!locals.user?.hasAdmin) {
		console.log('❌ ADMIN CHECK FAILED - throwing 403');
		throw error(403, { message: 'oi get out' });
	}

	console.log('✅ Admin check passed');

	try {
		console.log('📊 Fetching contests from DB...');
		const contests = await db
			.select()
			.from(contest)
			.where(eq(contest.deleted, false));

		console.log('✅ Query executed successfully');
		console.log('Number of contests:', contests.length);

		console.log('=== LOAD FUNCTION END ===');
		return { contests };
	} catch (err) {
		console.error('❌ ERROR fetching contests:', err);
		throw error(500, { message: 'Failed to load contests' });
	}
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		console.log('\n=== CREATE ACTION START ===');
		console.log('User:', locals.user?.id);

		if (!locals.user?.hasAdmin) {
			console.log('❌ Admin check failed');
			throw error(403, { message: 'oi get out' });
		}

		try {
			const formData = await request.formData();
			const contestData = {
				title: formData.get('title')?.toString() || '',
				description: formData.get('description')?.toString() || '',
				image: formData.get('image')?.toString() || '',
				status: formData.get('status')?.toString() || 'upcoming',
				prize: formData.get('prize')?.toString() || '',
				deadline: new Date(formData.get('deadline')?.toString() || ''),
				deleted: false
			};

			console.log('📝 Contest data to insert:', contestData);

			const result = await db.insert(contest).values(contestData);

			console.log('✅ Contest created successfully');
			console.log('Insert result:', result);
			console.log('=== CREATE ACTION END ===\n');

			return { success: true };
		} catch (err) {
			console.error('❌ ERROR creating contest:', err);
			throw error(500, { message: 'Failed to create contest' });
		}
	},

	update: async ({ request, locals }) => {
		console.log('\n=== UPDATE ACTION START ===');
		console.log('User:', locals.user?.id);

		if (!locals.user?.hasAdmin) {
			console.log('❌ Admin check failed');
			throw error(403, { message: 'oi get out' });
		}

		try {
			const formData = await request.formData();
			const id = parseInt(formData.get('id')?.toString() || '0');

			console.log('📝 Updating contest ID:', id);

			if (!id) {
				console.log('❌ Missing contest id');
				throw error(400, { message: 'Missing contest id' });
			}

			const updateData = {
				title: formData.get('title')?.toString(),
				description: formData.get('description')?.toString(),
				image: formData.get('image')?.toString(),
				status: formData.get('status')?.toString(),
				prize: formData.get('prize')?.toString(),
				deadline: new Date(formData.get('deadline')?.toString() || ''),
				updatedAt: new Date()
			};

			console.log('📝 Update data:', updateData);

			const result = await db
				.update(contest)
				.set(updateData)
				.where(eq(contest.id, id));

			console.log('✅ Contest updated successfully');
			console.log('Update result:', result);
			console.log('=== UPDATE ACTION END ===\n');

			return { success: true };
		} catch (err) {
			console.error('❌ ERROR updating contest:', err);
			throw error(500, { message: 'Failed to update contest' });
		}
	},

	delete: async ({ request, locals }) => {
		console.log('\n=== DELETE ACTION START ===');
		console.log('User:', locals.user?.id);

		if (!locals.user?.hasAdmin) {
			console.log('❌ Admin check failed');
			throw error(403, { message: 'oi get out' });
		}

		try {
			const formData = await request.formData();
			const id = parseInt(formData.get('id')?.toString() || '0');

			console.log('🗑️  Deleting contest ID:', id);

			if (!id) {
				console.log('❌ Missing contest id');
				throw error(400, { message: 'Missing contest id' });
			}

			const result = await db
				.update(contest)
				.set({ deleted: true, updatedAt: new Date() })
				.where(eq(contest.id, id));

			console.log('✅ Contest marked as deleted');
			console.log('Delete result:', result);
			console.log('=== DELETE ACTION END ===\n');

			return { success: true };
		} catch (err) {
			console.error('❌ ERROR deleting contest:', err);
			throw error(500, { message: 'Failed to delete contest' });
		}
	}
};
