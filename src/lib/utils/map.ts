import { GoogleMap } from '@capacitor/google-maps';
import { generateMapStyles } from '$lib/utils/mapStyles';
import { writable, get } from 'svelte/store';
import skull from '$lib/assets/skull.png';
import type { UserCircle } from '$lib/types';
import type { Marker, Circle } from '@capacitor/google-maps';
import type { Position } from '@capacitor/geolocation';

const apiKey = 'AIzaSyAS-peBvelhZvcx8rfvOMq6BK7LlSioF_8';

const Map = writable<GoogleMap | null>(null);
const Markers = writable<any[]>([]);
const Circles = writable<any[]>([]);

async function loadMap(mapRef: HTMLDivElement, pos: Position) {
	const existingMap = get(Map);
	if (existingMap) return existingMap;

	if (!mapRef) return;
	const styles = generateMapStyles();
	try {
		const map = await GoogleMap.create({
			id: 'game-map',
			element: mapRef,
			apiKey: apiKey,
			config: {
				styles,
				disableDefaultUI: true,
				zoomControl: true,
				center: {
					lat: pos.coords.latitude,
					lng: pos.coords.longitude
				},
				zoom: 20
			}
		});
		Map.set(map);
		return map;
	} catch (error) {
		console.error('Error creating map', error);
	}
}

async function drawRangeCircles(map: GoogleMap, circles: UserCircle[]) {
	//remove all existing markers and circles
	const existingCircles = get(Circles);
	const existingMarkers = get(Markers);

	for (const circle of existingCircles) {
		try {
			map.removeCircles(circle.id);
			//remove from store
			Circles.update((circles) => circles.filter((c) => c.id !== circle.id));
		} catch (error) {
			console.error('Error removing circle', error);
		}
	}
	for (const marker of existingMarkers) {
		try {
			map.removeMarker(marker.id);
			//remove from store
			Markers.update((markers) => markers.filter((m) => m.id !== marker.id));
		} catch (error) {
			console.error('Error removing marker', error);
		}
	}
	await createNewCircles(map, circles);
}

async function createNewCircles(map: GoogleMap, circles: UserCircle[]) {
	if (circles.length === 0) return;

	const markerIds: any[] = [];
	const circleIds: any[] = [];

	for (const circle of circles) {
		// testingCircle(circle, map);
		if (circle.status === 'found') {
			//add skull marker
			const deadCircle = circle;
			if (!deadCircle.foundPosition) return;

			deadCircle.circle = circle.foundPosition;
			deadCircle.color = '#000000';

			const newCircle = createCircle(deadCircle);
			const skullMarker = await createLabel(newCircle, skull);
			console.log('skullMarker', skullMarker);
			const skullMarkerId = await map.addMarker(skullMarker);
			markerIds.push({
				id: skullMarkerId,
				uid: deadCircle.uid,
				position: deadCircle.position,
				color: newCircle.fillColor
			});
		} else {
			const circleData = createCircle(circle);
			const markerData = await createLabel(circleData, circle.icon);
			const markerId = await map.addMarker(markerData);
			const circleId = await map.addCircles([circleData]);
			markerIds.push({
				id: markerId,
				uid: circle.uid,
				position: circle.position,
				color: circleData.fillColor
			});
			circleIds.push({
				id: circleId,
				uid: circle.uid,
				position: circle.position,
				color: circleData.fillColor
			});
		}
	}
	// Add the new markers and circles to the store
	Markers.update((markers) => [...markers, ...markerIds]);
	Circles.update((circles) => [...circles, ...circleIds]);
}

async function testingCircle(circle: UserCircle, map: GoogleMap) {
	//add true center for testing
	const trueCenter = {
		lat: circle.position.coords.latitude,
		lng: circle.position.coords.longitude
	};
	const trueCircleId = await map.addCircles([
		{
			center: trueCenter,
			radius: 10,
			fillColor: '#FF0000',
			strokeColor: '#FF000040',
			visible: true
		}
	]);
}

function createCircle(circle: UserCircle): Circle {
	console.log('createCircle', circle);
	return {
		center: {
			lat: circle.circle.latitude || circle.circle.lat,
			lng: circle.circle.longitude || circle.circle.lng
		},
		fillOpacity: 0.5,
		title: circle.name,
		radius: 50,
		fillColor: `${circle.color}`,
		strokeColor: `${circle.color}`,
		visible: true
	};
}

async function createLabel(circle: Circle, iconUrl?: string): Marker {
	console.log('createLabel', circle, iconUrl);
	return {
		iconUrl: iconUrl,
		coordinate: circle.center,
		iconOrigin: { x: 0, y: 0 },
		iconAnchor: { x: 35, y: 35 }
	};
}

export { Map, loadMap, drawRangeCircles };
