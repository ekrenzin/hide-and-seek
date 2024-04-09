<script lang="ts">
	import { authInitiated, user } from '$lib/utils/firebase';
	import { LoadingStatus } from '$lib/utils/store';
	import Loading from '$lib/components/Loading.svelte';
	import { goto } from '$app/navigation';
	import '../app.css';
	import '../fonts.css';

	authInitiated.subscribe((initiated: boolean) => {
		if (!initiated) return;
		console.log('auth initiated');
		user.subscribe((usr: any) => {
			if (!usr) {
				goto('/login');
			}
		});
	});
</script>

<svelte:head
	><link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link
		href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
		rel="stylesheet"
	/>
</svelte:head>
{#if $LoadingStatus}
	<div class="loading-wrapper">
		<Loading />
	</div>
{/if}
{#if authInitiated}
	<slot />
{:else}
	<Loading />
{/if}

<style>
	.app-wrapper {
		display: flex;
		flex-direction: column;
		justify-content: fle;
		align-items: center;
		height: 100vh;
	}

	.loading-wrapper {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 1000;
	}
</style>
