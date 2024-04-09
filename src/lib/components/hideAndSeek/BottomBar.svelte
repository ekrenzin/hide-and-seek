<script>
	import { CurrentLobbyUser } from '$lib/utils/game';
	import { httpsCallable } from 'firebase/functions';
	import { functions } from '$lib/utils/firebase';
	import { LobbyCode } from '$lib/utils/game';

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
				<button class="small-button bg-red-500" on:click={foundMe}> Found Me!</button>
			{/if}
			<button class="small-button bg-gray-500" on:click={backToLobby}> Back to Lobby</button>
		</div>
	</div>
{/if}

<style>
	h1 {
		font-size: 2rem;
		font-weight: 900;
	}
	h2 {
		text-transform: uppercase;
	}
	.bar {
		height: 125px;
		position: absolute;
		bottom: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
</style>
