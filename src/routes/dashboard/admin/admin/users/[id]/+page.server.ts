import { db } from '$lib/server/db/index.js';
import { user, devlog, session, impersonateAuditLog, currencyAuditLog } from '$lib/server/db/schema.js';

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
			.groupBy(user.id))) ?? [{ devlogCount: 0 }];

	const enrichedUser = await withSlackProfile(queriedUser);

	return {
		queriedUser: enrichedUser,
		devlogCount
	};
}

/* =========================================================
   ACTIONS
========================================================= */

export const actions = {
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

		if (isNaN(clay) || isNaN(brick) || isNaN(shopScore)) {
			return fail(400, {
				currency: { invalidFields: true }
			});
		}

		if (!reason) {
			throw error(400, { message: 'invalid reason' });
		}

		const [queriedUser] = await db
			.select()
			.from(user)
			.where(eq(user.id, id));

		if (!queriedUser) throw error(404, { message: 'user not found' });

		await db
			.update(user)
			.set({ clay, brick, shopScore })
			.where(eq(user.id, id));

		await db.insert(currencyAuditLog).values({
			adminUserId: locals.user.id,
			targetUserId: id,
			oldClay: queriedUser.clay,
			oldBrick: queriedUser.brick,
			oldShopScore: queriedUser.shopScore,
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

	/* ---------------- IMPERSONATE ---------------- */
	impersonate: async (event) => {
		const { locals, params } = event;

		if (!locals.user) throw error(500);
		if (!locals.user.hasAdmin) throw error(403);

		const id = Number(params.id);

		const [queriedUser] = await db
			.select()
			.from(user)
			.where(eq(user.id, id));

		if (!queriedUser) throw error(404);

		await db.insert(impersonateAuditLog).values({
			adminUserId: locals.user.id,
			targetUserId: id
		});

		const token = generateSessionToken();

		await createSession(token, id);

		setSessionTokenCookie(
			event,
			token,
			new Date(Date.now() + DAY_IN_MS * SESSION_EXPIRY_DAYS)
		);

		throw redirect(302, '/dashboard');
	},

	/* ---------------- LOGOUT ---------------- */
	logout: async ({ locals, params }) => {
		if (!locals.user) throw error(500);
		if (!locals.user.hasAdmin) throw error(403);

		const id = Number(params.id);

		await db.delete(session).where(eq(session.userId, id));

		return {
			success: true
		};
	},

	/* ---------------- FETCH PII (FIXED + NORMALIZED) ---------------- */
	fetchPII: async ({ locals, params }) => {
		if (!locals.user) throw error(500);
		if (!locals.user.hasAdmin) throw error(403);

		const id = Number(params.id);

		const [queriedUser] = await db
			.select({ idvToken: user.idvToken })
			.from(user)
			.where(eq(user.id, id));

		if (!queriedUser) throw error(404);

		const empty = {
			success: false,
			errorMessage: '',
			first_name: '',
			last_name: '',
			primary_email: '',
			phone_number: '',
			birthday: '',
			address: null
		};

		if (!queriedUser.idvToken) {
			return fail(400, {
				fetchPII: { ...empty, errorMessage: 'Missing IDV token' }
			});
		}

		let userData;

		try {
			const token = decrypt(queriedUser.idvToken);
			userData = await getUserData(token);
		} catch {
			return fail(400, {
				fetchPII: { ...empty, errorMessage: 'Invalid or expired token' }
			});
		}

		const address = Array.isArray(userData.addresses)
			? userData.addresses.find((a: any) => a.primary) ??
			  userData.addresses[0] ??
			  null
			: null;

		return {
			fetchPII: {
				success: true,
				errorMessage: '',
				first_name: userData.first_name ?? '',
				last_name: userData.last_name ?? '',
				primary_email:
					userData.primary_email ??
					userData.email ??
					userData.emails?.[0]?.email ??
					'',
				phone_number:
					userData.phone_number ??
					userData.phone_numbers?.[0]?.number ??
					'',
				birthday: userData.birthday ?? userData.date_of_birth ?? '',
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
	}
} satisfies Actions;
