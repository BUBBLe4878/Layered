import { fetchExploreDevlogs } from './devlogs.js';

export async function GET({ url, locals }) {
	const offset = Number(url.searchParams.get('offset') ?? 0);
	const sort = url.searchParams.get('sort') ?? 'newest';

	const devlogs = await fetchExploreDevlogs(offset, sort, locals.user?.id);

	return Response.json({
		devlogs,
		nextOffset: offset + devlogs.length,
		hasMore: devlogs.length === 15
	});
}
