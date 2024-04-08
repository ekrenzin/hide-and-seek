import { GoogleMap } from '@capacitor/google-maps';
import { generateMapStyles } from '$lib/utils/mapStyles';
import { writable, get } from 'svelte/store';
import type { UserCircle } from '$lib/types';
import type { Marker, Circle } from '@capacitor/google-maps';
import type { Position } from '@capacitor/geolocation';

const apiKey = 'AIzaSyAS-peBvelhZvcx8rfvOMq6BK7LlSioF_8';

async function loadMap(mapRef: HTMLDivElement, pos: Position) {
	console.log('Loading map');
	const existingMap = get(Map);
	if (existingMap) return existingMap;

	if (!mapRef) return;
	const styles = generateMapStyles();
	try {
		console.log('Creating map');
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
				zoom: 16
			}
		});
		Map.set(map);
		return map;
	} catch (error) {
		console.error('Error creating map', error);
	}
}

async function drawRangeCircles(map: GoogleMap, circles: UserCircle[]) {
	const markerIds: any[] = [];
	const circleIds: any[] = [];
	for (const circle of circles) {
		//add random offset to the circle position
		const center = {
			lat:
				circle.position.coords.latitude +
				(Math.random() - 0.5) * 0.001 * (Math.random() < 0.5 ? -1 : 1),
			lng:
				circle.position.coords.longitude +
				(Math.random() - 0.5) * 0.001 * (Math.random() < 0.5 ? -1 : 1)
		};
		circle.center = center;
		const markerId = await map.addMarker(createLabel(circle));
		const circleId = await map.addCircles([createCircle(circle)]);

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

		markerIds.push({ id: markerId, uid: circle.uid });
		circleIds.push({ id: circleId, uid: circle.uid });
	}
	return { circleIds, markerIds };
}

function createCircle(circle: UserCircle): Circle {
	const randomColor = getRandomVibrantColor();
	return {
		center: circle.center,
		radius: 100,
		fillColor: `${randomColor}`,
		strokeColor: `${randomColor}40`,
		visible: true
	};
}

function createLabel(circle: UserCircle): Marker {
	const initials = circle.name
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
		iconUrl: svgIconUrl,
		coordinate: circle.center,
		iconOrigin: { x: 0, y: 0 },
		iconAnchor: { x: 25, y: 25 }
	};
}

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

const Map = writable<GoogleMap | null>(null);
const Markers = writable<Marker[]>([]);
const Circles = writable<Circle[]>([]);

export { Map, loadMap, drawRangeCircles };
