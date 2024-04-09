<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import BottomBar from '$lib/components/hideAndSeek/BottomBar.svelte';
	import { startLocationTracking, stopLocationTracking, UserPosition } from '$lib/utils/location';
	import { user } from '$lib/utils/firebase';
	import { loadMap, drawRangeCircles, Map } from '$lib/utils/map';
	import { LobbyUsers } from '$lib/utils/game';
	import type { UserCircle } from '$lib/types';
	import type { Position } from '@capacitor/geolocation';
	import Loading from '$lib/components/Loading.svelte';

	let mapRef: HTMLDivElement;
	let isLoading = true;
	let lobbyUsersSubscription: () => void;

	onMount(async () => {
		isLoading = true;
		await startGame();
	});

	onDestroy(() => {
		unMount();
	});

	async function startGame() {
		const pos = await startLocationTracking();
		if (!pos) {
			console.error('No position');
			//try again in 3 seconds
			setTimeout(startGame, 3000);
			return;
		}
		const map = await loadMap(mapRef, pos);
		if (!map) {
			console.error('No map');
			//try again in 3 seconds
			setTimeout(startGame, 3000);
			return;
		}

		console.log('Map loaded');

		lobbyUsersSubscription = LobbyUsers.subscribe((users) => {
			if (!users) return;
			isLoading = false;
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
	}
</script>

<div class="map" bind:this={mapRef}>
	{#if isLoading}
		<Loading />
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
		z-index: 10;
	}
</style>
