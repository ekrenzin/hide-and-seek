import { Geolocation } from '@capacitor/geolocation';
import type { Position } from '@capacitor/geolocation';
import { db } from '$lib/utils/firebase';
import { addDoc, collection } from 'firebase/firestore';
import { writable, get } from 'svelte/store';

const UserPosition = writable<Position | null>(null);
const UserPositionWatchId = writable<string | null>(null);

async function startLocationTracking() {
	try {
		const existingWatchId = get(UserPositionWatchId);
		if (existingWatchId) throw new Error('Location tracking already started');

		const location = await getCurrentPosition();
		if (!location) throw new Error('No location found');
		UserPosition.set(location);

		const watchId = await Geolocation.watchPosition({}, async (location, err) => {
			console.log('watchPosition', location);
			if (err) {
				console.error(err);
				return;
			}

			UserPosition.set(location);
		});

		UserPositionWatchId.set(watchId);
	} catch (e: any) {
		console.warn(e);
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
		return location;
	} catch (e: any) {
		console.error(e);
	}
}

async function uploadeLocation(position: Position) {
	try {
		const docRef = await addDoc(collection(db, 'locations'), {
			latitude: position.coords.latitude,
			longitude: position.coords.longitude
		});
		return docRef.id;
	} catch (e: any) {
		console.error(e);
	}
}

export {
	UserPosition,
	startLocationTracking,
	stopLocationTracking,
	getCurrentPosition,
	uploadeLocation
};
