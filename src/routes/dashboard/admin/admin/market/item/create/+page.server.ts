import { db } from '$lib/server/db/index.js';
import { marketItem, hiddenMarketItem } from '$lib/server/db/schema.js';
import { error, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export async function load({ locals }) {
	if (!locals.user?.hasAdmin) {
		throw error(403, { message: 'oi get out' });
	}
	return {};
}

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user?.hasAdmin) {
			throw error(403, { message: 'oi get out' });
		}

		const formData = await request.formData();
		
		// ===== LOG: Raw form data =====
		console.log('🔍 Raw formData received:', Object.fromEntries(formData));
		
		const name = formData.get('name')?.toString();
		const description = formData.get('description')?.toString();
		const image = formData.get('image')?.toString();
		const minRequiredShopScore = parseInt(formData.get('minRequiredShopScore')?.toString() || '0');
		const minShopScore = parseInt(formData.get('minShopScore')?.toString() || '0');
		const maxShopScore = parseInt(formData.get('maxShopScore')?.toString() || '0');
		const minPrice = parseInt(formData.get('minPrice')?.toString() || '0');
		const maxPrice = parseInt(formData.get('maxPrice')?.toString() || '0');
		const isPublic = formData.get('isPublic') === 'on';
		const isHidden = formData.get('isHidden') === 'on';

		// ===== LOG: Parsed values =====
		console.log('📝 Parsed form values:', {
			name,
			description,
			image,
			minRequiredShopScore,
			minShopScore,
			maxShopScore,
			minPrice,
			maxPrice,
			isPublic,
			isHidden,
			userId: locals.user.id
		});

		if (!name || !description || !image) {
			console.warn('⚠️ Missing required fields');
			throw error(400, { message: 'Missing required fields' });
		}

		if (maxPrice < minPrice) {
			console.warn('⚠️ Price validation failed: maxPrice < minPrice', { minPrice, maxPrice });
			throw error(400, { message: 'Max price must be greater than or equal to min price' });
		}

		if (maxShopScore < minShopScore) {
			console.warn('⚠️ Shop score validation failed: maxShopScore < minShopScore', {
				minShopScore,
				maxShopScore
			});
			throw error(400, {
				message: 'Max shop score must be greater than or equal to min shop score'
			});
		}

		try {
			if (isHidden) {
				const hiddenValues = {
					createdBy: locals.user.id,
					name,
					description,
					image,
					minRequiredShopScore,
					minShopScore,
					maxShopScore,
					minPrice,
					maxPrice
				};
				console.log('💾 Inserting hidden market item with values:', hiddenValues);
				await db.insert(hiddenMarketItem).values(hiddenValues);
				console.log('✅ Hidden market item inserted successfully');
			} else {
				const publicValues = {
					createdBy: locals.user.id,
					name,
					description,
					image,
					minRequiredShopScore,
					minShopScore,
					maxShopScore,
					minPrice,
					maxPrice,
					isPublic
				};
				console.log('💾 Inserting public market item with values:', publicValues);
				await db.insert(marketItem).values(publicValues);
				console.log('✅ Public market item inserted successfully');
			}
		} catch (e) {
			console.error('❌ Database insertion failed:', e);
			console.error('Error message:', (e as Error).message);
			console.error('Error stack:', (e as Error).stack);
			throw error(500, { message: 'Failed to create market item: ' + (e as Error).message });
		}

		console.log('🎉 Redirecting to dashboard');
		return redirect(302, '/dashboard/admin/admin/market');
	}
};
