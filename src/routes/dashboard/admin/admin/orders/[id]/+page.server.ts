import { db } from '$lib/server/db/index.js';
import { printshopItemOrder, printshopItem, user } from '$lib/server/db/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import type { Actions } from './$types';
import { sendSlackDM } from '$lib/server/slack.js';
import { decrypt } from '$lib/server/encryption';
import { getUserData } from '$lib/server/idvUserData';
import { env } from '$env/dynamic/private';

export async function load({ locals, params }) {
	if (!locals.user) {
		throw error(500);
	}
	if (!locals.user.hasAdmin) {
		throw error(403, { message: 'oi get out' });
	}

	const id: number = parseInt(params.id);

	const [orderData] = await db
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
				description: printshopItem.description,
				image: printshopItem.image
			},
			user: {
				id: user.id,
				name: user.name,
				slackId: user.slackId,
				idvToken: user.idvToken,
				brick: user.brick
			}
		})
		.from(printshopItemOrder)
		.leftJoin(printshopItem, eq(printshopItem.id, printshopItemOrder.printshopItemId))
		.leftJoin(user, eq(user.id, printshopItemOrder.userId))
		.where(and(eq(printshopItemOrder.id, id), eq(printshopItemOrder.deleted, false)))
		.limit(1);

	if (!orderData) {
		throw error(404, { message: 'order not found' });
	}

	let address = null;
	let email = null;
	let userDataError = false;

	if (orderData.user?.idvToken) {
		try {
			const token = decrypt(orderData.user.idvToken);
			const userData = await getUserData(token);

			email = userData.primary_email;
			address = userData?.addresses?.find(
				(a: { id: string }) => a.id === orderData.order.addressId
			);
		} catch {
			userDataError = true;
		}
	} else {
		userDataError = true;
	}

	return {
		orderData,
		email,
		address,
		userDataError,
		s3PublicUrl: env.S3_PUBLIC_URL
	};
}

export const actions = {
	markShipped: async ({ locals, params }) => {
		if (!locals.user) {
			throw error(500);
		}
		if (!locals.user.hasAdmin) {
			throw error(403, { message: 'oi get out' });
		}

		const id: number = parseInt(params.id);

		const [orderData] = await db
			.select({
				order: {
					id: printshopItemOrder.id,
					notes: printshopItemOrder.notes
				},
				printshopItem: {
					name: printshopItem.name
				},
				user: {
					id: user.id,
					slackId: user.slackId
				}
			})
			.from(printshopItemOrder)
			.leftJoin(printshopItem, eq(printshopItem.id, printshopItemOrder.printshopItemId))
			.leftJoin(user, eq(user.id, printshopItemOrder.userId))
			.where(
				and(
					eq(printshopItemOrder.id, id),
					eq(printshopItemOrder.deleted, false),
					eq(printshopItemOrder.status, 'awaiting_approval')
				)
			)
			.limit(1);

		if (!orderData) {
			throw error(404, { message: 'order not found' });
		}

		await db
			.update(printshopItemOrder)
			.set({
				status: 'fulfilled'
			})
			.where(eq(printshopItemOrder.id, id));

		if (orderData.user?.slackId) {
			const notesText = orderData.order.notes ? `\n\nNotes: ${orderData.order.notes}` : '';
			await sendSlackDM(
				orderData.user.slackId,
				`Your order for ${orderData.printshopItem?.name || 'a printshop item'} just got shipped! :package: :package: :package:\n\n${notesText}`
			);
		}

		return { success: true, message: 'Order marked as shipped' };
	},

	refund: async ({ locals, params }) => {
		if (!locals.user) {
			throw error(500);
		}
		if (!locals.user.hasAdmin) {
			throw error(403, { message: 'oi get out' });
		}

		const id: number = parseInt(params.id);

		const [orderData] = await db
			.select({
				order: {
					id: printshopItemOrder.id,
					userId: printshopItemOrder.userId,
					bricksPaid: printshopItemOrder.bricksPaid
				},
				printshopItem: {
					name: printshopItem.name
				},
				user: {
					id: user.id,
					slackId: user.slackId,
					brick: user.brick
				}
			})
			.from(printshopItemOrder)
			.leftJoin(printshopItem, eq(printshopItem.id, printshopItemOrder.printshopItemId))
			.leftJoin(user, eq(user.id, printshopItemOrder.userId))
			.where(
				and(
					eq(printshopItemOrder.id, id),
					eq(printshopItemOrder.deleted, false),
					eq(printshopItemOrder.status, 'awaiting_approval')
				)
			)
			.limit(1);

		if (!orderData) {
			throw error(404, { message: 'order not found' });
		}

		// Refund the bricks
		await db
			.update(user)
			.set({
				brick: orderData.user!.brick + orderData.order.bricksPaid
			})
			.where(eq(user.id, orderData.order.userId));

		// Mark order as refunded
		await db
			.update(printshopItemOrder)
			.set({
				status: 'refunded'
			})
			.where(eq(printshopItemOrder.id, id));

		if (orderData.user?.slackId) {
			await sendSlackDM(
				orderData.user.slackId,
				`Your order for ${orderData.printshopItem?.name || 'a printshop item'} has been refunded! :oop:\nYou got your ${orderData.order.bricksPaid} bricks back`
			);
		}

		return { success: true, message: 'Order refunded' };
	},

	deny: async ({ locals, params }) => {
		if (!locals.user) {
			throw error(500);
		}
		if (!locals.user.hasAdmin) {
			throw error(403, { message: 'oi get out' });
		}

		const id: number = parseInt(params.id);

		const [orderData] = await db
			.select({
				order: {
					id: printshopItemOrder.id
				},
				printshopItem: {
					name: printshopItem.name
				},
				user: {
					slackId: user.slackId
				}
			})
			.from(printshopItemOrder)
			.leftJoin(printshopItem, eq(printshopItem.id, printshopItemOrder.printshopItemId))
			.leftJoin(user, eq(user.id, printshopItemOrder.userId))
			.where(
				and(
					eq(printshopItemOrder.id, id),
					eq(printshopItemOrder.deleted, false),
					eq(printshopItemOrder.status, 'awaiting_approval')
				)
			)
			.limit(1);

		if (!orderData) {
			throw error(404, { message: 'order not found' });
		}

		// Mark order as denied
		await db
			.update(printshopItemOrder)
			.set({
				status: 'denied'
			})
			.where(eq(printshopItemOrder.id, id));

		if (orderData.user?.slackId) {
			await sendSlackDM(
				orderData.user.slackId,
				`Your order for ${orderData.printshopItem?.name || 'a printshop item'} has been denied :dcolon:\nYou didn't get any of your bricks back :hmmm:`
			);
		}

		return redirect(302, '/dashboard/admin/admin/orders');
	},

	updateNotes: async ({ locals, params, request }) => {
		if (!locals.user) {
			throw error(500);
		}
		if (!locals.user.hasAdmin) {
			throw error(403, { message: 'oi get out' });
		}

		const id: number = parseInt(params.id);
		const data = await request.formData();
		const notes = data.get('notes')?.toString();

		if (notes === undefined) {
			throw error(400, { message: 'missing notes' });
		}

		await db
			.update(printshopItemOrder)
			.set({
				notes
			})
			.where(eq(printshopItemOrder.id, id));

		return { success: true, message: 'Notes updated' };
	}
} satisfies Actions;
