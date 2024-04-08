<script lang="ts">
	import Title from '$lib/components/Title.svelte';
	import { functions, user, authInitiated, auth } from '$lib/utils/firebase';
	import { httpsCallable } from 'firebase/functions';
	import { signOut } from 'firebase/auth';

	let code: HTMLInputElement;
	let joining = false;

	user.subscribe((user) => {
		if (!$authInitiated) return;
		if (!user) {
			window.location.href = '/login';
		}
	});

	async function createGame() {
		console.log('create game');
		const code = await httpsCallable(functions, 'createGame')();
		console.log(code);
	}

	function joinGame() {
		console.log('join game');
		if (!checkCode()) return;
	}

	function checkCode() {
		if (code.value === '') {
			alert('Please enter a lobby code');
			return false;
		}
		return true;
	}
</script>

<div class="flex flex-col h-screen justify-between items-center py-4">
	<div class="flex flex-col justify-center items-center">
		<Title />
	</div>

	{#if joining}
		<div class="flex flex-col gap-4 justify-center items-center">
			<label for="name">Enter Lobby Code:</label>
			<input
				bind:this={code}
				type="text"
				id="name"
				name="name"
				class="border-2 border-gray-300 p-2 rounded-md"
			/>
		</div>

		<div class="flex flex-col justify-center items-center space-y-4">
			<button class="big-button bg-green-500 hover:bg-green-600" on:click={joinGame}>
				Join Game
			</button>
			<button class="big-button bg-gray-500 hover:bg-gray-600" on:click={() => (joining = false)}>
				Go Back
			</button>
		</div>
	{:else}
		<div class="flex flex-col justify-center items-center space-y-4">
			<button class="big-button bg-green-500 hover:bg-green-600" on:click={() => (joining = true)}>
				Join Game
			</button>
			<button class="big-button bg-blue-500 hover:bg-blue-600" on:click={createGame}>
				Create Game
			</button>
		</div>
	{/if}
	<button class="small-button bg-blue-500 hover:bg-blue-600" on:click={() => signOut(auth)}>
		Log Out
	</button>
</div>

<style>
	label {
		margin-bottom: 0.25rem;
		font-weight: 200;
		font-size: 1.25rem;
	}

	input {
		width: 100%;
	}
</style>
