<script lang="ts">
	import { LobbyUsers } from '$lib/utils/game';
	import Title from '$lib/components/Title.svelte';
	import { httpsCallable } from 'firebase/functions';
	import { functions } from '$lib/utils/firebase';
	import { LobbyCode } from '$lib/utils/game';
	import { LoadingStatus } from '../../store';
	import { goto } from '$app/navigation';
	import Button from '$lib/components/Button.svelte';

	LobbyCode.subscribe((code) => {
		if (!code) {
			goto('/');
		}
	});

	async function leaveGame() {
		LoadingStatus.set(true);
		try {
			await httpsCallable(
				functions,
				'leaveGame'
			)({
				lobbyCode: $LobbyCode
			});
			//nav to /
			goto('/');
		} catch (e) {
			console.error(e);
		}
		LoadingStatus.set(false);
	}

	async function startGame() {
		LoadingStatus.set(true);
		try {
			//start game
			await httpsCallable(
				functions,
				'startGame'
			)({
				lobbyCode: $LobbyCode
			});

			//nav to /game
			goto('/game');
		} catch (e) {
			console.error(e);
		}
		LoadingStatus.set(false);
	}
</script>

<div class="flex-column centered w-full h-full justify-between">
	<Title />
	{#if $LobbyUsers}
		<div class="flex-column gap-4 w-full px-4 my-4">
			{#each $LobbyUsers as user}
				<div class="bg-gray-800 w-full p-2">{user.name}</div>
			{/each}
		</div>
	{/if}
	<div class="flex-column gap-4">
		<Button type="big" text="Start Game" classList="bg-green-500" onClick={startGame} />
		<Button type="big" text="Leave Game" classList="bg-red-500" onClick={leaveGame} />
	</div>
</div>
