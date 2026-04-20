import { db } from '$lib/server/db/index.js';
import {
	user,
	devlog,
	session,
	impersonateAuditLog,
	currencyAuditLog
} from '$lib/server/db/schema.js';

import { error, fail } from '@sveltejs/kit';
import { and, eq, sql } from 'drizzle-orm';
import type { Actions } from './$types';

import {
	createSession,
	DAY_IN_MS,
	generateSessionToken,
	SESSION_EXPIRY_DAYS,
	setSessionTokenCookie
} from '$lib/server/auth';

import { decrypt } from '$lib/server/encryption';
import { getUserData } from '$lib/server/idvUserData';
import { withSlackProfile } from '$lib/server/slack';

/* =========================================================
   LOAD
========================================================= */

export async function load({ locals, params }) {
	if (!locals.user) throw error(500);
	if (!locals.user.hasAdmin) throw error(403, { message: 'no access' });

	const id = Number(params.id);

	const [queriedUser] = await db
		.select()
		.from(user)
		.where(eq(user.id, id));

	if (!queriedUser) {
		throw error(404, { message: 'user not found' });
	}

	const [{ devlogCount }] =
		(await db
			.select({
				devlogCount: sql<number>`COALESCE(COUNT(${devlog.id}), 0)`
			})
			.from(user)
			.leftJoin(devlog, and(eq(devlog.userId, user.id), eq(devlog.deleted, false)))
			.where(eq(user.id, id))
			.groupBy(user.id)) ?? [{ devlogCount: 0 }];

	const enriched = await withSlackProfile(queriedUser);

	return {
		queriedUser: enriched,
		devlogCount
	};
}

/* =========================================================
   ACTIONS
========================================================= */

export const actions: Actions = {
	/* ---------------- PRIVILEGES ---------------- */
	privileges: async ({ locals, request, params }) => {
		if (!locals.user) throw error(500);
		if (!locals.user.hasAdmin) throw error(403);

		const id = Number(params.id);
		const data = await request.formData();

		await db
			.update(user)
			.set({
				isPrinter: data.get('is_printer') === 'on',
				hasT1Review: data.get('has_t1_review') === 'on',
				hasT2Review: data.get('has_t2_review') === 'on',
				hasAdmin: data.get('has_admin') === 'on'
			})
			.where(eq(user.id, id));

		return {
			queriedUser: await db.query.user.findFirst({
				where: eq(user.id, id)
			})
		};
	},

	/* ---------------- CURRENCY ---------------- */
	currency: async ({ locals, request, params }) => {
		if (!locals.user) throw error(500);
		if (!locals.user.hasAdmin) throw error(403);

		const id = Number(params.id);
		const data = await request.formData();

		const clay = Number(data.get('clay'));
		const brick = Number(data.get('brick'));
		const shopScore = Number(data.get('market_score'));
		const reason = data.get('reason')?.toString();

		if ([clay, brick, shopScore].some((v) => isNaN(v))) {
			return fail(400, {
				currency: { invalidFields: true }
			});
		}

		if (!reason) {
			throw error(400, { message: 'invalid reason' });
		}

		const [before] = await db.select().from(user).where(eq(user.id, id));
		if (!before) throw error(404, { message: 'user not found' });

		await db
			.update(user)
			.set({ clay, brick, shopScore })
			.where(eq(user.id, id));

		await db.insert(currencyAuditLog).values({
			adminUserId: locals.user.id,
			targetUserId: id,
			oldClay: before.clay,
			oldBrick: before.brick,
			oldShopScore: before.shopScore,
			newClay: clay,
			newBrick: brick,
			newShopScore: shopScore,
			reason
		});

		return {
			queriedUserAfter: await db.query.user.findFirst({
				where: eq(user.id, id)
			})
		};
	},

	/* ---------------- FETCH PII ---------------- */
	return {
	fetchPII: {
		success: true,
		errorMessage: '',
		first_name: first_name ?? '',
		last_name: last_name ?? '',
		primary_email: email ?? '',
		phone_number: phone_number ?? '',
		birthday: birthday ?? '',
		address: address
			? {
					id: address.id ?? '',
					first_name: address.first_name ?? '',
					last_name: address.last_name ?? '',
					line_1: address.line_1 ?? '',
					line_2: address.line_2 ?? '',
					city: address.city ?? '',
					state: address.state ?? '',
					postal_code: address.postal_code ?? '',
					country: address.country ?? ''
				}
			: null
	}
};
