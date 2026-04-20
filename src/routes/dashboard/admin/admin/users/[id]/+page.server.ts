import { db } from '$lib/server/db/index.js';
import {
	user,
	devlog,
	session,
	impersonateAuditLog,
	currencyAuditLog
} from '$lib/server/db/schema.js';

import { error, fail, redirect } from '@sveltejs/kit';
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
	if (!locals.user.hasAdmin) throw error(403, { message: 'oi get out' });

	const id = Number(params.id);

	// Get user
	const [queriedUser] = await db
		.select()
		.from(user)
		.where(eq(user.id, id));

	if (!queriedUser) {
		throw error(404, { message: 'user not found' });
	}

	// Devlog count
	const [{ devlogCount }] =
		(await db
			.select({
				devlogCount: sql<number>`COALESCE(COUNT(${devlog.id}), 0)`
			})
			.from(user)
			.leftJoin(devlog, and(eq(devlog.userId, user.id), eq(devlog.deleted, false)))
			.where(eq(user.id, id))
			.groupBy(user.id)) ?? [{ devlogCount: 0 }];

	// Slack enrichment
	const queriedUserWithSlackProfile = await withSlackProfile(queriedUser);

	return {
		queriedUser: queriedUserWithSlackProfile,
		devlogCount
	};
}

/* =========================================================
   ACTIONS
========================================================= */

export const actions = {
	/* -------------------- PRIVILEGES -------------------- */
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

	/* -------------------- CURRENCY -------------------- */
	currency: async ({ locals, request, params }) => {
		if (!locals.user) throw error(500);
		if (!locals.user.hasAdmin) throw error(403);

		const id = Number(params.id);
		const data = await request.formData();

		const clay = data.get('clay');
		const brick = data.get('brick');
		const shopScore = data.get('market_score');
		const reason = data.get('reason')?.toString();

		if (
			!clay ||
			isNaN(Number(clay)) ||
			!brick ||
			isNaN(Number(brick)) ||
			!shopScore ||
			isNaN(Number(shopScore))
		) {
			return fail(400, {
				currency: {
					invalidFields: true
				}
			});
		}

		if (!reason) {
			throw error(400, { message: 'invalid reason' });
		}

		const [queriedUser] = await db
			.select()
			.from(user)
			.where(eq(user.id, id));

		if (!queriedUser) {
			throw error(404, { message: 'user not found' });
		}

		await db
			.update(user)
			.set({
				clay: Number(clay),
				brick: Number(brick),
				shopScore: Number(shopScore)
			})
			.where(eq(user.id, id));

		await db.insert(currencyAuditLog).values({
			adminUserId: locals.user.id,
			targetUserId: id,
			oldClay: queriedUser.clay,
			oldBrick: queriedUser.brick,
			oldShopScore: queriedUser.shopScore,
			newClay: Number(clay),
			newBrick: Number(brick),
			newShopScore: Number(shopScore),
			reason
		});

		return {
			queriedUserAfter: await db.query.user.findFirst({
				where: eq(user.id, id)
			})
		};
	},

	/* -------------------- FETCH PII -------------------- */
	fetchPII: async ({ locals, params }) => {
	if (!locals.user) throw error(500);
	if (!locals.user.hasAdmin) throw error(403);

	const id = Number(params.id);

	const [queriedUser] = await db
		.select({ idvToken: user.idvToken })
		.from(user)
		.where(eq(user.id, id));

	if (!queriedUser) throw error(404, { message: 'user not found' });

	if (!queriedUser.idvToken) {
		return fail(400, {
			fetchPII: {
				success: false,
				errorMessage: 'IDV token missing',
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
		const token = decrypt(queriedUser.idvToken);
		userData = await getUserData(token);
	} catch {
		return fail(400, {
			fetchPII: {
				success: false,
				errorMessage: 'IDV token expired or invalid',
				first_name: null,
				last_name: null,
				email: null,
				phone_number: null,
				birthday: null,
				address: null
			}
		});
	}

	// 🔥 NORMALIZE DATA SAFELY (this is the important fix)
	const first_name = userData.first_name ?? null;
	const last_name = userData.last_name ?? null;

	const email =
		userData.primary_email ??
		userData.email ??
		userData.emails?.[0]?.email ??
		null;

	const phone_number =
		userData.phone_number ??
		userData.phone_numbers?.[0]?.number ??
		null;

	const birthday =
		userData.birthday ??
		userData.date_of_birth ??
		null;

	const address =
		userData.address ??
		userData.addresses?.find((a: any) => a.primary) ??
		userData.addresses?.[0] ??
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
