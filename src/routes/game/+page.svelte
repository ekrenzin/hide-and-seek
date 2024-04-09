<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import BottomBar from '$lib/components/hideAndSeek/BottomBar.svelte';
	import { startLocationTracking, stopLocationTracking, UserPosition } from '$lib/utils/location';
	import { user } from '$lib/utils/firebase';
	import { loadMap, drawRangeCircles, Map } from '$lib/utils/map';
	import { LobbyUsers } from '$lib/utils/game';
	import { LoadingStatus } from '../../store';
	import type { UserCircle } from '$lib/types';
	import type { Position } from '@capacitor/geolocation';

	let mapRef: HTMLDivElement;
	let isLoading = true;
	let lobbyUsersSubscription: () => void;
	let startTimeout: any;

	onMount(async () => {
		LoadingStatus.set(true);
		try {
			await startGame();
		} catch (e) {
			console.error(e);
		}
	});

	onDestroy(() => {
		unMount();
	});

	async function startGame() {
		try {
			if (startTimeout) clearTimeout(startTimeout);
			const pos = await startLocationTracking();
			if (!pos) {
				console.error('No position');
				//try again in 3 seconds
				startTimeout = setTimeout(startGame, 3000);
				return;
			}
			const map = (await loadMap(mapRef, pos)) || $Map;
			if (!map) {
				console.warn('No map');
				//try again in 3 seconds
				startTimeout = setTimeout(startGame, 3000);
				return;
			}

			console.log('Map loaded');

			lobbyUsersSubscription = LobbyUsers.subscribe((users) => {
				if (!users) return;
				LoadingStatus.set(false);
				//get the position from the users
				const userCircles: UserCircle[] = users.map((user) => {
					const coords = {
						latitude: user.position.latitude,
						longitude: user.position.longitude
					};
					return {
						...user,
						position: { coords }
					};
				});
				drawRangeCircles(map, userCircles);
			});
		} catch (e) {
			console.error(e);
		}
	}

	function unMount() {
		try {
			stopLocationTracking();
		} catch (e) {
			console.error(e);
		}

		try {
			lobbyUsersSubscription();
		} catch (e) {
			console.error(e);
		}

		try {
			clearTimeout(startTimeout);
		} catch (e) {
			console.error(e);
		}
	}
</script>

<capacitor-google-map id="map" class="map" bind:this={mapRef}> </capacitor-google-map>
<BottomBar />

<style>
	.map {
		display: inline-block;
		background-color: #212529;
		justify-content: center;
		align-items: center;
		height: calc(100vh);
		width: 100vw;
	}
</style>
