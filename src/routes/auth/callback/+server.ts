import { env } from '$env/dynamic/private';
import { db } from '$lib/server/db/index.js';
import { user } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import {
        SESSION_EXPIRY_DAYS,
        DAY_IN_MS,
        createSession,
        setSessionTokenCookie,
        generateSessionToken
} from '$lib/server/auth.js';
import { encrypt } from '$lib/server/encryption.js';
import { getUserData } from '$lib/server/idvUserData';
import { airtableBase } from '$lib/server/airtable';

export async function GET(event) {
        const url = event.url;
        const code = url.searchParams.get('code');

        const failed = () => Response.redirect(new URL('/auth/failed', url), 302);
        const ineligible = () => Response.redirect(new URL('/auth/ineligible', url), 302);
        const countdown = () => Response.redirect(new URL('/countdown', url), 302);
        const dashboard = () => Response.redirect(new URL('/dashboard', url), 302);

        if (!code) {
                return failed();
        }

        try {
                const tokenURL = new URL(`https://${env.IDV_DOMAIN}/oauth/token`);

                const urlencoded = new URLSearchParams();
                urlencoded.append('grant_type', 'authorization_code');
                urlencoded.append('client_id', env.IDV_CLIENT_ID ?? '');
                urlencoded.append('client_secret', env.IDV_CLIENT_SECRET ?? '');
                urlencoded.append('redirect_uri', `${url.protocol}//${url.host}/auth/callback`);
                urlencoded.append('code', code);

                const tokenRes = await fetch(tokenURL, {
                        method: 'POST',
                        body: urlencoded
                });

                if (!tokenRes.ok) {
                        return failed();
                }

                const tokenPayload = await tokenRes.json();
                const token = tokenPayload?.access_token;
                if (!token) {
                        return failed();
                }

                let userData;

                try {
                        userData = await getUserData(token);
                } catch {
                        return failed();
                }

                const { id, slack_id, first_name, last_name, primary_email, ysws_eligible } = userData;

                if (
                        !ysws_eligible &&
                        !(
                                env.LOGIN_IDV_BYPASS_SLACK_IDS && env.LOGIN_IDV_BYPASS_SLACK_IDS.split(',').includes(slack_id)
                        )
                ) {
                        return ineligible();
                }

                // Start with IDV-derived values so auth can proceed even if Slack APIs fail.
                let profilePic = null;
                let username = [first_name, last_name].filter(Boolean).join(' ').trim();

                if (env.SLACK_BOT_TOKEN) {
                        try {
                                const slackProfileURL = new URL('https://slack.com/api/users.info');
                                slackProfileURL.searchParams.set('user', slack_id);

                                const slackProfileRes = await fetch(slackProfileURL, {
                                        method: 'GET',
                                        headers: {
                                                Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`
                                        }
                                });

                                const slackProfileResJSON = await slackProfileRes.json();

                                if (slackProfileResJSON.ok) {
                                        const slackProfile = slackProfileResJSON['user'];
                                        profilePic =
                                                slackProfile['profile']['image_1024'] ??
                                                slackProfile['profile']['image_512'] ??
                                                slackProfile['profile']['image_192'] ??
                                                slackProfile['profile']['image_72'] ??
                                                slackProfile['profile']['image_48'] ??
                                                slackProfile['profile']['image_32'] ??
                                                slackProfile['profile']['image_24'];

                                        username =
                                                slackProfile['profile']['display_name'] !== ''
                                                        ? slackProfile['profile']['display_name']
                                                        : slackProfile['profile']['real_name'];
                                } else {
                                        console.error('Failed to fetch user profile from Slack', slackProfileResJSON?.error);
                                }
                        } catch (err) {
                                console.error('Slack profile request failed, using IDV fallback', err);
                        }
                }

                if (!username || username.length === 0) {
                        username = `User ${slack_id}`;
                }

                if (env.BETA_CHANNEL_ID && env.BETA_CHANNEL_ID.length > 0 && env.SLACK_BOT_TOKEN) {
                        try {
                                const channelMembersURL = new URL('https://slack.com/api/conversations.members');
                                channelMembersURL.searchParams.set('channel', env.BETA_CHANNEL_ID);

                                const channelMembersRes = await fetch(channelMembersURL, {
                                        method: 'GET',
                                        headers: {
                                                Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`
                                        }
                                });

                                const channelMembersResJSON = await channelMembersRes.json();

                                if (channelMembersResJSON.ok) {
                                        if (!channelMembersResJSON['members'].includes(slack_id)) {
                                                return countdown();
                                        }
                                } else {
                                        console.error('Failed to fetch channel members', channelMembersResJSON?.error);
                                }
                        } catch (err) {
                                console.error('Slack channel check failed, skipping beta gate fallback', err);
                        }
                }

                let hackatimeTrust: string = 'blue';

                try {
                        hackatimeTrust = (
                                await (
                                        await fetch(`https://hackatime.hackclub.com/api/v1/users/${slack_id}/trust_factor`, {
                                                headers: env.RACK_ATTACK_BYPASS
                                                        ? {
                                                                RACK_ATTACK_BYPASS: env.RACK_ATTACK_BYPASS
                                                        }
                                                        : {}
                                        })
                                ).json()
                        )['trust_level'];
                } catch {
                        /* empty */
                }

                if (hackatimeTrust === 'red') {
                        return Response.redirect('https://fraud.land', 302);
                }

                let [databaseUser] = await db.select().from(user).where(eq(user.idvId, id)).limit(1);

                if (databaseUser?.trust === 'red') {
                        return Response.redirect('https://fraud.land', 302);
                }

                if (!['blue', 'green', 'yellow', 'red'].includes(hackatimeTrust)) {
                        hackatimeTrust = 'blue';
                }

                const isSuperAdmin =
                        env.SUPER_ADMIN_SLACK_ID != undefined &&
                        env.SUPER_ADMIN_SLACK_ID.length > 0 &&
                        slack_id === env.SUPER_ADMIN_SLACK_ID;

                const ref = event.cookies.get('ref');

                if (databaseUser) {
                        await db
                                .update(user)
                                .set({
                                        idvToken: encrypt(token),
                                        name: username,
                                        profilePicture: profilePic,
                                        lastLoginAt: new Date(Date.now()),
                                        hackatimeTrust,
                                        hasAdmin: isSuperAdmin ? true : undefined
                                })
                                .where(eq(user.idvId, id));
                } else {
                        await db.insert(user).values({
                                idvId: id,
                                idvToken: encrypt(token),
                                slackId: slack_id,
                                name: username,
                                profilePicture: profilePic,
                                createdAt: new Date(Date.now()),
                                lastLoginAt: new Date(Date.now()),
                                hackatimeTrust,
                                referralId: ref,
                                hasT1Review: isSuperAdmin,
                                hasT2Review: isSuperAdmin,
                                hasAdmin: isSuperAdmin
                        });

                        [databaseUser] = await db.select().from(user).where(eq(user.idvId, id)).limit(1);

                        if (!databaseUser) {
                                return failed();
                        }

                        if (ref && airtableBase) {
                                try {
                                        await airtableBase('tblwUPbRqbRBnQl7G').create({
                                                fldMYF9BuxKbRuSJt: first_name + ' ' + last_name,
                                                fldXbtQyDOFpWwGBQ: databaseUser.id,
                                                fldkTgzCj0sz01QQM: primary_email,
                                                fldeNiHX4OhZEDWM5: 0,
                                                fld1Sssrs7K69cN0i: 0,
                                                fldaPDWM3wrIYOAEf: ref
                                        });
                                } catch (err) {
                                        console.error('Airtable referral write failed, continuing login', err);
                                }
                        }
                }

                const sessionToken = generateSessionToken();
                await createSession(sessionToken, databaseUser.id);
                setSessionTokenCookie(
                        event,
                        sessionToken,
                        new Date(Date.now() + DAY_IN_MS * SESSION_EXPIRY_DAYS)
                );

                return dashboard();
        } catch (err) {
                console.error('[auth/callback] unhandled failure', err);
                return failed();
        }
}
