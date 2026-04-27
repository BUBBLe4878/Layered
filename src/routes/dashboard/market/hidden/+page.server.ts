import { db } from '$lib/server/db/index.js';
import { hiddenMarketItem } from '$lib/server/db/schema.js'; // Change import
import { calculateMarketPrice } from '$lib/utils';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export async function load({ locals }) {
	if (!locals.user) {
		throw error(500);
	}

	if (!locals.user.hasBasePrinter) {
		throw error(403, 'You need a printer to access the hidden market');
	}

	const marketItems = await db
		.select({
			id: hiddenMarketItem.id,
			name: hiddenMarketItem.name,
			description: hiddenMarketItem.description,
			image: hiddenMarketItem.image,
			minPrice: hiddenMarketItem.minPrice,
			maxPrice: hiddenMarketItem.maxPrice,
			minShopScore: hiddenMarketItem.minShopScore,
			maxShopScore: hiddenMarketItem.maxShopScore,
			minRequiredShopScore: hiddenMarketItem.minRequiredShopScore
		})
		.from(hiddenMarketItem)
		.where(eq(hiddenMarketItem.deleted, false))
		.orderBy(hiddenMarketItem.maxPrice);

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
