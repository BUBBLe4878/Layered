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

	// Log all available fields
	console.log('🔍 IDV IDENTITY FIELDS:', Object.keys(identity));
	console.log('🔍 FULL IDV IDENTITY:', JSON.stringify(identity, null, 2));

	// Enrich with more information
	const enrichedIdentity = {
		...identity,
		// Personal Info
		fullName: identity.name || `${identity.firstName || ''} ${identity.lastName || ''}`.trim(),
		firstName: identity.firstName || identity.first_name,
		lastName: identity.lastName || identity.last_name,
		email: identity.email,
		
		// Contact Info
		phone: identity.phone || identity.phoneNumber || identity.phone_number,
		address: identity.address || identity.street_address || identity.street || identity.location,
		city: identity.city,
		state: identity.state,
		zipCode: identity.zipCode || identity.zip || identity.postal_code,
		country: identity.country,
		
		// Birth & Demographics
		dateOfBirth: identity.dateOfBirth || identity.date_of_birth || identity.birthday || identity.dob,
		age: identity.age,
		gender: identity.gender || identity.sex,
		pronouns: identity.pronouns,
		
		// Profile
		profilePicture: identity.profilePicture || identity.profile_picture || identity.picture || identity.avatar,
		bio: identity.bio || identity.biography,
		
		// Account Info
		createdAt: identity.createdAt || identity.created_at,
		updatedAt: identity.updatedAt || identity.updated_at,
		
		// Verification
		verified: identity.verified || identity.is_verified,
		verifiedEmail: identity.verifiedEmail || identity.verified_email,
		
		// IDs
		slackId: identity.slack_id || identity.slackId,
		idvId: identity.idv_id || identity.idvId || identity.id,
		
		// Additional Info
		organization: identity.organization || identity.org,
		title: identity.title || identity.job_title,
		company: identity.company,
		website: identity.website || identity.website_url,
		twitter: identity.twitter || identity.twitter_handle,
		github: identity.github || identity.github_username,
		linkedin: identity.linkedin || identity.linkedin_profile,
	};

	// Fetch email from Slack using slack_id (as backup/refresh)
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
				if (slackData.ok && slackData.user?.profile) {
					enrichedIdentity.email = slackData.user.profile.email;
					enrichedIdentity.phone = enrichedIdentity.phone || slackData.user.profile.phone;
					enrichedIdentity.profilePicture = enrichedIdentity.profilePicture || slackData.user.profile.image_512;
					console.log('Enriched data from Slack');
				}
			}
		} catch (err) {
			console.log('Failed to fetch from Slack:', err);
		}
	}

	console.log('✅ Enriched identity object keys:', Object.keys(enrichedIdentity));

	return enrichedIdentity;
}
