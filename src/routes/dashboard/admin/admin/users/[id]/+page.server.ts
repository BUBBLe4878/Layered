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

function parseUserId(rawId: string): number {
	const id = Number.parseInt(rawId, 10);

	if (!Number.isInteger(id) || id <= 0) {
		throw error(404, { message: 'user not found' });
	}

	return id;
}

function normalizePII(userData: Record<string, unknown>) {
	const addresses = Array.isArray(userData.addresses)
		? userData.addresses
		: Array.isArray((userData as { shipping_addresses?: unknown[] }).shipping_addresses)
			? ((userData as { shipping_addresses: unknown[] }).shipping_addresses ?? [])
			: [];

	const primaryAddress =
		addresses.find((a) => {
			const addr = a as { primary?: boolean; is_primary?: boolean };
			return addr.primary === true || addr.is_primary === true;
		}) ?? (addresses.length > 0 ? addresses[0] : null);

	return {
		first_name: (userData.first_name ?? userData.firstName ?? '') as string,
		last_name: (userData.last_name ?? userData.lastName ?? '') as string,
		primary_email: (userData.primary_email ?? userData.email ?? userData.mail ?? '') as string,
		phone_number: (userData.phone_number ?? userData.phoneNumber ?? userData.phone ?? '') as string,
		birthday: (userData.birthday ?? userData.date_of_birth ?? userData.dateOfBirth ?? '') as string,
		address: primaryAddress,
		addresses
	};
}

const userSelect = {
	id: user.id,
	idvId: user.idvId,
	name: user.name,
	profilePicture: user.profilePicture,
	slackId: user.slackId,
	trust: user.trust,
	hackatimeTrust: user.hackatimeTrust,
	clay: user.clay,
	brick: user.brick,
	shopScore: user.shopScore,
	hasBasePrinter: user.hasBasePrinter,
	stickersShipped: user.stickersShipped,
	isPrinter: user.isPrinter,
	hasT1Review: user.hasT1Review,
	hasT2Review: user.hasT2Review,
	hasAdmin: user.hasAdmin,
	referralId: user.referralId,
	createdAt: user.createdAt,
	lastLoginAt: user.lastLoginAt
} as const;

export async function load({ locals, params }) {
	if (!locals.user) {
		throw error(500);
	}
	if (!locals.user.hasAdmin) {
		throw error(403, { message: 'oi get out' });
	}

	const id = parseUserId(params.id);

	const [queriedUser] = await db.select(userSelect).from(user).where(eq(user.id, id));

	const [{ devlogCount }] =
		(await db
			.select({
				devlogCount: sql`COALESCE(COUNT(${devlog.id}), 0)`
			})
			.from(user)
			.leftJoin(devlog, and(eq(devlog.userId, user.id), eq(devlog.deleted, false)))
			.where(eq(user.id, id))
			.groupBy(user.id)) ?? [{ devlogCount: 0 }];

	if (!queriedUser) {
		throw error(404, { message: 'user not found' });
	}

	const queriedUserWithSlackProfile = await withSlackProfile(queriedUser);

	return {
		queriedUser: queriedUserWithSlackProfile,
		devlogCount
	};
}

export const actions = {
	privileges: async ({ locals, request, params }) => {
		if (!locals.user?.hasAdmin) throw error(403, { message: 'oi get out' });

		const id = parseUserId(params.id);
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

		const [queriedUser] = await db.select(userSelect).from(user).where(eq(user.id, id));

		if (!queriedUser) throw error(404, { message: 'user not found' });

		return { queriedUser };
	},

	currency: async ({ locals, request, params }) => {
		if (!locals.user?.hasAdmin) throw error(403, { message: 'oi get out' });

		const id = parseUserId(params.id);
		const data = await request.formData();

		const layers = data.get('clay');
		const layers = data.get('brick');
		const shopScore = data.get('market_score');
		const reason = data.get('reason')?.toString();

		if (
			!layers ||
			isNaN(parseFloat(layers.toString())) ||
			!layers ||
			isNaN(parseFloat(layers.toString())) ||
			!shopScore ||
			isNaN(parseFloat(shopScore.toString()))
		) {
			return fail(400, { currency: { invalidFields: true } });
		}

		if (!reason?.trim()) {
			throw error(400, { message: 'invalid reason' });
		}

		const [oldUser] = await db.select(userSelect).from(user).where(eq(user.id, id));
		if (!oldUser) throw error(404, { message: 'user not found' });

		await db
			.update(user)
			.set({
				clay: parseFloat(layers.toString()),
				brick: parseFloat(layers.toString()),
				shopScore: parseFloat(shopScore.toString())
			})
			.where(eq(user.id, id));

		await db.insert(currencyAuditLog).values({
			adminUserId: locals.user.id,
			targetUserId: id,
			oldClay: oldUser.clay,
			oldBrick: oldUser.brick,
			oldShopScore: oldUser.shopScore,
			newClay: parseFloat(layers.toString()),
			newBrick: parseFloat(layers.toString()),
			newShopScore: parseFloat(shopScore.toString()),
			reason
		});

		const [queriedUserAfter] = await db.select(userSelect).from(user).where(eq(user.id, id));

		return { queriedUserAfter: queriedUserAfter! };
	},

	refreshHackatime: async ({ locals, params }) => {
		if (!locals.user?.hasAdmin) throw error(403, { message: 'oi get out' });

		const id = parseUserId(params.id);

		const [oldUser] = await db.select({ slackId: user.slackId }).from(user).where(eq(user.id, id));

		if (!oldUser) throw error(404, { message: 'user not found' });

		const hackatimeTrust = (
			await (await fetch(`https://hackatime.hackclub.com/api/v1/users/${oldUser.slackId}/trust_factor`)).json()
		)['trust_level'];

		if (!hackatimeTrust) {
			return error(418, { message: 'failed to fetch hackatime trust factor' });
		}

		if (hackatimeTrust === 'red') {
			await db.delete(session).where(eq(session.userId, id));
		}

		await db.update(user).set({ hackatimeTrust }).where(eq(user.id, id));

		const [queriedUser] = await db.select(userSelect).from(user).where(eq(user.id, id));
		return { queriedUser };
	},

	logout: async ({ locals, params }) => {
		if (!locals.user?.hasAdmin) throw error(403, { message: 'oi get out' });

		const id = parseUserId(params.id);

		const [queriedUser] = await db.select(userSelect).from(user).where(eq(user.id, id));
		if (!queriedUser) throw error(404, { message: 'user not found' });

		await db.delete(session).where(eq(session.userId, id));

		return { queriedUser };
	},

	changeTrust: async ({ locals, request, params }) => {
		if (!locals.user?.hasAdmin) throw error(403, { message: 'oi get out' });

		const id = parseUserId(params.id);
		const data = await request.formData();
		const trust = data.get('trust')?.toString();

		if (!trust || !['green', 'blue', 'yellow', 'red'].includes(trust)) {
			return fail(400, { changeTrust: { invalidTrust: true } });
		}

		if (trust === 'red') {
			await db.delete(session).where(eq(session.userId, id));
		}

		await db.update(user).set({ trust: trust as 'green' | 'blue' | 'yellow' | 'red' }).where(eq(user.id, id));

		const [queriedUser] = await db.select(userSelect).from(user).where(eq(user.id, id));
		return { queriedUser };
	},

	impersonate: async (event) => {
		const { locals, params } = event;
		if (!locals.user?.hasAdmin) throw error(403, { message: 'oi get out' });

		const id = parseUserId(params.id);

		const [queriedUser] = await db.select(userSelect).from(user).where(eq(user.id, id));
		if (!queriedUser) throw error(404, { message: 'user not found' });

		await db.insert(impersonateAuditLog).values({
			adminUserId: locals.user.id,
			targetUserId: id
		});

		const sessionToken = generateSessionToken();
		await createSession(sessionToken, id);
		setSessionTokenCookie(event, sessionToken, new Date(Date.now() + DAY_IN_MS * SESSION_EXPIRY_DAYS));

		throw redirect(302, '/dashboard');
	},

	fetchPII: async (event) => {
		const { locals, params } = event;
		if (!locals.user?.hasAdmin) throw error(403, { message: 'oi get out' });

		const id = parseUserId(params.id);

		const [queriedUser] = await db.select({ idvToken: user.idvToken }).from(user).where(eq(user.id, id));

		if (!queriedUser) throw error(404, { message: 'user not found' });

		if (!queriedUser.idvToken) {
			return fail(400, {
				fetchPII: {
					success: false,
					errorMessage: 'IDV token not found, ask them to re-login',
					first_name: '',
					last_name: '',
					primary_email: '',
					phone_number: '',
					birthday: '',
					address: null,
					addresses: []
				}
			});
		}

		let userData: Record<string, unknown>;
		try {
			const token = decrypt(queriedUser.idvToken);
			userData = await getUserData(token);
		} catch {
			return fail(400, {
				fetchPII: {
					success: false,
					errorMessage: 'IDV token revoked/expired, ask them to re-login',
					first_name: '',
					last_name: '',
					primary_email: '',
					phone_number: '',
					birthday: '',
					address: null,
					addresses: []
				}
			});
		}

		const normalized = normalizePII(userData);

		return {
			fetchPII: {
				success: true,
				errorMessage: '',
				...normalized
			}
		};
	}
} satisfies Actions;
