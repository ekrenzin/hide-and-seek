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
			const skullMarker = createLabel(newCircle, skull);
			const skullMarkerId = await map.addMarker(skullMarker);
			markerIds.push({
				id: skullMarkerId,
				uid: deadCircle.uid,
				position: deadCircle.position,
				color: newCircle.fillColor
			});
		} else {
			const circleData = createCircle(circle);
			const markerData = createLabel(circleData);
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
		title: circle.name,
		radius: 50,
		fillColor: `${circle.color}`,
		strokeColor: `${circle.color}40`,
		visible: true
	};
}

function createLabel(circle: Circle, iconUrl?: string): Marker {
	const initials = circle.title
		.split(' ')
		.map((namePart) => namePart[0])
		.join('')
		.toUpperCase();
	const svgIcon = `
        <svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
            <text x="50%" y="50%" alignment-baseline="middle" text-anchor="middle" fill="#000" font-size="32" font-weight="900" font-family="Poppins" dy=".3em">${initials}</text>
        </svg>`;

	// Convert SVG string to a URL that can be used as an icon
	const svgIconUrl = `data:image/svg+xml;charset=UTF-8;base64,${btoa(svgIcon)}`;
	return {
		iconUrl: iconUrl || svgIconUrl,
		coordinate: circle.center,
		iconOrigin: { x: 0, y: 0 },
		iconAnchor: { x: 25, y: 25 }
	};
}

export { Map, loadMap, drawRangeCircles };
