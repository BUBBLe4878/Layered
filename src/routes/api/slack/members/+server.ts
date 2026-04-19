import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';
import crypto from 'crypto';

// Verify request is from Slack
function verifySlackRequest(
  signingSecret: string,
  requestSignature: string,
  timestamp: string,
  body: string
): boolean {
  const time = Math.floor(Date.now() / 1000);
  if (Math.abs(time - parseInt(timestamp)) > 60 * 5) {
    return false; // Request is older than 5 minutes
  }

  const sigBasestring = `v0:${timestamp}:${body}`;
  const mySignature = 'v0=' + 
    crypto.createHmac('sha256', signingSecret)
      .update(sigBasestring)
      .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(requestSignature)
  );
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const GET: RequestHandler = async () => {
  try {
    console.log('🔍 Slack members endpoint hit');
    
    // Check if bot token exists
    if (!process.env.SLACK_BOT_TOKEN) {
      throw new Error('SLACK_BOT_TOKEN not configured');
    }

    const allUsers = await db.select({
      id: user.id,
      slackId: user.slackId,
      createdAt: user.createdAt,
    }).from(user);

    const slackMembers = allUsers.filter(u => u.slackId && u.slackId.trim());
    console.log('Found', slackMembers.length, 'members with Slack IDs');

    const membersWithSlackProfiles = [];
    
    for (const member of slackMembers) {
      try {
        const slackResponse = await fetch(
          `https://slack.com/api/users.info?user=${member.slackId}`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${process.env.SLACK_BOT_TOKEN}`,
            },
          }
        );

        const slackData = await slackResponse.json();

        if (!slackData.ok) {
          console.error(`Slack API error for ${member.slackId}:`, slackData.error);
          membersWithSlackProfiles.push({
            id: member.id,
            name: member.slackId,
            slackId: member.slackId,
            profileImage: null,
            signedUpAt: member.createdAt,
          });
          continue;
        }

        const profile = slackData.user?.profile;
        const profileImage = profile?.image_512 ||
                            profile?.image_256 ||
                            profile?.image_192 ||
                            profile?.image_72 ||
                            null;
        
        const slackUsername = slackData.user?.name || 
                             slackData.user?.real_name || 
                             member.slackId;

        membersWithSlackProfiles.push({
          id: member.id,
          name: slackUsername,
          slackId: member.slackId,
          profileImage,
          signedUpAt: member.createdAt,
        });

        await delay(100);

      } catch (err) {
        console.error(`Error fetching Slack profile for ${member.slackId}:`, err);
        membersWithSlackProfiles.push({
          id: member.id,
          name: member.slackId,
          slackId: member.slackId,
          profileImage: null,
          signedUpAt: member.createdAt,
        });
      }
    }

    console.log('✅ Successfully fetched', membersWithSlackProfiles.length, 'member profiles');

    return json({
      success: true,
      count: membersWithSlackProfiles.length,
      members: membersWithSlackProfiles,
    });

  } catch (error) {
    console.error('❌ Error fetching members:', error);
    return json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
};
