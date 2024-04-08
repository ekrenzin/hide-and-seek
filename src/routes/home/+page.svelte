<script lang="ts">
	import Title from '$lib/components/Title.svelte';

    function createGame() {
        console.log('create game');
    }
</script>

<div class="flex flex-col h-screen justify-between items-center py-4">
	<div class="flex flex-col justify-center items-center">
		<Title />
	</div>

	<div class="flex flex-col justify-center items-center">
		<label for="name">Enter your name:</label>
		<input type="text" id="name" name="name" class="border-2 border-gray-300 p-2 rounded-md" />
	</div>

	<div class="flex flex-col justify-center items-center space-y-4">
		<a href="/join" class="big-button bg-green-500 hover:bg-green-400"> Join Game </a>
		<button class="big-button bg-blue-500 hover:bg-blue-400"> Create Game </button>
	</div>
</div>
