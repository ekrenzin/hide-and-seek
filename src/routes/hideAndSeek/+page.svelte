<script lang="ts">
	import { GoogleMap } from '@capacitor/google-maps';
	import { onMount } from 'svelte';

	let mapRef = document.getElementById('map');
	onMount(async () => {
		const apiKey = 'YOUR_API_KEY_HERE';
		console.log('mapRef', mapRef);
		try {
			const newMap = await GoogleMap.create({
				id: 'my-map', // Unique identifier for this map instance
				element: mapRef, // reference to the capacitor-google-map element
				apiKey: apiKey, // Your Google Maps API Key
				config: {
					center: {
						// The initial position to be rendered by the map
						lat: 33.6,
						lng: -117.9
					},
					zoom: 8 // The initial zoom level to be rendered by the map
				}
			});
		} catch (error) {
			console.error('Error creating map', error);
		}
	});
</script>

<div bind:this={mapRef} style="width: 100%; height: 100vh;"></div>
