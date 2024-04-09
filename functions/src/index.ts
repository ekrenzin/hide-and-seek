import { onCall, CallableRequest } from 'firebase-functions/v2/https';
import { onDocumentUpdated, Change, FirestoreEvent } from 'firebase-functions/v2/firestore';

import * as admin from 'firebase-admin';

// Ensure Firebase Admin SDK is initialized
const app = admin.initializeApp();
const db = app.firestore();

// Function to generate a unique lobby code
function generateLobbyCode(length = 6): string {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
	let result = '';
	const charactersLength = characters.length;
	for (let i = 0; i < length; i++) {
		result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
}

export const createGame = onCall(async (request: CallableRequest) => {
	const { auth, data } = request;
	if (!auth) {
		throw new Error('Authentication required');
	}
	const lobbyCode = generateLobbyCode();
	// Store the lobby code in Firestore
	await db.collection('lobbies').doc(lobbyCode).set({
		createdAt: Date.now()
	});

	//add the user to the lobby
	await db.collection('lobbies').doc(lobbyCode).collection('users').doc(auth.uid).set({
		createdAt: Date.now(),
		color: getRandomVibrantColor(),
		uid: auth.uid,
		name: auth.token.name,
		role: 'hider',
		icon: auth.token.picture
	});

	// Return the lobby code to the caller
	return { lobbyCode };
});

export const joinGame = onCall(async (request: CallableRequest) => {
	const { auth, data } = request;
	if (!auth) {
		throw new Error('Authentication required');
	}
	console.log(auth);
	const { lobbyCode } = data;
	// Check if the lobby exists
	const lobby = await db.collection('lobbies').doc(lobbyCode).get();
	if (!lobby.exists) {
		throw new Error('Lobby not found');
	}

	//add the user to the lobby if they are not already in it
	await db.collection('lobbies').doc(lobbyCode).collection('users').doc(auth.uid).set({
		createdAt: Date.now(),
		color: getRandomVibrantColor(),
		uid: auth.uid,
		name: auth.token.name,
		role: 'hider',
		icon: auth.token.picture
	});
	// Return the lobby code to the caller
	return { lobbyCode };
});

export const leaveGame = onCall(async (request: CallableRequest) => {
	const { auth, data } = request;
	if (!auth) {
		throw new Error('Authentication required');
	}
	const { lobbyCode } = data;
	// Check if the lobby exists
	const lobby = await db.collection('lobbies').doc(lobbyCode).get();
	if (!lobby.exists) {
		throw new Error('Lobby not found');
	}

	//remove the user from the lobby
	await db.collection('lobbies').doc(lobbyCode).collection('users').doc(auth.uid).delete();
	// Return the lobby code to the caller
	return { lobbyCode };
});

export const startGame = onCall(async (request: CallableRequest) => {
	//marks all users as hiders
	const { auth, data } = request;
	if (!auth) {
		throw new Error('Authentication required');
	}
	const { lobbyCode } = data;
	// Check if the lobby exists
	const lobby = await db.collection('lobbies').doc(lobbyCode).get();
	if (!lobby.exists) {
		throw new Error('Lobby not found');
	}

	const lobbyData = lobby.data();
	if (lobbyData.status === 'started') {
		return { lobbyCode };
	}

	//mark the lobby as started
	await db.collection('lobbies').doc(lobbyCode).update({
		status: 'started'
	});

	//mark all users as hiders
	const users = await db.collection('lobbies').doc(lobbyCode).collection('users').get();
	users.forEach(async (doc) => {
		await doc.ref.update({
			role: 'hider',
			status: 'hidden'
		});
	});

	//mark a random user as seeker
	const randomUser = users.docs[Math.floor(Math.random() * users.docs.length)];
	await randomUser.ref.update({
		role: 'seeker',
		status: 'found'
	});

	// Return the lobby code to the caller
	return { lobbyCode };
});

export const markFound = onCall(async (request: CallableRequest) => {
	const { auth, data } = request;
	if (!auth) {
		throw new Error('Authentication required');
	}
	const { lobbyCode } = data;
	const uid = auth.uid;
	// Check if the lobby exists
	const lobby = await db.collection('lobbies').doc(lobbyCode.toUpperCase()).get();
	if (!lobby.exists) {
		throw new Error('Lobby not found');
	}

	//retrieve the user
	const user = await db.collection('lobbies').doc(lobbyCode).collection('users').doc(uid).get();
	if (!user.exists) {
		throw new Error('User not found');
	}

	//mark the user as found
	await db.collection('lobbies').doc(lobbyCode).collection('users').doc(uid).update({
		status: 'found'
	});
	// Return the lobby code to the caller
	return { lobbyCode };
});

export const markHider = onCall(async (request: CallableRequest) => {
	const { auth, data } = request;
	if (!auth) {
		throw new Error('Authentication required');
	}
	const { lobbyCode } = data;
	const uid = auth.uid;
	// Check if the lobby exists
	const lobby = await db.collection('lobbies').doc(lobbyCode).get();
	if (!lobby.exists) {
		throw new Error('Lobby not found');
	}

	//mark the user as hider
	await db.collection('lobbies').doc(lobbyCode).collection('users').doc(uid).update({
		role: 'hider',
		status: 'hidden'
	});
	// Return the lobby code to the caller
	return { lobbyCode };
});

function hslToHex(h: number, s: number, l: number): string {
	l /= 100;
	const a = (s * Math.min(l, 1 - l)) / 100;
	const f = (n: number) => {
		const k = (n + h / 30) % 12;
		const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
		return Math.round(255 * color)
			.toString(16)
			.padStart(2, '0'); // Convert to Hex and format
	};
	return `#${f(0)}${f(8)}${f(4)}`;
}

function getRandomVibrantColor(): string {
	// Generate vibrant color in HSL and convert to Hex
	const h = Math.floor(Math.random() * 360); // Hue between 0 and 359
	const s = 75 + Math.floor(Math.random() * 25); // Saturation between 75% and 100%
	const l = 50 + Math.floor(Math.random() * 10); // Lightness between 50% and 60%
	return hslToHex(h, s, l);
}

//listen for changes in the lobby, if all users are found, end the game
exports.handleUserFound = onDocumentUpdated('lobbies/{lobbyCode}/users/{userId}', async (event) => {
	const lobbyCode = event.params.lobbyCode;
	const userId = event.params.userId;

	const newValues = event.data.after.data();
	//if the newValues status is anything other than found, return
	if (newValues.status !== 'found') {
		//manage their circle
		//if the user has no circle, create one
		//if the user is a seeker, make them a hider
		if (newValues.role === 'seeker') {
			await event.data.after.ref.update({
				role: 'hider'
			});
		}

		if (!newValues.circle) {
			//create a new circle
			const center = createCircleOffset(newValues.position);
			await event.data.after.ref.update({
				circle: center
			});
		} else {
			//calc the distance between the circle and the user
			const distance = calculateDistance(newValues.position, newValues.circle);
			//if the distance is greater than the radius, move the circle
			const isOutside = distance > 50;
			if (isOutside) {
				const center = createCircleOffset(newValues.position);
				await event.data.after.ref.update({
					circle: center
				});
			}
		}
		//hidden, return
		return;
	}

	//if the newValues.role is not seeker, we need to make it seeker, and update found position with currentPosition
	if (newValues.role !== 'seeker') {
		await event.data.after.ref.update({
			role: 'seeker',
			foundPosition: newValues.position
		});
	} else {
		// return if the user is already a seeker
		//if the user is a seeker but has no foundPosition, update it
		if (!newValues.foundPosition) {
			await event.data.after.ref.update({
				foundPosition: newValues.position
			});
		}
		return;
	}

	//get all users in the lobby
	const users = await db.collection('lobbies').doc(lobbyCode).collection('users').get();

	let allFound = true;
	users.forEach((doc) => {
		if (doc.data().status !== 'found') {
			allFound = false;
		}
	});

	if (!allFound) {
		return;
	}

	//mark all users as hiders
	users.forEach(async (doc) => {
		await doc.ref.update({
			role: 'hider',
			status: 'hidden'
		});
	});

	//mark game as "ended"
	await db.collection('lobbies').doc(lobbyCode).update({
		status: 'ended'
	});
});

interface Position {
	latitude: number;
	longitude: number;
}

function createCircleOffset(position: Position) {
	const center = {
		lat: position.latitude + (Math.random() - 0.5) * 0.001 * (Math.random() < 0.5 ? -1 : 1),
		lng: position.longitude + (Math.random() - 0.5) * 0.001 * (Math.random() < 0.5 ? -1 : 1)
	};

	return center;
}

function calculateDistance(position1: Position, position2: Position) {
	const point1 = position1;
	const point2 = position2;
	const R = 6371e3; // Earth's radius in meters

	const lat1 =
		'latitude' in point1 ? (point1.latitude * Math.PI) / 180 : (point1.lat * Math.PI) / 180;
	const lat2 =
		'latitude' in point2 ? (point2.latitude * Math.PI) / 180 : (point2.lat * Math.PI) / 180;
	const lon1 =
		'longitude' in point1 ? (point1.longitude * Math.PI) / 180 : (point1.lng * Math.PI) / 180;
	const lon2 =
		'longitude' in point2 ? (point2.longitude * Math.PI) / 180 : (point2.lng * Math.PI) / 180;

	const deltaLat = lat2 - lat1;
	const deltaLon = lon2 - lon1;

	const a =
		Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	const distance = R * c; // Distance in meters
	return distance;
}
