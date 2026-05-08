<script lang="ts">
	import '../app.css';
	import TutorialOverlay from '$lib/components/TutorialOverlay.svelte';
	import { openTutorial, initializeTutorial } from '$lib/stores/tutorial';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		// Initialize tutorial on first app load
		// Auto-opens for first-time users only
		initializeTutorial();

		// Make openTutorial accessible globally for Help buttons and other components
		(window as any).layeredOpenTutorial = openTutorial;
	});
</script>

<TutorialOverlay />
{@render children?.()}
