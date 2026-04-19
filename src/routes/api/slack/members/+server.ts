import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import type { RequestHandler } from './$types';
import { eq } from 'drizzle-orm';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const GET: RequestHandler = async () => {
  try {
    console.log('🔍 Slack members endpoint hit');
    
    // Check if bot token exists
    if (!process.env.SLACK_BOT_TOKEN) {
      throw new Error('SLACK_BOT_TOKEN not configured');
    }

    // Fetch ALL users from your database
    const allUsers = await db
      .select({
        id: user.id,
        name: user.name,           // ← Your app's user name
        email: user.email,         // ← Add if you have it
        slackId: user.slackId,
        createdAt: user.createdAt,
      })
      .from(user);

    const slackMembers = allUsers.filter(u => u.slackId && u.slackId.trim());
    console.log('Found', slackMembers.length, 'members with Slack IDs');

    // Fetch Slack profiles for each user
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
          
          // Still include user data even if Slack fetch fails
          membersWithSlackProfiles.push({
            id: member.id,
            name: member.name,              // From your DB
            email: member.email,            // From your DB
            slackId: member.slackId,
            slackUsername: null,
            slackDisplayName: null,
            slackRealName: null,
            profileImage: null,
            signedUpAt: member.createdAt,
          });
          continue;
        }

        // Extract Slack profile info
        const profile = slackData.user?.profile;
        const profileImage = profile?.image_512 ||
                            profile?.image_256 ||
                            profile?.image_192 ||
                            profile?.image_72 ||
                            null;

        membersWithSlackProfiles.push({
          // Your app's user data
          id: member.id,
          name: member.name,                          // Your DB name
          email: member.email,                        // Your DB email
          slackId: member.slackId,
          
          // Slack profile data
          slackUsername: slackData.user?.name || null,          // @username
          slackDisplayName: profile?.display_name || null,      // Display name
          slackRealName: slackData.user?.real_name || null,     // Real name
          slackEmail: profile?.email || null,                   // Slack email
          slackPhone: profile?.phone || null,                   // Phone (if available)
          slackTitle: profile?.title || null,                   // Job title
          slackStatusText: profile?.status_text || null,        // Status message
          slackStatusEmoji: profile?.status_emoji || null,      // Status emoji
          profileImage: profileImage,
          isSlackAdmin: slackData.user?.is_admin || false,
          isSlackBot: slackData.user?.is_bot || false,
          
          // Timestamps
          signedUpAt: member.createdAt,
        });

        // Rate limiting: wait 100ms between requests
        await delay(100);

      } catch (err) {
        console.error(`Error fetching Slack profile for ${member.slackId}:`, err);
        
        // Fallback to DB data only
        membersWithSlackProfiles.push({
          id: member.id,
          name: member.name,
          email: member.email,
          slackId: member.slackId,
          slackUsername: null,
          slackDisplayName: null,
          slackRealName: null,
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
