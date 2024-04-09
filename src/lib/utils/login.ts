import { FirebaseAuthentication } from '@capacitor-firebase/authentication';
import {
	signInWithCredential,
	GoogleAuthProvider,
	OAuthProvider,
	FacebookAuthProvider,
	getAuth,
	signOut
} from 'firebase/auth';
import { auth, user } from '$lib/utils/firebase';
import { goto } from '$app/navigation';

const signInWithApple = async () => {
	// 1. Create credentials on the native layer
	const result = await FirebaseAuthentication.signInWithApple({
		skipNativeAuth: true
	});
	// 2. Sign in on the web layer using the id token and nonce
	const provider = new OAuthProvider('apple.com');
	const credential = provider.credential({
		idToken: result.credential?.idToken,
		rawNonce: result.credential?.nonce
	});
	return await signInWithCredential(auth, credential);
};

const signInWithFacebook = async () => {
	// 1. Create credentials on the native layer
	const result = await FirebaseAuthentication.signInWithFacebook();
	// 2. Sign in on the web layer using the access token
	const credential = FacebookAuthProvider.credential(result.credential?.accessToken);
	return await signInWithCredential(auth, credential);
};

const signInWithGoogle = async () => {
	try {
		console.log('Signing in with Google');
		// 1. Create credentials on the native layer
		const result = await FirebaseAuthentication.signInWithGoogle();
		console.log(result);
		// 2. Sign in on the web layer using the id token
		const credential = GoogleAuthProvider.credential(result.credential?.idToken);
		const res = await signInWithCredential(auth, credential);
		console.log(res);
		return res;
	} catch (error) {
		console.error(error);
	}
};

const googleProvider = new GoogleAuthProvider();
export const microsoftProvider = new OAuthProvider('microsoft.com');
export const facebookProvider = new FacebookAuthProvider();

export async function signin(type: string) {
	let usr;
	switch (type) {
		case 'google':
			usr = await signInWithGoogle();
			break;
		// case 'microsoft':
		// 	break;
		case 'facebook':
			usr = signInWithFacebook();
			break;
		case 'apple':
			usr = signInWithApple();
			break;
		default:
			throw new Error('Invalid provider');
	}

	if (!usr) throw new Error('No user found');
	user.set(usr);

	try {
		goto('/home');
	} catch (error) {
		console.error(error);
	}
}

export async function logOut() {
	console.log('Logging out');
	await FirebaseAuthentication.signOut();
	const _auth = getAuth();
	await signOut(_auth);
	goto('/login');
}
