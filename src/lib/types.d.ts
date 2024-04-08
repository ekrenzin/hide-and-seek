import type { Position } from '@capacitor/geolocation';

interface UserCircle {
	position: Position;
	center?: {
		lat: number;
		lng: number;
	};
	name: string;
	uid: string;
}

interface MarkerOptions {
	coordinate: {
		lat: number;
		lng: number;
	};
	title: string;
}

export { UserCircle, MarkerOptions };
