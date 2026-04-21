import { db } from '$lib/server/db/index.js';
import { printshopItemOrder, printshopItem, user } from '$lib/server/db/schema.js';
import { error } from '@sveltejs/kit';
import { eq, and, ne, inArray, desc } from 'drizzle-orm';

export async function load({ locals, url }) {
	if (!locals.user) {
		throw error(500);
	}
	if (!locals.user.hasAdmin) {
		throw error(403, { message: 'oi get out' });
	}

	const hasFilters = url.searchParams.size > 0;
	const statusFilter = hasFilters
		? (url.searchParams.getAll('status') as (typeof printshopItemOrder.status._.data)[])
		: (['awaiting_approval'] as (typeof printshopItemOrder.status._.data)[]);
	const printshopItemFilter = url.searchParams
		.getAll('printshopItem')
		.map((id) => parseInt(id))
		.filter((id) => !isNaN(id) && id > 0);
	const userFilter = url.searchParams
		.getAll('user')
		.map((id) => parseInt(id))
		.filter((id) => !isNaN(id) && id > 0);

	const orders = await getOrders(statusFilter, printshopItemFilter, userFilter);

	const allMarketItems = await db
		.select({
			id: printshopItem.id,
			name: printshopItem.name
		})
		.from(printshopItem)
		.where(eq(printshopItem.deleted, false));

	const users = await db
		.select({
			id: user.id,
			name: user.name
		})
		.from(user)
		.where(and(ne(user.trust, 'red'), ne(user.hackatimeTrust, 'red'))); // hide banned users

	return {
		allMarketItems,
		orders,
		users,
		fields: {
			status: statusFilter,
			printshopItem: printshopItemFilter,
			user: userFilter
		}
	};
}

async function getOrders(
	statusFilter: (typeof printshopItemOrder.status._.data)[],
	printshopItemFilter: number[],
	userFilter: number[]
) {
	return await db
		.select({
			order: {
				id: printshopItemOrder.id,
				userId: printshopItemOrder.userId,
				printshopItemId: printshopItemOrder.printshopItemId,
				addressId: printshopItemOrder.addressId,
				bricksPaid: printshopItemOrder.bricksPaid,
				status: printshopItemOrder.status,
				userNotes: printshopItemOrder.userNotes,
				notes: printshopItemOrder.notes,
				createdAt: printshopItemOrder.createdAt
			},
			printshopItem: {
				id: printshopItem.id,
				name: printshopItem.name,
				image: printshopItem.image
			},
			user: {
				id: user.id,
				name: user.name,
				idvToken: user.idvToken
			}
		})
		.from(printshopItemOrder)
		.leftJoin(printshopItem, eq(printshopItem.id, printshopItemOrder.printshopItemId))
		.leftJoin(user, eq(user.id, printshopItemOrder.userId))
		.where(
			and(
				eq(printshopItemOrder.deleted, false),
				statusFilter.length > 0 ? inArray(printshopItemOrder.status, statusFilter) : undefined,
				printshopItemFilter.length > 0
					? inArray(printshopItemOrder.printshopItemId, printshopItemFilter)
					: undefined,
				userFilter.length > 0 ? inArray(printshopItemOrder.userId, userFilter) : undefined
			)
		)
		.orderBy(desc(printshopItemOrder.createdAt));
}
