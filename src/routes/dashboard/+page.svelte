<script lang="ts">
	import Head from '$lib/components/Head.svelte';
	import ChecklistItem from '$lib/components/ChecklistItem.svelte';
	import { BarChart3, BookOpen, Compass, PencilRuler, Store } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import BenchyRevealer from './BenchyRevealer.svelte';

	let performanceModeEnabled = $state(false);
	let performanceModeReady = $state(false);

	let projectCount = $derived($page.data?.stats?.projectCount ?? 0);
	let devlogCount = $derived($page.data?.stats?.devlogCount ?? 0);
	let shipCount = $derived($page.data?.stats?.shipCount ?? 0);

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
	<div class="themed-box-solid p-4 sm:p-5">
		<h1 class="font-hero text-3xl font-medium text-white">Dashboard</h1>
		<p class="mt-1 text-sm text-gray-400">
			Track your progress and jump back into your next build.
		</p>
	</div>

	<!-- Stats Cards -->
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
		<div class="themed-box-solid p-4">
			<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Projects</p>
			<p class="mt-2 text-4xl font-bold text-primary-500">{projectCount}</p>
		</div>
		<div class="themed-box-solid p-4">
			<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Journal Entries</p>
			<p class="mt-2 text-4xl font-bold text-primary-500">{devlogCount}</p>
		</div>
		<div class="themed-box-solid p-4">
			<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Shipped</p>
			<p class="mt-2 text-4xl font-bold text-primary-500">{shipCount}</p>
		</div>
		<div class="themed-box-solid p-4 sm:col-span-2 lg:col-span-3">
			<p class="text-xs font-semibold tracking-wide text-gray-500 uppercase">Journal Streak</p>
			<p class="mt-2 text-3xl font-bold text-primary-500">
				{$page.data?.user?.journalStreak ?? 0} day{($page.data?.user?.journalStreak ?? 0) === 1 ? '' : 's'}
			</p>
			<p class="mt-2 text-sm text-gray-400">Make a journal each day to keep it going. Miss a day and it resets.</p>
		</div>
	</div>
</div>

<!-- Progress Checklist & Settings -->
<div class="grid grid-cols-1 gap-3 lg:grid-cols-3">
	<div class="lg:col-span-2 themed-box-solid p-4">
		<div class="mb-4 flex items-center gap-2">
			<BarChart3 size={20} class="text-primary-500" />
			<h2 class="text-xl font-bold text-white">Progress Checklist</h2>
		</div>
		<div class="flex flex-col gap-2">
			<ChecklistItem completed={projectCount > 0}
				><a href={resolve('/dashboard/projects/create')} class="underline text-primary-500 hover:text-primary-400">Create</a> your first project</ChecklistItem
			>
			<ChecklistItem completed={devlogCount > 0}>Make your first journal entry</ChecklistItem>
			<ChecklistItem completed={shipCount > 0}>Ship your project</ChecklistItem>
		</div>
	</div>

	<!-- Settings -->
	<div class="themed-box-solid p-4">
		<h2 class="text-lg font-bold text-white mb-4">Settings</h2>

		<div>
			<p class="text-sm font-medium text-gray-300 mb-3">Performance</p>
			<p class="text-xs text-gray-500 mb-3">
				When enabled, 3D previews are disabled for better performance.
			</p>
			<label class="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 transition-colors hover:bg-gray-700">
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
					class="flex h-5 w-5 items-center justify-center rounded border-2 border-gray-600 bg-gray-700 text-primary-400 transition-all peer-checked:border-primary-500 peer-checked:bg-primary-600 peer-checked:text-white"
					aria-hidden="true"
				>
					{#if performanceModeEnabled}
						<span class="text-sm font-bold leading-none">✓</span>
					{/if}
				</span>
				<span class="text-sm font-medium">Disable 3D previews</span>
			</label>
		</div>
	</div>
</div>

<!-- Quick Navigation -->
<div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
	<a
		href={resolve('/dashboard/projects')}
		class="themed-box-solid flex items-center gap-3 p-4 hover:border-gray-500 transition-colors"
	>
		<PencilRuler size={22} class="text-primary-500 flex-shrink-0" />
		<div>
			<p class="font-semibold text-white">Projects</p>
			<p class="text-xs text-gray-400">Build and manage your work</p>
		</div>
	</a>
	<a
		href={resolve('/dashboard/explore')}
		class="themed-box-solid flex items-center gap-3 p-4 hover:border-gray-500 transition-colors"
	>
		<Compass size={22} class="text-primary-500 flex-shrink-0" />
		<div>
			<p class="font-semibold text-white">Explore</p>
			<p class="text-xs text-gray-400">See what others are making</p>
		</div>
	</a>
	<a
		href={resolve('/dashboard/market')}
		class="themed-box-solid flex items-center gap-3 p-4 hover:border-gray-500 transition-colors"
	>
		<Store size={22} class="text-primary-500 flex-shrink-0" />
		<div>
			<p class="font-semibold text-white">Printshop</p>
			<p class="text-xs text-gray-400">Spend layers and unlock upgrades</p>
		</div>
	</a>
	<a
		href={resolve('/dashboard/tutorial')}
		class="themed-box-solid flex items-center gap-3 p-4 hover:border-gray-500 transition-colors"
	>
		<BookOpen size={22} class="text-primary-500 flex-shrink-0" />
		<div>
			<p class="font-semibold text-white">Help</p>
			<p class="text-xs text-gray-400">FAQ, tutorials, and support</p>
		</div>
	</a>
</div>

<!-- Additional Components -->
<div class="mt-4">
	<BenchyRevealer />
</div>
