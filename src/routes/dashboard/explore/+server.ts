// src/routes/dashboard/explore/+server.ts

import { json } from '@sveltejs/kit';
import { fetchExploreDevlogs, type SortType } from './devlogs.js';

export async function GET({ url, locals }) {
	const offsetParam = url.searchParams.get('offset');
	const sortParam = url.searchParams.get('sort') as SortType | null;

	const offset = offsetParam ? Number.parseInt(offsetParam, 10) : 0;
	const sort: SortType = sortParam || 'newest';

	if (!Number.isFinite(offset) || offset < 0) {
		return json({ error: 'Invalid offset' }, { status: 400 });
	}

	const devlogs = await fetchExploreDevlogs(offset, sort, locals.user?.id);
	const nextOffset = offset + devlogs.length;

	return json({
		devlogs,
		nextOffset,
		hasMore: devlogs.length === 15 // DEVLOGS_PAGE_SIZE
	});
}
