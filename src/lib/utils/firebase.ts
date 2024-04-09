// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';
import { writable } from 'svelte/store';
import { Capacitor } from '@capacitor/core';
import { getApp } from 'firebase/app';
import {
	getAuth,
	indexedDBLocalPersistence,
	initializeAuth,
	onAuthStateChanged
} from 'firebase/auth';

const getFirebaseAuth = () => {
	if (Capacitor.isNativePlatform()) {
		return initializeAuth(getApp(), {
			persistence: indexedDBLocalPersistence
		});
	} else {
		return getAuth();
	}
};

const firebaseConfig = {
	apiKey: 'AIzaSyBGsdXioGTf7_ocemK1qhkOIZA5gvhcvzM',
	authDomain: 'hide-and-seek-1045f.firebaseapp.com',
	projectId: 'hide-and-seek-1045f',
	storageBucket: 'hide-and-seek-1045f.appspot.com',
	messagingSenderId: '281271209734',
	appId: '1:281271209734:web:8e5f4e9e8fc5f42d7fd887',
	measurementId: 'G-NJBMK2W0Y5'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const functions = getFunctions(app);
const auth = getFirebaseAuth();
const isEmulating = window.location.href.includes('localhost');
const user: any = writable(null);
const authInitiated: any = writable(false);

onAuthStateChanged(auth, (_user) => {
	user.set(_user);
	console.log('auth initiated', _user);
	authInitiated.set(true);
});

if (isEmulating) {
	console.log('pointing to emulator');
	// connectFirestoreEmulator(db, 'localhost', 8082);
	// connectFunctionsEmulator(functions, 'localhost', 8081);
	// connectAuthEmulator(auth, 'http://localhost:9099')
}

export { app, analytics, db, functions, auth, getFirebaseAuth, user, authInitiated };
