import { db } from '$lib/server/db/index.js';
import { marketItem } from '$lib/server/db/schema.js';
import { calculateMarketPrice } from '$lib/utils';
import { error } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';

export async function load({ locals }) {
	if (!locals.user) {
		throw error(500);
	}

	// Only allow access if user has a printer
	if (!locals.user.hasBasePrinter) {
		throw error(403, 'You need a printer to access the hidden market');
	}

	const marketItems = await db
		.select({
			id: marketItem.id,
			name: marketItem.name,
			description: marketItem.description,
			image: marketItem.image,
			minPrice: marketItem.minPrice,
			maxPrice: marketItem.maxPrice,
			minShopScore: marketItem.minShopScore,
			maxShopScore: marketItem.maxShopScore,
			minRequiredShopScore: marketItem.minRequiredShopScore
		})
		.from(marketItem)
		.where(and(eq(marketItem.deleted, false), eq(marketItem.isPublic, false))) // Changed to isPublic: false
		.orderBy(marketItem.maxPrice);

	const shopScore = locals.user.shopScore;
	const marketItemsWithPrice = marketItems
		.map((item) => {
			const computedPrice = calculateMarketPrice(
				item.minPrice,
				item.maxPrice,
				item.minShopScore,
				item.maxShopScore,
				shopScore
			);
			const discountAmount = 1 - computedPrice / item.maxPrice;
			return { ...item, computedPrice, discountAmount };
		})
		.sort((a, b) => a.computedPrice - b.computedPrice);

	return {
		marketItems: marketItemsWithPrice,
		user: {
			hasBasePrinter: locals.user.hasBasePrinter ?? false
		}
	};
}
