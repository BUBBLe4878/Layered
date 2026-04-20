<script lang="ts">
	import Head from '$lib/components/Head.svelte';
	import ChecklistItem from '$lib/components/ChecklistItem.svelte';
	import { BarChart3, BookOpen, Compass, PencilRuler, Store } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';

	let { data } = $props();

	let performanceModeEnabled = $state(false);

	onMount(() => {
		performanceModeEnabled = window.localStorage.getItem('enableModelRendering') === 'false';
	});

	$effect(() => {
		window.localStorage.setItem('enableModelRendering', (!performanceModeEnabled).toString());
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
		<label class="mt-3 flex flex-row items-center gap-2">
			<input type="checkbox" class="checkbox" bind:checked={performanceModeEnabled} />
			<span class="text-sm">Enable performance mode (disable 3D previews)</span>
		</label>
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
			<p class="font-semibold">Shop</p>
			<p class="text-xs text-gray-700">Spend bricks and unlock upgrades</p>
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
