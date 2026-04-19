import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { getSlackUserProfile } from '$lib/server/slack';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		console.log('Slack members endpoint hit');

		const allUsers = await db
			.select({
				id: user.id,
				name: user.name,
				slackId: user.slackId,
				createdAt: user.createdAt
			})
			.from(user);

		const slackMembers = allUsers.filter((u) => u.slackId && u.slackId.trim());

		const membersWithSlackProfiles = await Promise.all(
			slackMembers.map(async (member) => {
				const slackProfile = await getSlackUserProfile(member.slackId);

				return {
					id: member.id,
					name: slackProfile?.username ?? member.name ?? 'Unknown',
					slackId: member.slackId,
					profileImage: slackProfile?.profilePicture ?? null,
					signedUpAt: member.createdAt
				};
			})
		);

		console.log('Found', slackMembers.length, 'members');

		return json({
			success: true,
			count: slackMembers.length,
			members: membersWithSlackProfiles
		});
	} catch (error) {
		console.error('Error fetching members:', error);
		return json(
			{ success: false, error: error instanceof Error ? error.message : 'Unknown error' },
			{ status: 500 }
		);
	}
};
