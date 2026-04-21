import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
import { getSlackUserProfile } from '$lib/server/slack';

export async function load({ locals }) {
	if (!locals.user) {
		throw redirect(302, '/auth/idv');
	}

	const slackProfile = await getSlackUserProfile(locals.user.slackId);

	const profilePicture =
		slackProfile?.profilePicture ?? locals.user.profilePicture;

	const name =
		slackProfile?.username ?? locals.user.name;

	return {
		user: {
			id: locals.user.id,
			slackId: locals.user.slackId,
			name,
			profilePicture,

			clay: locals.user.clay ?? 0,
			brick: locals.user.brick ?? 0,

			shopScore: locals.user.shopScore ?? 0,

			isPrinter: locals.user.isPrinter ?? false,
			hasT1Review: locals.user.hasT1Review ?? false,
			hasT2Review: locals.user.hasT2Review ?? false,
			hasAdmin: locals.user.hasAdmin ?? false,
			hasBasePrinter: locals.user.hasBasePrinter ?? false,

			printer: locals.user.printer ?? null,
			printerFulfilment: locals.user.printerFulfilment ?? null
		},

		s3PublicUrl: env.S3_PUBLIC_URL
	};
}
