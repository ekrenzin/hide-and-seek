// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

export { app, analytics, db };
