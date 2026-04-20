import { env } from '$env/dynamic/private';

async function fetchIDVEndpoint(token: string, endpoint: string) {
	try {
		const res = await fetch(`https://${env.IDV_DOMAIN}/api/v1/${endpoint}`, {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`
			}
		});
		if (!res.ok) {
			console.log(`IDV ${endpoint} returned ${res.status}`);
			return null;
		}
		const data = await res.json();
		console.log(`IDV ${endpoint}:`, JSON.stringify(data, null, 2));
		return data;
	} catch (err) {
		console.log(`IDV ${endpoint} error:`, err);
		return null;
	}
}

export async function getUserData(token: string) {
	// Try the main endpoint
	const meRes = await fetch(`https://${env.IDV_DOMAIN}/api/v1/me`, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`
		}
	});
	if (!meRes.ok) {
		throw new Error('Failed to fetch user data');
	}
	const meJSON = await meRes.json();
	const identity = meJSON.identity!;

	// Try alternative endpoints for additional data
	console.log('Fetching from alternative IDV endpoints...');
	await fetchIDVEndpoint(token, 'me/profile');
	await fetchIDVEndpoint(token, 'me/details');
	await fetchIDVEndpoint(token, 'me/pii');
	await fetchIDVEndpoint(token, 'me/contact');
	await fetchIDVEndpoint(token, 'me/address');
	await fetchIDVEndpoint(token, 'profile');

	return identity;
}
