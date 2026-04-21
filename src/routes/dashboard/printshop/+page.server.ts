import { db } from '$lib/server/db/index.js';
import { printshopItem } from '$lib/server/db/schema.js';
import { calculateMarketPrice } from '$lib/utils';
import { error } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';

export async function load({ locals }) {
	if (!locals.user) {
		throw error(500);
	}

	const printshopItems = await db
		.select({
			id: printshopItem.id,
			name: printshopItem.name,
			description: printshopItem.description,
			image: printshopItem.image,
			minPrice: printshopItem.minPrice,
			maxPrice: printshopItem.maxPrice,
			minShopScore: printshopItem.minShopScore,
			maxShopScore: printshopItem.maxShopScore,
			minRequiredShopScore: printshopItem.minRequiredShopScore
		})
		.from(printshopItem)
		.where(and(eq(printshopItem.deleted, false), eq(printshopItem.isPublic, true)))
		.orderBy(printshopItem.maxPrice);

	const shopScore = locals.user.shopScore;

	const printshopItemsWithPrice = printshopItems
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
		printshopItems: printshopItemsWithPrice
	};
}
