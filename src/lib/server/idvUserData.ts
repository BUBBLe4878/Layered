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

	// Fetch email and address from Slack using slack_id
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
				
				// DEBUG: Log full Slack profile
				console.log('🔍 SLACK USER PROFILE:', JSON.stringify(slackData.user?.profile, null, 2));
				console.log('🔍 Available Slack profile fields:', Object.keys(slackData.user?.profile || {}));
				
				if (slackData.ok && slackData.user?.profile) {
					// Fetch email from Slack
					if (slackData.user.profile.email) {
						identity.email = slackData.user.profile.email;
						console.log('Fetched email from Slack:', identity.email);
					}
					// Try different possible field names for address
					const possibleAddressFields = ['location', 'address', 'street_address', 'real_name', 'phone'];
					for (const field of possibleAddressFields) {
						if (slackData.user.profile[field]) {
							console.log(`Found field "${field}":`, slackData.user.profile[field]);
						}
					}
				}
			}
		} catch (err) {
			console.log('Failed to fetch from Slack:', err);
		}
	}

	return identity;
}
