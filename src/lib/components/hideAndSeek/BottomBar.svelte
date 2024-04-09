<script>
	import { CurrentLobbyUser } from '$lib/utils/game';
	import { httpsCallable } from 'firebase/functions';
	import { functions } from '$lib/utils/firebase';
	import { LobbyCode } from '$lib/utils/game';
	import Button from '../Button.svelte';

	async function foundMe() {
		//confirm so no accidental clicks
		if (!confirm('Are you sure you want to mark yourself as found?')) return;

		const foundMe = await httpsCallable(
			functions,
			'markFound'
		)({
			lobbyCode: $LobbyCode
		});
		console.log(foundMe);
	}

	async function hideMe() {
		//confirm so no accidental clicks
		if (!confirm('Are you sure you want to mark yourself as hidden?')) return;

		const hideMe = await httpsCallable(
			functions,
			'markHider'
		)({
			lobbyCode: $LobbyCode
		});
		console.log(hideMe);
	}

	function backToLobby() {
		window.location.href = '/lobby';
	}
</script>

{#if $CurrentLobbyUser}
	<div class="bar flex-column gap-8">
		<h2>You are a {$CurrentLobbyUser.role}</h2>
		<!-- <h1>1500 points</h1> -->
		<div class="flex-row gap-4">
			{#if $CurrentLobbyUser.role === 'hider'}
				<Button text="Found Me!" type="small" classList="bg-red-500" onClick={foundMe} />
			{:else}
				<Button text="Hide Me!" type="small" classList="bg-red-500" onClick={hideMe} />
			{/if}
			<Button text="Back to Lobby" type="small" classList="bg-gray-500" onClick={backToLobby} />
		</div>
		<!-- aboslute positioned button to refresh the page -->
		<Button
			text="Refresh"
			type="small"
			classList="refresh-button bg-gray-500"
			onClick={() => window.location.reload()}
		/>
	</div>
{/if}

<style>
	.refresh-button {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
	}
	h2 {
		text-transform: uppercase;
	}
	.bar {
		background-color: black;
		padding: 0.5rem;
		width: 100%;
		height: 125px;
		position: absolute;
		bottom: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>
