import { env } from '$env/dynamic/private';
import Cryptr from 'cryptr';

let cryptr: Cryptr | null = null;

function getCryptr() {
	const secret = env.APP_SECRET_KEY?.trim();

	if (!secret) {
		throw new Error('Missing APP_SECRET_KEY for encryption');
	}

	if (!cryptr) {
		cryptr = new Cryptr(secret);
	}

	return cryptr;
}

export function encrypt(plaintext: string) {
	return getCryptr().encrypt(plaintext);
}

export function decrypt(ciphertext: string) {
	return getCryptr().decrypt(ciphertext);
}
