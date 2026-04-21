import { db } from '$lib/server/db/index.js';
import { ovenpheusLog, user } from '$lib/server/db/schema.js';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions } from './$types';
import { LAYERS_PER_HOUR, LAYERS_PER_HOUR_CONVERTED, CLAY_PER_HOUR } from '$lib/defs';

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
		const benchies = data.get('benchies');

		if (
			!benchies ||
			!parseInt(benchies.toString()) ||
			parseInt(benchies.toString()) <= 0 ||
			parseInt(benchies.toString()) > locals.user.benchies
		) {
			return error(400, { message: 'invalid benchies' });
		}

		const parsedBenchies = parseInt(benchies.toString());
		const layers =
			(parsedBenchies / CLAY_PER_HOUR) *
			(locals.user.hasBasePrinter ? LAYERS_PER_HOUR : LAYERS_PER_HOUR_CONVERTED);

		await db
			.update(user)
			.set({
				benchies: locals.user.benchies - parsedBenchies,
				layer: locals.user.layer + layers
			})
			.where(eq(user.id, locals.user.id));

		await db.insert(ovenpheusLog).values({
			userId: locals.user.id,
			benchies: parsedBenchies,
			layersReceived: layers
		});

		return redirect(302, '/dashboard/printshop');
	}
} satisfies Actions;
