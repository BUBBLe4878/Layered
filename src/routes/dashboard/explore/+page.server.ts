import { DEVLOGS_PAGE_SIZE, fetchExploreDevlogs, type SortType } from './devlogs.js';

export async function load({ url, locals }) {
	const sortParam = url.searchParams.get('sort') as SortType | null;
	const sort: SortType = sortParam || 'newest';

	const devlogs = await fetchExploreDevlogs(0, sort, locals.user?.id);
	const nextOffset = devlogs.length;
	const hasMore = devlogs.length === DEVLOGS_PAGE_SIZE;

	return {
		devlogs,
		nextOffset,
		hasMore
	};
}
