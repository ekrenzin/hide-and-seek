<script lang="ts">
	import { Geolocation } from '@capacitor/geolocation';
	import type { Position } from '@capacitor/geolocation';
	import { db } from '$lib/utils/firebase';
	import { addDoc, collection } from 'firebase/firestore';

	let loc: Position | null = null;
	let error: string | null = null;
	async function getCurrentPosition() {
		error = null;
		try {
			const res = await Geolocation.getCurrentPosition();
			loc = res;
			const docRef = await addDoc(collection(db, 'locations'), {
				latitude: loc?.coords.latitude,
				longitude: loc?.coords.longitude
			});

			console.log('Document written with ID: ', docRef.id);
		} catch (e: any) {
			console.error(e);
			error = e.message;
		}
	}
</script>

<div>
	{#if error}
		<h1>{error}</h1>
	{/if}
	<h1>Hide and Seek</h1>
	{#if loc}
		<p>Your location is:</p>
		<p>Latitude: {loc?.coords.latitude}</p>
		<p>Longitude: {loc?.coords.longitude}</p>
	{/if}
	<button on:click={getCurrentPosition}> Get Current Location </button>
</div>

<style>
	div {
		padding-top: 50px;
	}
</style>
