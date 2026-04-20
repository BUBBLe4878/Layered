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
	fetchPII: async ({ locals, params }) => {
		if (!locals.user) throw error(500);
		if (!locals.user.hasAdmin) throw error(403);

		const id = Number(params.id);

		const [row] = await db
			.select({ idvToken: user.idvToken })
			.from(user)
			.where(eq(user.id, id));

		if (!row) throw error(404, { message: 'user not found' });

		if (!row.idvToken) {
			return fail(400, {
				fetchPII: {
					success: false,
					errorMessage: 'missing token',
					first_name: null,
					last_name: null,
					email: null,
					phone_number: null,
					birthday: null,
					address: null
				}
			});
		}

		let userData;

		try {
			const token = decrypt(row.idvToken);
			userData = await getUserData(token);
		} catch {
			return fail(400, {
				fetchPII: {
					success: false,
					errorMessage: 'invalid token',
					first_name: null,
					last_name: null,
					email: null,
					phone_number: null,
					birthday: null,
					address: null
				}
			});
		}

		const first_name = userData?.first_name ?? null;
		const last_name = userData?.last_name ?? null;

		const email =
			userData?.primary_email ??
			userData?.email ??
			userData?.emails?.[0]?.email ??
			null;

		const phone_number =
			userData?.phone_number ??
			userData?.phone_numbers?.[0]?.number ??
			null;

		const birthday =
			userData?.birthday ??
			userData?.date_of_birth ??
			null;

		const address =
			userData?.addresses?.find((a: any) => a.primary) ??
			userData?.addresses?.[0] ??
			null;

		return {
			fetchPII: {
				success: true,
				errorMessage: '',
				first_name,
				last_name,
				email,
				phone_number,
				birthday,
				address
			}
		};
	}
};
