import { env } from '$env/dynamic/private';

type SlackProfileData = {
	username: string | null;
	profilePicture: string | null;
};

type UserWithSlackIdentity = {
	slackId: string | null | undefined;
	name: string | null | undefined;
	profilePicture: string | null | undefined;
};

export async function getSlackUserProfile(slackId: string | null | undefined) {
	if (!slackId || !env.SLACK_BOT_TOKEN) {
		return null;
	}

	try {
		const query = new URLSearchParams({ user: slackId });
		const response = await fetch(`https://slack.com/api/users.info?${query.toString()}`, {
			headers: {
				Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`
			}
		});

		if (!response.ok) {
			throw new Error(`Slack users.info request failed with ${response.status}`);
		}

		const data = await response.json();

		if (!data?.ok) {
			throw new Error(`Slack users.info returned error: ${data?.error ?? 'unknown_error'}`);
		}

		const profile = data?.user?.profile;
		const profilePicture =
			profile?.image_512 ??
			profile?.image_256 ??
			profile?.image_192 ??
			profile?.image_72 ??
			profile?.image_48 ??
			null;
		const username =
			profile?.display_name_normalized ??
			profile?.display_name ??
			data?.user?.name ??
			profile?.real_name_normalized ??
			profile?.real_name ??
			null;

		return {
			username,
			profilePicture
		} satisfies SlackProfileData;
	} catch (error) {
		console.error(`Failed to fetch Slack profile for ${slackId}:`, error);
		return null;
	}
}

export async function withSlackProfile<T extends UserWithSlackIdentity>(user: T): Promise<T> {
	const profile = await getSlackUserProfile(user.slackId);
	if (!profile) {
		return user;
	}

	return {
		...user,
		name: profile.username ?? user.name,
		profilePicture: profile.profilePicture ?? user.profilePicture
	};
}

export async function withSlackProfiles<T extends UserWithSlackIdentity>(users: T[]): Promise<T[]> {
	const cache = new Map<string, Promise<SlackProfileData | null>>();

	return await Promise.all(
		users.map(async (user) => {
			if (!user.slackId) {
				return user;
			}

			let profilePromise = cache.get(user.slackId);
			if (!profilePromise) {
				profilePromise = getSlackUserProfile(user.slackId);
				cache.set(user.slackId, profilePromise);
			}

			const profile = await profilePromise;
			if (!profile) {
				return user;
			}

			return {
				...user,
				name: profile.username ?? user.name,
				profilePicture: profile.profilePicture ?? user.profilePicture
			};
		})
	);
}

export async function sendSlackDM(userId: string, message: string) {
	const token = env.SLACK_BOT_TOKEN;

	if (!token) {
		console.warn('SLACK_BOT_TOKEN not configured');
		return;
	}

	try {
		const res = await fetch('https://slack.com/api/chat.postMessage', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`
			},
			body: JSON.stringify({
				channel: userId,
				text: message
			})
		});

		const data = await res.json();

		if (!data.ok) {
			console.error('Failed to send Slack DM:', data.error);
		}
	} catch (err) {
		console.error('Error sending Slack DM:', err);
	}
}
