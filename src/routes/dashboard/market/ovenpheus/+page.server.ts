import { db } from '$lib/server/db/index.js';
import { ovenpheusLog, user } from '$lib/server/db/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions } from './$types';
import { BRICKS_PER_HOUR, BRICKS_PER_HOUR_CONVERTED, CLAY_PER_HOUR } from '$lib/defs';

export async function load({ locals }) {
	if (!locals.user) {
		throw error(500);
	}

	return {};
}

export const actions = {
	default: async ({ locals, request }) => {
		if (!locals.user) {
			throw error(500);
		}

		const data = await request.formData();
		const benchies = data.get('clay');

		if (
			!benchies ||
			!parseInt(benchies.toString()) ||
			parseInt(benchies.toString()) <= 0 ||
			parseInt(benchies.toString()) > locals.user.clay
		) {
			return error(400, { message: 'invalid benchies' });
		}

		const parsedBenchies = parseInt(benchies.toString());
		const layers =
			(parsedBenchies / CLAY_PER_HOUR) *
			(locals.user.hasBasePrinter ? BRICKS_PER_HOUR : BRICKS_PER_HOUR_CONVERTED);

		await db
			.update(user)
			.set({
				clay: locals.user.clay - parsedBenchies,
				brick: locals.user.brick + layers
			})
			.where(eq(user.id, locals.user.id));

		await db.insert(ovenpheusLog).values({
			userId: locals.user.id,
			clay: parsedBenchies,
			bricksReceived: layers
		});

		return redirect(302, '/dashboard/market');
	}
} satisfies Actions;
