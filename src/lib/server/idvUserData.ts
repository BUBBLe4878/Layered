import { env } from '$env/dynamic/private';

export async function getUserData(token: string) {
	// Fetch from IDV
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

	// Fetch email from Slack using slack_id
	if (identity.slack_id) {
		try {
			const slackRes = await fetch(`https://slack.com/api/users.info?user=${identity.slack_id}`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`
				}
			});
			if (slackRes.ok) {
				const slackData = await slackRes.json();
				if (slackData.ok && slackData.user?.profile?.email) {
					identity.email = slackData.user.profile.email;
					console.log('Fetched email from Slack:', identity.email);
				}
			}
		} catch (err) {
			console.log('Failed to fetch from Slack:', err);
		}
	}

	return identity;
}
