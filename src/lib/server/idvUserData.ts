import { env } from '$env/dynamic/private';

export async function getUserData(token: string) {
	const userDataURL = new URL(`https://${env.IDV_DOMAIN}/api/v1/me`);
	const userDataRes = await fetch(userDataURL, {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`
		}
	});

	if (!userDataRes.ok) {
		throw new Error('Failed to fetch user data');
	}

	const userDataJSON = await userDataRes.json();

	return userDataJSON.identity!;
}
