export function load({ url }) {
	return {
		reason: url.searchParams.get('reason'),
		detail: url.searchParams.get('detail')
	};
}
