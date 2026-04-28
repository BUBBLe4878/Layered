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

<Head title="Explore" />

<div class="flex flex-col gap-5">

	<!-- HEADER -->
	<div class="flex justify-between items-center">
		<h1 class="text-3xl font-medium">Explore</h1>

		<div class="relative w-44">

			<div class="flex gap-2">
				<button on:click={() => changeSort('newest')}>Newest</button>
				<button on:click={() => changeSort('trending')}>Trending</button>
				<button on:click={() => changeSort('random')}>Random</button>
				<button on:click={() => changeSort('liked')}>Liked</button>
			</div>


			<!--
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
			-->
			<div class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-600">
				<ChevronDown size={16} />
			</div>
		</div>
	</div>

	<!-- GRID -->
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

		{#each devlogs as devlog (devlog.devlog.id)}
			{@const updatedAt = parseDate(devlog.devlog.createdAt)}
			<div
				class="themed-box-solid group relative overflow-hidden border border-primary-200 bg-white/80 p-0"
				onmouseenter={() => {
					if (!performanceModeEnabled) {
						hoveredDevlogId = devlog.devlog.id;
					}
				}}
				onmouseleave={() => {
					if (hoveredDevlogId === devlog.devlog.id) {
						hoveredDevlogId = null;
					}
				}}
			>
				<!-- IMAGE LINK -->
				<div class="relative aspect-square w-full overflow-hidden">
					<a
						href={`/dashboard/projects/${devlog.project.id}#devlog-${devlog.devlog.id}`}
						class="block h-full"
					>
						<img
							src={devlog.devlog.image}
							class={`h-full w-full object-cover transition-opacity duration-200 ${getHoverModelState(devlog.devlog.id, devlog.devlog.model) ? 'opacity-0' : 'opacity-100'}`}
						/>
						{#if getHoverModelState(devlog.devlog.id, devlog.devlog.model)}
							<div class="pointer-events-none absolute inset-0 bg-white/80">
								<Spinny3DPreview
									identifier={`explore-hover-${devlog.devlog.id}`}
									modelUrl={devlog.devlog.model}
									sizeCutoff={7.5 * 1024 * 1024}
								/>
							</div>
						{/if}
					</a>

					<!-- LIKE BUTTON -->
					<div class="absolute bottom-2 left-2 z-10">
						<form
							method="POST"
							action="?/toggleLike"
							use:enhance={() => {
								return async ({ result }) => {
									if (result?.data?.success) {
										location.reload();
									}
								};
							}}
						>
							<input type="hidden" name="devlogId" value={devlog.devlog.id} />

							<button
								type="submit"
								class={`cursor-pointer flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold transition-all ${
									devlog.userLiked
										? 'bg-red-500 text-white'
										: 'bg-white/80 text-gray-700 hover:bg-white'
								}`}
							>
								<Heart
									size={14}
									class={`transition-all ${devlog.userLiked ? 'fill-current' : ''}`}
								/>
								<span>{devlog.likeCount}</span>
							</button>
						</form>
					</div>
					</div>

				<a
					href={`/dashboard/projects/${devlog.project.id}#devlog-${devlog.devlog.id}`}
					class="block"
				>
					<div class="flex flex-col gap-1.5 p-3">
						<p class="truncate text-base font-semibold text-primary-900">{devlog.project.name}</p>
						<p class="text-xs leading-relaxed text-gray-700">
							{devlog.devlog.description || 'No update notes yet.'}
						</p>
						<div class="flex items-center gap-3 text-[11px] text-gray-600">
							<span>
								<Clock3 size={12} class="mr-1 inline" />
								{dateFormatter.format(updatedAt)} at {timeFormatter.format(updatedAt)}
							</span>
						</div>
					</div>
				</a>

				<!-- VIEW COUNT -->
				<!--
				<div class="absolute top-2 right-2 text-xs bg-white/80 px-2 py-1 rounded">
					👁 {devlog.viewCount}
				</div>
				-->

			</div>
		{/each}

	</div>

	<!-- SENTINEL -->
	<div bind:this={sentinel} class="h-10"></div>

</div>
