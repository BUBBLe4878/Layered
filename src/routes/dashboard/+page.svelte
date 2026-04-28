<script lang="ts">
	import Head from '$lib/components/Head.svelte';
	import ChecklistItem from '$lib/components/ChecklistItem.svelte';
	import { BarChart3, BookOpen, Compass, PencilRuler, Store, Moon, Sun } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import BenchyRevealer from './BenchyRevealer.svelte';
	
	let performanceModeEnabled = $state(false);
	let performanceModeReady = $state(false);
	let darkModeEnabled = $state(false);
	let darkModeReady = $state(false);

	// ✅ Use $page.data instead of props
	let projectCount = $derived($page.data?.stats?.projectCount ?? 0);
	let devlogCount = $derived($page.data?.stats?.devlogCount ?? 0);
	let shipCount = $derived($page.data?.stats?.shipCount ?? 0);

	console.log('[Dashboard] page.data:', $page.data);
	console.log('[Dashboard] stats:', $page.data?.stats);

	function persistPerformanceMode() {
		window.localStorage.setItem('enableModelRendering', (!performanceModeEnabled).toString());
		window.dispatchEvent(
			new CustomEvent('enableModelRenderingChanged', {
				detail: { performanceModeEnabled }
			})
		);
	}

	function persistDarkMode() {
		window.localStorage.setItem('darkModeEnabled', darkModeEnabled.toString());
		if (darkModeEnabled) {
			document.body.classList.add('dark-mode');
			document.body.classList.remove('theme-1', 'theme-3', 'theme-4');
			document.body.classList.add('theme-2');
		} else {
			document.body.classList.remove('dark-mode');
			document.body.classList.remove('theme-1', 'theme-2', 'theme-3', 'theme-4');
		}
		window.dispatchEvent(
			new CustomEvent('darkModeChanged', {
				detail: { darkModeEnabled }
			})
		);
	}

	onMount(() => {
		performanceModeEnabled = window.localStorage.getItem('enableModelRendering') === 'false';
		performanceModeReady = true;
		persistPerformanceMode();

		darkModeEnabled = window.localStorage.getItem('darkModeEnabled') === 'true';
		darkModeReady = true;
		persistDarkMode();
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
		<div class="themed-box-solid p-4 shadow-xl">
			<p class="text-xs font-semibold tracking-wide text-gray-600 uppercase">Projects</p>
			<p class="mt-1 text-3xl font-bold text-primary-900">{projectCount}</p>
		</div>
		<div class="themed-box-solid p-4 shadow-xl">
			<p class="text-xs font-semibold tracking-wide text-gray-600 uppercase">Journal Entries</p>
			<p class="mt-1 text-3xl font-bold text-primary-900">{devlogCount}</p>
		</div>
		<div class="themed-box-solid p-4 shadow-xl">
			<p class="text-xs font-semibold tracking-wide text-gray-600 uppercase">Shipped</p>
			<p class="mt-1 text-3xl font-bold text-primary-900">{shipCount}</p>
		</div>
		<div class="themed-box-solid p-4 shadow-xl sm:col-span-2 lg:col-span-3">
			<p class="text-xs font-semibold tracking-wide text-gray-600 uppercase">Journal streak</p>
			<p class="mt-1 text-3xl font-bold text-primary-900">
				{$page.data?.user?.journalStreak ?? 0} day{($page.data?.user?.journalStreak ?? 0) === 1 ? '' : 's'}
			</p>
			<p class="mt-1 text-sm text-gray-700">Make a journal each day to keep it going. Miss a day and it resets.</p>
		</div>
	</div>
</div>

<div class="grid grid-cols-1 gap-3 lg:grid-cols-3">
	<div
		class="flex flex-col gap-0.5 p-4 outline-primary-500 lg:col-span-2"
		class:animate-outline-ping={shipCount == 0}
		class:outline={shipCount == 0}
		class:themed-box-solid-prominent={shipCount == 0}
		class:themed-box-solid={shipCount > 0}
	>
		<div class="mb-2 flex items-center gap-2">
			<BarChart3 size={20} class="text-primary-800" />
			<h2 class="text-xl font-bold">Progress checklist</h2>
		</div>
		<div class="flex flex-col gap-0.5">
			<ChecklistItem completed={projectCount > 0}
				><a href={resolve('/dashboard/projects/create')} class="underline">Create</a> your first project</ChecklistItem
			>
			<ChecklistItem completed={devlogCount > 0}>Make your first journal entry</ChecklistItem>
			<ChecklistItem completed={shipCount > 0}>Ship your project</ChecklistItem>
		</div>
	</div>

	<div class="themed-box-solid p-4">
		<h2 class="text-lg font-bold">Settings</h2>
		
		<!-- Dark Mode Toggle -->
		<div class="mt-4">
			<p class="text-sm font-medium mb-2">Display Mode</p>
			<label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-gray-100 transition-colors hover:bg-slate-800 dark-mode:border-blue-700 dark-mode:bg-slate-900/80 dark-mode:hover:bg-slate-800">
				<input
					type="checkbox"
					class="peer sr-only"
					bind:checked={darkModeEnabled}
					onchange={() => {
						if (!darkModeReady) return;
						persistDarkMode();
					}}
				/>
				<span
					class="flex h-6 w-6 items-center justify-center rounded-md border-2 border-slate-600 bg-slate-800 text-blue-300 transition-all peer-checked:border-blue-500 peer-checked:bg-blue-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-900"
					aria-hidden="true"
				>
					{#if darkModeEnabled}
						<span class="text-sm font-bold leading-none">✓</span>
					{/if}
				</span>
				<div class="flex items-center gap-2">
					{#if darkModeEnabled}
						<Moon size={16} />
						<span class="text-sm font-medium">Dark mode</span>
					{:else}
						<Sun size={16} />
						<span class="text-sm font-medium">Light mode</span>
					{/if}
				</div>
			</label>
		</div>

		<!-- Performance Mode Toggle -->
		<div class="mt-4">
			<p class="text-sm font-medium mb-2">Performance</p>
			<p class="text-xs text-gray-600 dark-mode:text-slate-400 mb-2">
				When enabled, 3D previews are disabled for better performance.
			</p>
			<label class="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-gray-100 transition-colors hover:bg-slate-800 dark-mode:border-blue-700 dark-mode:bg-slate-900/80 dark-mode:hover:bg-slate-800">
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
					class="flex h-6 w-6 items-center justify-center rounded-md border-2 border-slate-600 bg-slate-800 text-blue-300 transition-all peer-checked:border-blue-500 peer-checked:bg-blue-600 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-900"
					aria-hidden="true"
				>
					{#if performanceModeEnabled}
						<span class="text-sm font-bold leading-none">✓</span>
					{/if}
				</span>
				<span class="text-sm font-medium">Disable 3D previews</span>
			</label>
			<p class="mt-2 text-xs text-gray-600 dark-mode:text-slate-400">
				{performanceModeEnabled ? 'On' : 'Off'}
			</p>
		</div>
	</div>
</div>

<div class="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
	<a
		href={resolve('/dashboard/projects')}
		class="themed-box-solid flex items-center gap-3 p-4 hover:bg-primary-100 dark-mode:hover:bg-slate-700"
	>
		<PencilRuler size={22} class="text-primary-800 dark-mode:text-blue-300" />
		<div>
			<p class="font-semibold">Projects</p>
			<p class="text-xs text-gray-700 dark-mode:text-slate-400">Build and manage your work</p>
		</div>
	</a>
	<a
		href={resolve('/dashboard/explore')}
		class="themed-box-solid flex items-center gap-3 p-4 hover:bg-primary-100 dark-mode:hover:bg-slate-700"
	>
		<Compass size={22} class="text-primary-800 dark-mode:text-blue-300" />
		<div>
			<p class="font-semibold">Explore</p>
			<p class="text-xs text-gray-700 dark-mode:text-slate-400">See what others are making</p>
		</div>
	</a>
	<a
		href={resolve('/dashboard/market')}
		class="themed-box-solid flex items-center gap-3 p-4 hover:bg-primary-100 dark-mode:hover:bg-slate-700"
	>
		<Store size={22} class="text-primary-800 dark-mode:text-blue-300" />
		<div>
			<p class="font-semibold">Printshop</p>
			<p class="text-xs text-gray-700 dark-mode:text-slate-400">Spend layers and unlock upgrades</p>
		</div>
	</a>
	<a
		href={resolve('/dashboard/tutorial')}
		class="themed-box-solid flex items-center gap-3 p-4 hover:bg-primary-100 dark-mode:hover:bg-slate-700"
	>
		<BookOpen size={22} class="text-primary-800 dark-mode:text-blue-300" />
		<div>
			<p class="font-semibold">Help</p>
			<p class="text-xs text-gray-700 dark-mode:text-slate-400">FAQ, tutorials, and support</p>
		</div>
	</a>
</div>
<div class="mt-4">
	<BenchyRevealer />
</div>
