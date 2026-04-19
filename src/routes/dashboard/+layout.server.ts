import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';

export async function load({ locals }) {
	if (!locals.user) {
		throw redirect(302, '/auth/idv');
	}

	let profilePicture = locals.user.profilePicture;

	if (locals.user.slackId && env.SLACK_BOT_TOKEN) {
		try {
			const query = new URLSearchParams({ user: locals.user.slackId });
			const response = await fetch(`https://slack.com/api/users.info?${query.toString()}`, {
				headers: {
					Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`
				}
			});
			const data = await response.json();
			const slackProfilePicture =
				data?.user?.profile?.image_512 ??
				data?.user?.profile?.image_192 ??
				data?.user?.profile?.image_72;

			if (data?.ok && typeof slackProfilePicture === 'string' && slackProfilePicture.length > 0) {
				profilePicture = slackProfilePicture;
			}
		} catch (error) {
			console.error('Failed to fetch Slack profile picture for sidebar:', error);
		}
	}

	return {
		user: {
			id: locals.user.id,
			slackId: locals.user.slackId,
			name: locals.user.name,
			profilePicture,
			clay: locals.user.clay,
			brick: locals.user.brick,
			shopScore: locals.user.shopScore,
			isPrinter: locals.user.isPrinter,
			hasT1Review: locals.user.hasT1Review,
			hasT2Review: locals.user.hasT2Review,
			hasAdmin: locals.user.hasAdmin,
			hasBasePrinter: locals.user.hasBasePrinter,
			printer: locals.user.printer,
			printerFulfilment: locals.user.printerFulfilment
		},
		s3PublicUrl: env.S3_PUBLIC_URL
	};
}
