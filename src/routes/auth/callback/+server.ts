import { redirect, error } from '@sveltejs/kit';
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

	// !urlState || !code
	if (!code) {
		return error(400, { message: 'no oauth code, hmm what happened here' });
	}

	// Get token
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
		return redirect(302, '/auth/failed');
	}

	const token = (await tokenRes.json()).access_token;

	// Get user data
	let userData;

	try {
		userData = await getUserData(token);
	} catch {
		return redirect(302, '/auth/failed');
	}

	const { 
		id, 
		slack_id, 
		first_name, 
		last_name, 
		primary_email, 
		ysws_eligible,
		// Additional fields from IDV
		phone,
		phoneNumber,
		phone_number,
		address,
		street_address,
		street,
		city,
		state,
		province,
		zipCode,
		zip,
		postal_code,
		country,
		dateOfBirth,
		date_of_birth,
		birthday,
		age,
		gender,
		sex,
		pronouns,
		bio,
		biography,
		organization,
		org,
		title,
		job_title,
		company,
		website,
		website_url,
		twitter,
		twitter_handle,
		github,
		github_username,
		linkedin,
		linkedin_profile,
		profilePicture,
		profile_picture,
		picture
	} = userData;

	if (
		!ysws_eligible &&
		!(
			env.LOGIN_IDV_BYPASS_SLACK_IDS && env.LOGIN_IDV_BYPASS_SLACK_IDS.split(',').includes(slack_id)
		)
	) {
		return redirect(302, '/auth/ineligible');
	}

	// Use IDV data for profile (no Slack bot token required)
	const username = first_name && last_name ? `${first_name} ${last_name}` : first_name || 'User';
	// Generate avatar using UI Avatars service with user's name - creates nice colorful initials
	const profilePic = profilePicture || profile_picture || picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&size=1024`;

	// Check Hackatime trust
	// Bypasses check if hackatime fetching fails for some reason, e.g. hackatime down
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

	if (!hackatimeTrust) {
		// console.error();
		// return redirect(302, '/auth/create-hackatime-account');
		// return error(503, {
		// 	message: 'failed to fetch hackatime trust factor, please try again later'
		// });
	} else if (hackatimeTrust === 'red') {
		// Prevent login
		return redirect(302, 'https://fraud.land');
	}

	// Create user if doesn't exist
	let [databaseUser] = await db.select().from(user).where(eq(user.idvId, id)).limit(1);

	if (databaseUser?.trust === 'red') {
		// Prevent login
		return redirect(302, 'https://fraud.land');
	}

	if (!['blue', 'green', 'yellow', 'red'].includes(hackatimeTrust)) {
		// weird hackatime issue, assume blue
		hackatimeTrust = 'blue';
	}

	const isSuperAdmin =
		env.SUPER_ADMIN_SLACK_ID != undefined &&
		env.SUPER_ADMIN_SLACK_ID.length > 0 &&
		slack_id === env.SUPER_ADMIN_SLACK_ID;

	const ref = event.cookies.get('ref');

	// Prepare comprehensive user data
	const comprehensiveUserData = {
		idvToken: encrypt(token),
		name: username,
		firstName: first_name,
		lastName: last_name,
		email: primary_email,
		phone: phone || phoneNumber || phone_number,
		address: address || street_address || street,
		city: city,
		state: state || province,
		zipCode: zipCode || zip || postal_code,
		country: country,
		dateOfBirth: dateOfBirth || date_of_birth || birthday ? new Date(dateOfBirth || date_of_birth || birthday) : null,
		age: age,
		gender: gender || sex,
		pronouns: pronouns,
		bio: bio || biography,
		organization: organization || org,
		title: title || job_title,
		company: company,
		website: website || website_url,
		twitter: twitter || twitter_handle,
		github: github || github_username,
		linkedin: linkedin || linkedin_profile,
		profilePicture: profilePic,
		lastLoginAt: new Date(Date.now()),
		hackatimeTrust
	};

	if (databaseUser) {
		// Update user with comprehensive data
		const updateData: Parameters<typeof db.update>[0]['_']['set'] = comprehensiveUserData;

		// Only update hasAdmin if user is super admin
		if (isSuperAdmin) {
			updateData.hasAdmin = true;
		}

		await db
			.update(user)
			.set(updateData)
			.where(eq(user.idvId, id));
	} else {
		// Create user with comprehensive data
		await db.insert(user).values({
			idvId: id,
			slackId: slack_id,
			...comprehensiveUserData,
			createdAt: new Date(Date.now()),
			referralId: ref,

			hasT1Review: isSuperAdmin,
			hasT2Review: isSuperAdmin,
			hasAdmin: isSuperAdmin
		});

		[databaseUser] = await db.select().from(user).where(eq(user.idvId, id)).limit(1);

		if (!databaseUser) {
			// Something went _really_ wrong
			return error(500);
		}

		if (ref && airtableBase) {
			await airtableBase('tblwUPbRqbRBnQl7G').create({
				fldMYF9BuxKbRuSJt: first_name + ' ' + last_name, // Name
				fldXbtQyDOFpWwGBQ: databaseUser.id, // User ID
				fldkTgzCj0sz01QQM: primary_email, // Email
				fldeNiHX4OhZEDWM5: 0, // Project count
				fld1Sssrs7K69cN0i: 0, // Verified ship count
				fldaPDWM3wrIYOAEf: ref // Referral code
			});
		}
	}

	const sessionToken = generateSessionToken();
	await createSession(sessionToken, databaseUser.id);
	setSessionTokenCookie(
		event,
		sessionToken,
		new Date(Date.now() + DAY_IN_MS * SESSION_EXPIRY_DAYS)
	);

	return redirect(302, '/dashboard');
}
