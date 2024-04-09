<script lang="ts">
	import { Haptics, ImpactStyle } from '@capacitor/haptics';
	export let classList = '';
	export let type = 'big';
	export let text = '';
	export let onClick = () => {};

	const hapticsImpactMedium = async () => {
		await Haptics.impact({ style: ImpactStyle.Medium });
	};

	const hapticsImpactHeavy = async () => {
		await Haptics.impact({ style: ImpactStyle.Heavy });
	};

	const hapticsImpactLight = async () => {
		await Haptics.impact({ style: ImpactStyle.Light });
	};

	const hapticsVibrate = async () => {
		await Haptics.vibrate();
	};

	const hapticsSelectionStart = async () => {
		await Haptics.selectionStart();
	};

	const hapticsSelectionChanged = async () => {
		await Haptics.selectionChanged();
	};

	const hapticsSelectionEnd = async () => {
		await Haptics.selectionEnd();
	};
</script>

{#if type === 'big'}
	<button
		on:click={onClick}
		class={`big-button ${classList}`}
		on:pointerdown={hapticsImpactHeavy}
		on:pointerup={hapticsImpactMedium}
	>
		{text}
		<slot />
	</button>
{:else}
	<button
		on:click={onClick}
		class={`small-button ${classList}`}
		on:pointerdown={hapticsImpactMedium}
		on:pointerup={hapticsImpactLight}
	>
		{text}
		<slot />
	</button>
{/if}
