<script>
	import Button from '$lib/components/Button.svelte';
	import Title from '$lib/components/Title.svelte';
	import { signin } from '$lib/utils/login';
	import { onMount } from 'svelte';
</script>

<div class="wrapper flex flex-col h-screen justify-between items-center py-4">
	<div class="flex flex-col justify-center items-center">
		<Title />
		<p>To play this game you will need to login with one of the options below.</p>
		<div id="recaptcha-container" class="justify-center flex"></div>
		<div class="flex-column my-4 gap-4 options">
			<Button
				type="big"
				text="Google"
				classList="bg-green-500 hover:bg-green-600"
				onClick={() => signin('google')}
			/>
			<Button
				type="big"
				text="Facebook"
				classList="bg-blue-500 hover:bg-blue-600"
				onClick={() => signin('facebook')}
			/>
		</div>
	</div>
</div>

<style>
	.wrapper {
		padding: 1rem;
	}

	.options {
		margin-top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
</style>
