<script lang="ts">
	import { onMount } from 'svelte';
	import Head from '$lib/components/Head.svelte';
	import { Heart } from '@lucide/svelte';
	import relativeDate from 'tiny-relative-date';
	import { enhance } from '$app/forms';

	let { data } = $props();

	type SortType = 'newest' | 'trending' | 'random' | 'liked';

	let devlogs = $state(data.devlogs);
	let hasMore = $state(data.hasMore);
	let nextOffset = $state(data.nextOffset);
	let loadingMore = $state(false);
	let loadError = $state('');
	let sentinel = $state<HTMLDivElement | null>(null);
	let sortBy: SortType = $state('newest');

	const rootMargin = '300px 0px';

	function hydrate(raw) {
		return raw.map((entry) => ({
			...entry,
			devlog: {
				...entry.devlog,
				createdAt: new Date(entry.devlog.createdAt)
			}
		}));
	}

	async function loadMore() {
		if (loadingMore || !hasMore) return;
		loadingMore = true;
		loadError = '';

		try {
			const params = new URLSearchParams({
				offset: String(nextOffset),
				sort: sortBy
			});

			const res = await fetch(`/dashboard/explore?${params}`);
			if (!res.ok) throw new Error();

			const data = await res.json();

			const incoming = hydrate(data.devlogs ?? []);

			devlogs = [...devlogs, ...incoming];
			nextOffset = data.nextOffset ?? nextOffset + incoming.length;
			hasMore = Boolean(data.hasMore);
		} catch {
			loadError = 'Failed to load more.';
		} finally {
			loadingMore = false;
		}
	}

	async function changeSort(newSort: SortType) {
		if (newSort === sortBy) return;

		sortBy = newSort;
		devlogs = [];
		nextOffset = 0;
		hasMore = true;

		const params = new URLSearchParams({
			offset: '0',
			sort: newSort
		});

		const res = await fetch(`/dashboard/explore?${params}`);
		if (!res.ok) return;

		const data = await res.json();

		devlogs = hydrate(data.devlogs ?? []);
		nextOffset = data.nextOffset ?? 0;
		hasMore = Boolean(data.hasMore);
	}

	onMount(() => {
		if (!sentinel) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) loadMore();
			},
			{ rootMargin }
		);

		observer.observe(sentinel);

		return () => observer.disconnect();
	});
</script>

<Head title="Explore" />

<div class="flex flex-col gap-5">

	<!-- HEADER -->
	<div class="flex justify-between items-center">
		<div>
			<h1 class="text-3xl font-medium">Explore</h1>
			<p class="text-sm text-gray-500">See what everyone is building</p>
		</div>

		<select
			bind:value={sortBy}
			onchange={(e) => changeSort(e.currentTarget.value)}
			class="border rounded px-2 py-1 text-sm"
		>
			<option value="newest">Newest</option>
			<option value="trending">Trending</option>
			<option value="random">Random</option>
			<option value="liked">My Liked</option>
		</select>
	</div>

	<!-- EMPTY STATE -->
	{#if devlogs.length === 0}
		<div class="text-center py-10 text-gray-500">
			No devlogs yet
		</div>

	{:else}

		<!-- GRID -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-3">

			{#each devlogs as devlog, index (devlog.devlog.id)}
				<div class="relative group">

					<!-- CARD (ONLY IMAGE IS CLICKABLE) -->
					<a
						href={`/dashboard/projects/${devlog.project.id}#devlog-${devlog.devlog.id}`}
						class="block overflow-hidden rounded border bg-white"
					>
						<img
							src={devlog.devlog.image}
							class="w-full aspect-square object-cover group-hover:scale-105 transition"
						/>
					</a>

					<!-- OVERLAY -->
					<div class="absolute inset-0 pointer-events-none group-hover:bg-black/40 transition"></div>

					<!-- INFO -->
					<div class="absolute bottom-2 left-2 text-white text-xs opacity-0 group-hover:opacity-100 transition">
						<div class="font-semibold">{devlog.project.name}</div>
						<div>{relativeDate(devlog.devlog.createdAt)}</div>
					</div>

					<!-- LIKE BUTTON (SAFE FORM) -->
					<div class="absolute bottom-2 left-2">
						<form
							method="POST"
							action="?/toggleLike"
							use:enhance={({ result }) => {
								if (!result?.data?.success) return;
						
								const liked = result.data.liked;
						
								// update state
								devlogs[index].userLiked = liked;
								devlogs[index].likeCount += liked ? 1 : -1;
						
								// 🔥 force Svelte 5 reactivity refresh
								devlogs = devlogs.slice();
							}}
						>
							<input type="hidden" name="devlogId" value={devlog.devlog.id} />
						
							<button
								type="submit"
								class={`cursor-pointer flex items-center gap-1 px-2 py-1 rounded text-xs transition-all ${
									devlog.userLiked
										? 'bg-red-500 text-white'
										: 'bg-white/80 text-gray-700 hover:bg-white'
								}`}
							>
								<Heart size={14} class={devlog.userLiked ? 'fill-current' : ''} />
								<span>{devlog.likeCount}</span>
							</button>
						</form>
					</div>

					<!-- VIEW COUNT -->
					<div class="absolute top-2 right-2 text-xs bg-white/80 px-2 py-1 rounded">
						👁 {devlog.viewCount}
					</div>

				</div>
			{/each}

		</div>

		<!-- SENTINEL -->
		<div bind:this={sentinel} class="h-10"></div>

		{#if loadingMore}
			<p class="text-center text-sm text-gray-500">Loading...</p>
		{/if}

		{#if loadError}
			<p class="text-center text-red-500 text-sm">{loadError}</p>
		{/if}

	{/if}
</div>
