<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import BottomBar from '$lib/components/hideAndSeek/BottomBar.svelte';
	import { startLocationTracking, stopLocationTracking, UserPosition } from '$lib/utils/location';
	import { loadMap, drawRangeCircles } from '$lib/utils/map';
	import type { UserCircle } from '$lib/types';
	import type { Position } from '@capacitor/geolocation';

	let mapRef: HTMLDivElement;
	let isLoading = true;
	let trackUser: () => void;
	onMount(async () => {
		isLoading = true;
		await startLocationTracking();
		trackUser = UserPosition.subscribe(async (pos) => {
			console.log('User position', pos);
			isLoading = true;
			if (!pos) return;
			const map = await loadMap(mapRef, pos);
			if (!map) return;
			console.log('Map loaded', map);
			const circles: UserCircle[] = [
				{ position: pos, name: 'Ean Krenzin', uid: '1654512656423566512' },
				{ position: createTestPosition(pos), name: 'Test User', uid: '232323' },
				{ position: createTestPosition(pos), name: 'New Account', uid: '232374723as' }
			];
			drawRangeCircles(map, circles);
			isLoading = false;
		});
		return unMount();
	});

	onDestroy(() => {
		unMount();
	});

	function unMount() {
		trackUser();
		stopLocationTracking();
	}

	function createTestPosition(startPos: Position): Position {
		// Clone the startPos.coords object and modify its properties
		//random sign to add or subtract
		const newCoords = {
			...startPos.coords,
			latitude: startPos.coords.latitude + Math.random() * 0.01 * (Math.random() < 0.5 ? -1 : 1),
			longitude: startPos.coords.longitude + Math.random() * 0.01 * (Math.random() < 0.5 ? -1 : 1)
		};

		// Return a new Position-like object with the updated coordinates
		return {
			...startPos,
			coords: newCoords
		};
	}

	$: console.log({ isLoading });
</script>

<div class="map" bind:this={mapRef}>
	{#if isLoading}
		<div class="absolute inset-0 flex items-center justify-center">
			<!-- Spinner using Tailwind CSS -->
			<div class="w-32 h-32 border-4 border-white border-dotted rounded-full animate-spin"></div>
		</div>
	{/if}
</div>
<BottomBar />

<style>
	.map {
		background-color: #212529;
		display: flex;
		justify-content: center;
		align-items: center;
		height: calc(100vh - 125px);
		width: 100%;
	}
</style>
