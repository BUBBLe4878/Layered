// src/routes/auth/callback/+server.ts
import { json, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchSlackProfile(slackId: string, botToken: string) {
  const response = await fetch(
    `https://slack.com/api/users.info?user=${slackId}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${botToken}`,
      },
    }
  );
  return await response.json();
}

export const GET: RequestHandler = async ({ url, cookies, locals }) => {
  try {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      console.error('Slack OAuth error:', error);
      return redirect(303, '/login?error=slack_auth_failed');
    }

    if (!code) {
      return redirect(303, '/login?error=no_code');
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.SLACK_CLIENT_ID!,
        client_secret: process.env.SLACK_CLIENT_SECRET!,
        code: code,
        redirect_uri: `${url.origin}/auth/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.ok) {
      console.error('Slack token exchange failed:', tokenData.error);
      return redirect(303, '/login?error=token_exchange_failed');
    }

    // Get Slack user info
    const slackUserId = tokenData.authed_user.id;
    const accessToken = tokenData.authed_user.access_token;

    // Fetch full Slack profile
    const slackProfileData = await fetchSlackProfile(
      slackUserId,
      process.env.SLACK_BOT_TOKEN!
    );

    if (!slackProfileData.ok) {
      console.error('Failed to fetch Slack profile:', slackProfileData.error);
      return redirect(303, '/login?error=profile_fetch_failed');
    }

    const profile = slackProfileData.user?.profile;
    const slackEmail = profile?.email;
    const slackRealName = slackProfileData.user?.real_name;
    const slackUsername = slackProfileData.user?.name;

    // Check if user exists in your database
    let [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.slackId, slackUserId))
      .limit(1);

    if (!existingUser && slackEmail) {
      // Try to find by email
      [existingUser] = await db
        .select()
        .from(user)
        .where(eq(user.email, slackEmail))
        .limit(1);
    }

    if (existingUser) {
      // Update existing user with Slack data
      await db
        .update(user)
        .set({
          slackId: slackUserId,
          name: slackRealName || existingUser.name,
          email: slackEmail || existingUser.email,
          // Add any other fields you want to update
        })
        .where(eq(user.id, existingUser.id));

      console.log(`✅ Updated user ${existingUser.id} with Slack data`);
    } else {
      // Create new user
      const [newUser] = await db
        .insert(user)
        .values({
          slackId: slackUserId,
          name: slackRealName || slackUsername || 'Slack User',
          email: slackEmail,
          createdAt: new Date(),
        })
        .returning();

      existingUser = newUser;
      console.log(`✅ Created new user ${newUser.id} from Slack`);
    }

    // Set session cookie
    cookies.set('session', existingUser.id.toString(), {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    // Redirect to dashboard or home
    return redirect(303, '/dashboard');

  } catch (error) {
    console.error('❌ OAuth callback error:', error);
    return redirect(303, '/login?error=unexpected_error');
  }
};
