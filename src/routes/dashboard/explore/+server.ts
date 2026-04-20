// src/routes/dashboard/explore/+server.ts

import { json } from '@sveltejs/kit';
import { fetchExploreDevlogs, type SortType, DEVLOGS_PAGE_SIZE } from './devlogs.js';

export async function GET({ url, locals }) {
	console.log('🔍 [Explore GET] Request received');
	const offsetParam = url.searchParams.get('offset');
	const sortParam = url.searchParams.get('sort') as SortType | null;

	console.log('🔍 [Explore GET] Params - offset:', offsetParam, 'sort:', sortParam);

	const offset = offsetParam ? Number.parseInt(offsetParam, 10) : 0;
	const sort: SortType = sortParam || 'newest';

	if (!Number.isFinite(offset) || offset < 0) {
		console.error('❌ [Explore GET] Invalid offset:', offset);
		return json({ error: 'Invalid offset' }, { status: 400 });
	}

	try {
		console.log('🔍 [Explore GET] Calling fetchExploreDevlogs...');
		const devlogs = await fetchExploreDevlogs(offset, sort, locals.user?.id);
		console.log('🔍 [Explore GET] Got devlogs:', devlogs.length);

		const nextOffset = offset + devlogs.length;
		const hasMore = devlogs.length === DEVLOGS_PAGE_SIZE;

		console.log('🔍 [Explore GET] Returning - nextOffset:', nextOffset, 'hasMore:', hasMore);

		return json({
			devlogs,
			nextOffset,
			hasMore
		});
	} catch (err) {
		console.error('❌ [Explore GET] Error:', err);
		return json(
			{ 
				error: 'Failed to fetch devlogs',
				details: err instanceof Error ? err.message : String(err)
			},
			{ status: 500 }
		);
	}
}
