import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';
// import crypto from 'crypto';
export function GET({ url }) {
	// const state = crypto.randomBytes(32).toString('hex');
	// cookies.set('oauth_state', state, { path: '/', maxAge: 600 });
	//const scopes = 'openid profile email phone address birthdate';//when we get verified we do this
	const scopes = 'openid profile email name profile verification_status slack_id';
	const redirectURL = new URL(`https://${env.IDV_DOMAIN}/oauth/authorize`);
	redirectURL.searchParams.set('client_id', env.IDV_CLIENT_ID ?? '');
	redirectURL.searchParams.set('redirect_uri', `${url.protocol}//${url.host}/auth/callback`);
	redirectURL.searchParams.set('response_type', 'code');
	redirectURL.searchParams.set('scope', scopes);
	// redirectURL.searchParams.set('state', state);
	return redirect(302, redirectURL);
}
