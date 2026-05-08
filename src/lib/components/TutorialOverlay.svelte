<script lang="ts">
	import { tutorialStore, steps, nextStep, skipTutorial } from '$lib/stores/tutorial';
	import { onMount } from 'svelte';

	let currentStep = 0;
	let highlightRect: DOMRect | null = null;

	$: currentStep = $tutorialStore.currentStep;

	onMount(() => {
		tutorialStore.subscribe(state => {
			if (state.isOpen && steps[state.currentStep]) {
				updateHighlight();
			}
		});

		const handleResize = () => updateHighlight();
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	});

	function updateHighlight() {
		const step = steps[currentStep];
		if (!step.target) {
			highlightRect = null;
			return;
		}

		const element = document.querySelector(step.target);
		if (element) {
			highlightRect = element.getBoundingClientRect();
		}
	}

	function handleNextClick() {
		nextStep();
		setTimeout(updateHighlight, 50);
	}
</script>

{#if $tutorialStore.isOpen}
	<!-- Dark Overlay -->
	<div
		class="fixed inset-0 bg-black/60 z-[999] transition-opacity duration-300"
		on:click={skipTutorial}
		role="button"
		tabindex="0"
		on:keydown={(e) => e.key === 'Escape' && skipTutorial()}
	/>

	<!-- Highlight Ring (Optional) -->
	{#if highlightRect}
		<div
			class="fixed pointer-events-none z-[1000] transition-all duration-300 border-2 border-primary-500 rounded-lg shadow-lg shadow-primary-500/50"
			style="top: {highlightRect.top - 8}px; left: {highlightRect.left - 8}px; width: {highlightRect.width + 16}px; height: {highlightRect.height + 16}px;"
		/>
	{/if}

	<!-- Tutorial Card -->
	<div
		class="fixed z-[1001] bg-gray-900 rounded-xl border border-gray-700 shadow-2xl shadow-black max-w-md transition-all duration-300"
		style="top: {highlightRect ? Math.min(highlightRect.top + highlightRect.height + 20, window.innerHeight - 300) : '50%'}px; left: 50%; transform: translateX(-50%); {!highlightRect ? 'top: 50%; transform: translate(-50%, -50%);' : ''}"
	>
		<!-- Header with Progress -->
		<div class="px-6 py-4 border-b border-gray-700">
			<div class="flex items-center justify-between mb-3">
				<h2 class="text-lg font-bold text-white">{steps[currentStep].title}</h2>
				<button
					on:click={skipTutorial}
					class="text-gray-500 hover:text-white transition-colors"
					aria-label="Close tutorial"
				>
					✕
				</button>
			</div>

			<!-- Progress Bar -->
			<div class="w-full bg-gray-800 rounded-full h-1">
				<div
					class="bg-primary-600 h-1 rounded-full transition-all duration-300"
					style="width: {((currentStep + 1) / steps.length) * 100}%"
				/>
			</div>
		</div>

		<!-- Content -->
		<div class="px-6 py-4">
			<p class="text-gray-300 mb-4">{steps[currentStep].description}</p>
			<p class="text-sm text-primary-400 font-medium">{steps[currentStep].action}</p>
		</div>

		<!-- Footer with Actions -->
		<div class="px-6 py-4 border-t border-gray-700 flex gap-3 justify-between items-center">
			<span class="text-xs text-gray-500">
				Step {currentStep + 1} of {steps.length}
			</span>

			<div class="flex gap-3">
				<button
					on:click={skipTutorial}
					class="px-4 py-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
				>
					Skip
				</button>

				{#if currentStep === steps.length - 1}
					<button
						on:click={() => {
							nextStep();
							setTimeout(() => skipTutorial(), 100);
						}}
						class="button sm primary"
					>
						Done!
					</button>
				{:else}
					<button on:click={handleNextClick} class="button sm primary">
						Next →
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	:global(.tutorial-highlight) {
		position: relative;
		z-index: 1001;
	}
</style>
