import {
	signInWithPopup,
	GoogleAuthProvider,
	OAuthProvider,
	FacebookAuthProvider
} from 'firebase/auth';
import { auth } from '$lib/utils/firebase';
import { goto } from '$app/navigation';

const googleProvider = new GoogleAuthProvider();
export const microsoftProvider = new OAuthProvider('microsoft.com');
export const facebookProvider = new FacebookAuthProvider();

export async function signin(type: string) {
	let provider;
	switch (type) {
		case 'google':
			provider = googleProvider;
			break;
		case 'microsoft':
			provider = microsoftProvider;
			break;
		case 'facebook':
			provider = facebookProvider;
			break;
		default:
			throw new Error('Invalid provider');
	}

	try {
		await signInWithPopup(auth, provider);
		goto('/home');
	} catch (error) {
		console.error(error);
	}
}
