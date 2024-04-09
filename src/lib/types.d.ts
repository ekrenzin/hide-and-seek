import type { Position } from '@capacitor/geolocation';

interface UserCircle {
	position: Position;
	circle: Position.coords;
	center?: {
		lat: number;
		lng: number;
	};
	foundPosition?: Position;
	color: string;
	name: string;
	uid: string;
	role: string;
	status: string;
	icon?: string;
}

interface MarkerOptions {
	coordinate: {
		lat: number;
		lng: number;
	};
	title: string;
}

export { UserCircle, MarkerOptions };
