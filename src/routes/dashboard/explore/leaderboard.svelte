<script lang="ts">
	import { onMount } from 'svelte';
	import Head from '$lib/components/Head.svelte';
	import { ChevronDown, Clock3, Heart } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import Spinny3DPreview from '$lib/components/Spinny3DPreview.svelte';

	let { data } = $props();

	type SortType = 'newest' | 'trending' | 'random' | 'liked';

	let devlogs = $state(data.devlogs);
	let hasMore = $state(data.hasMore);
	let nextOffset = $state(data.nextOffset);
	let loadingMore = $state(false);
	let loadError = $state('');
	let sentinel = $state<HTMLDivElement | null>(null);
	let sortBy: SortType = $state('newest');
	let performanceModeEnabled = $state(false);
	let hoveredDevlogId = $state<number | null>(null);

	const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
	const timeFormatter = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' });

	const rootMargin = '300px 0px';

	// ---------------------------
	// LOAD MORE
	// ---------------------------
	async function loadMore() {
		if (loadingMore || !hasMore) return;
		loadingMore = true;

		try {
			const res = await fetch(
				`/dashboard/explore?offset=${nextOffset}&sort=${sortBy}`
			);

			const json = await res.json();

			devlogs = [...devlogs, ...json.devlogs];
			nextOffset = json.nextOffset;
			hasMore = json.hasMore;
		} finally {
			loadingMore = false;
		}
	}

	// ---------------------------
	// SORT CHANGE
	// ---------------------------
	async function changeSort(sort: SortType) {
		sortBy = sort;
	
		devlogs = [];
		nextOffset = 0;
		hasMore = true;
	
		const res = await fetch(`/dashboard/explore?offset=0&sort=${sort}`);
		const json = await res.json();
	
		devlogs = json.devlogs;
		nextOffset = json.nextOffset;
		hasMore = json.hasMore;
	}

	function parseDate(value: Date | string) {
		return value instanceof Date ? value : new Date(value);
	}

	function getHoverModelState(devlogId: number, modelUrl?: string | null) {
		return !performanceModeEnabled && hoveredDevlogId === devlogId && Boolean(modelUrl);
	}

	// ---------------------------
	// INFINITE SCROLL
	// ---------------------------
	onMount(() => {
		performanceModeEnabled = window.localStorage.getItem('enableModelRendering') === 'false';

		const onStorage = (event: StorageEvent) => {
			if (event.key === 'enableModelRendering') {
				performanceModeEnabled = window.localStorage.getItem('enableModelRendering') === 'false';
			}
		};

		window.addEventListener('storage', onStorage);

		const onPerformanceModeChange = () => {
			performanceModeEnabled = window.localStorage.getItem('enableModelRendering') === 'false';
		};

		window.addEventListener('enableModelRenderingChanged', onPerformanceModeChange);

		if (!sentinel) {
			return () => {
				window.removeEventListener('storage', onStorage);
				window.removeEventListener('enableModelRenderingChanged', onPerformanceModeChange);
			};
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) loadMore();
			},
			{ rootMargin }
		);

		observer.observe(sentinel);
		return () => {
			observer.disconnect();
			window.removeEventListener('storage', onStorage);
			window.removeEventListener('enableModelRenderingChanged', onPerformanceModeChange);
		};
	});
</script>
<div class="relative w-44">
		<select
			bind:value={sortBy}
			onchange={(e) => changeSort(e.currentTarget.value as SortType)}
			class="themed-input w-full appearance-none pr-9 text-sm font-medium"
		>
			<option value="newest">Newest</option>
			<option value="trending">Trending</option>
			<option value="random">Random</option>
			<option value="liked">Liked</option>
		</select>
	<div class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-600">
		<ChevronDown size={16} />
	</div>
</div>
