<script lang="ts">
	import Head from '$lib/components/Head.svelte';
	import ChecklistItem from '$lib/components/ChecklistItem.svelte';
	import { BarChart3, BookOpen, Compass, PencilRuler, Store } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	let { data } = $props();

	let performanceModeEnabled = $state(false);
	let performanceModeReady = $state(false);

	function persistPerformanceMode() {
		window.localStorage.setItem('enableModelRendering', (!performanceModeEnabled).toString());
		window.dispatchEvent(
			new CustomEvent('enableModelRenderingChanged', {
				detail: { performanceModeEnabled }
			})
		);
	}

	onMount(() => {
		performanceModeEnabled = window.localStorage.getItem('enableModelRendering') === 'false';
		performanceModeReady = true;
		persistPerformanceMode();
	});
</script>

<Head title="Dashboard" />

<div class="mb-5 flex flex-col gap-4">
	<div class="themed-box-solid-prominent p-4 sm:p-5">
		<h1 class="font-hero text-3xl font-medium">Dashboard</h1>
		<p class="mt-1 text-sm text-gray-700">
			Track your progress and jump back into your next build.
		</p>
	</div>

	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
		<div class="themed-box-solid p-4">
			<p class="text-xs font-semibold tracking-wide text-gray-600 uppercase">Projects</p>
			<p class="mt-1 text-3xl font-bold text-primary-900">{data.projectCount}</p>
		</div>
		<div class="themed-box-solid p-4">
			<p class="text-xs font-semibold tracking-wide text-gray-600 uppercase">Journal Entries</p>
			<p class="mt-1 text-3xl font-bold text-primary-900">{data.devlogCount}</p>
		</div>
		<div class="themed-box-solid p-4">
			<p class="text-xs font-semibold tracking-wide text-gray-600 uppercase">Shipped</p>
			<p class="mt-1 text-3xl font-bold text-primary-900">{data.shipCount}</p>
		</div>
	</div>
</div>

<div class="grid grid-cols-1 gap-3 lg:grid-cols-3">
	<div
		class="flex flex-col gap-0.5 p-4 outline-primary-500 lg:col-span-2"
		class:animate-outline-ping={data.shipCount == 0}
		class:outline={data.shipCount == 0}
		class:themed-box-solid-prominent={data.shipCount == 0}
		class:themed-box-solid={data.shipCount > 0}
	>
		<div class="mb-2 flex items-center gap-2">
			<BarChart3 size={20} class="text-primary-800" />
			<h2 class="text-xl font-bold">Progress checklist</h2>
		</div>
		<div class="flex flex-col gap-0.5">
			<ChecklistItem completed={data.projectCount > 0}
				><a href={resolve('/dashboard/projects/create')} class="underline">Create</a> your first project</ChecklistItem
			>
			<ChecklistItem completed={data.devlogCount > 0}>Make your first journal entry</ChecklistItem>
			<ChecklistItem completed={data.shipCount > 0}>Ship your project</ChecklistItem>
		</div>
	</div>

	<div class="themed-box-solid p-4">
		<h2 class="text-lg font-bold">Performance mode</h2>
		<p class="mt-1 text-sm text-gray-700">
			When enabled, 3D previews are disabled across the site for better performance.
		</p>
		<label class="mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-primary-200 bg-primary-50/70 px-3 py-2 transition-colors hover:bg-primary-100/80">
			<input
				type="checkbox"
				class="peer sr-only"
				bind:checked={performanceModeEnabled}
				onchange={() => {
					if (!performanceModeReady) return;
					persistPerformanceMode();
				}}
			/>
			<span
				class="flex h-6 w-6 items-center justify-center rounded-md border-2 border-primary-300 bg-white text-primary-600 transition-all peer-checked:border-primary-700 peer-checked:bg-primary-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-primary-400 peer-focus-visible:ring-offset-2"
				aria-hidden="true"
			>
				{#if performanceModeEnabled}
					<span class="text-sm font-bold leading-none">✓</span>
				{/if}
			</span>
			<span class="text-sm font-medium">Enable performance mode (disable 3D previews)</span>
		</label>
		<p class="mt-2 text-xs text-gray-600">
			Current status: {performanceModeEnabled ? 'On (3D previews disabled)' : 'Off (3D previews enabled)'}
		</p>
	</div>
</div>

<div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
	<a
		href={resolve('/dashboard/projects')}
		class="themed-box-solid flex items-center gap-3 p-4 hover:bg-primary-100"
	>
		<PencilRuler size={22} class="text-primary-800" />
		<div>
			<p class="font-semibold">Projects</p>
			<p class="text-xs text-gray-700">Build and manage your work</p>
		</div>
	</a>
	<a
		href={resolve('/dashboard/explore')}
		class="themed-box-solid flex items-center gap-3 p-4 hover:bg-primary-100"
	>
		<Compass size={22} class="text-primary-800" />
		<div>
			<p class="font-semibold">Explore</p>
			<p class="text-xs text-gray-700">See what others are making</p>
		</div>
	</a>
	<a
		href={resolve('/dashboard/market')}
		class="themed-box-solid flex items-center gap-3 p-4 hover:bg-primary-100"
	>
		<Store size={22} class="text-primary-800" />
		<div>
			<p class="font-semibold">Printshop</p>
			<p class="text-xs text-gray-700">Spend layers and unlock upgrades</p>
		</div>
	</a>
	<a
		href={resolve('/dashboard/tutorial')}
		class="themed-box-solid flex items-center gap-3 p-4 hover:bg-primary-100"
	>
		<BookOpen size={22} class="text-primary-800" />
		<div>
			<p class="font-semibold">Tutorials</p>
			<p class="text-xs text-gray-700">Guides for learning CAD</p>
		</div>
	</a>
</div>
