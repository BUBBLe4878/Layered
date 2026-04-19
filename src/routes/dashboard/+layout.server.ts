import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import { getSlackUserProfile } from '$lib/server/slack';

export async function load({ locals }) {
	if (!locals.user) {
		throw redirect(302, '/auth/idv');
	}

	const slackProfile = await getSlackUserProfile(locals.user.slackId);
	const profilePicture = slackProfile?.profilePicture ?? locals.user.profilePicture;
	const name = slackProfile?.username ?? locals.user.name;

	return {
		user: {
			id: locals.user.id,
			slackId: locals.user.slackId,
			name,
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
