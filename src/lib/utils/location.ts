import { Geolocation } from '@capacitor/geolocation';
import type { Position } from '@capacitor/geolocation';
import { db, user } from '$lib/utils/firebase';
import { doc, collection, setDoc, updateDoc } from 'firebase/firestore';
import { writable, get } from 'svelte/store';
import { LobbyCode } from '$lib/utils/game';

const UserPosition = writable<Position | null>(null);
const UserPositionWatchId = writable<string | null>(null);
const Location = writable<Position | null>(null);

async function startLocationTracking() {
	try {
		const location = await getCurrentPosition();
		if (!location) throw new Error('No location found');
		UserPosition.set(location);

		const existingWatchId = get(UserPositionWatchId);
		if (existingWatchId) {
			throw new Error('Location tracking already started');
		}
		const watchId = await Geolocation.watchPosition({}, async (location, err) => {
			if (err) {
				console.error(err);
				return;
			}
			UserPosition.set(location);
			if (!location) return;
			await uploadLocation(location);
		});

		UserPositionWatchId.set(watchId);
		Location.set(location);

		return location;
	} catch (e: any) {
		console.warn(e);
		return get(Location);
	}
}

async function stopLocationTracking() {
	const watchId = get(UserPositionWatchId);
	if (!watchId) return;

	await Geolocation.clearWatch({ id: watchId });
	UserPositionWatchId.set(null);
}

async function getCurrentPosition() {
	try {
		const location = await Geolocation.getCurrentPosition();
		if (!location) throw new Error('No location found');
		await uploadLocation(location);
		return location;
	} catch (e: any) {
		console.error(e);
	}
}

async function uploadLocation(position: Position) {
	try {
		const usr = get(user);
		if (!usr) throw new Error('User not found');
		const lobbyCode = get(LobbyCode);
		if (!lobbyCode) throw new Error('Lobby code not found');

		const userRef = collection(db, 'lobbies', lobbyCode, 'users');
		const userDocRef = doc(userRef, usr.uid); // Adjusted line

		await updateDoc(userDocRef, {
			// Now correctly references a document
			uid: usr.uid,
			position: {
				latitude: position.coords.latitude,
				longitude: position.coords.longitude
			},
			createdAt: Date.now()
		});
	} catch (e) {
		console.error(e);
	}
}

export {
	UserPosition,
	startLocationTracking,
	stopLocationTracking,
	getCurrentPosition,
	uploadLocation
};
