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

	// ---------------------------
	// INFINITE SCROLL
	// ---------------------------
	onMount(() => {
		if (!sentinel) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) loadMore();
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
		<h1 class="text-3xl font-medium">Explore</h1>

		<select
			bind:value={sortBy}
			onchange={(e) => changeSort(e.currentTarget.value as SortType)}
			class="border px-2 py-1 rounded text-sm"
		>
			<option value="newest">Newest</option>
			<option value="trending">Trending</option>
			<option value="random">Random</option>
			<option value="liked">Liked</option>
		</select>
	</div>

	<!-- GRID -->
	<div class="grid grid-cols-2 md:grid-cols-4 gap-3">

		{#each devlogs as devlog, index (devlog.devlog.id)}
			<div class="relative group">

				<!-- IMAGE LINK -->
				<a
					href={`/dashboard/projects/${devlog.project.id}#devlog-${devlog.devlog.id}`}
					class="block rounded overflow-hidden"
				>
					<img
						src={devlog.devlog.image}
						class="aspect-square w-full object-cover"
					/>
				</a>

				<!-- LIKE BUTTON -->
				<div class="absolute bottom-2 left-2">

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
						class="absolute bottom-2 left-2"
					>
						<input type="hidden" name="devlogId" value={devlog.devlog.id} />
					
						<button
							type="submit"
							class={`cursor-pointer flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all ${
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

				<!-- VIEW COUNT -->
				<div class="absolute top-2 right-2 text-xs bg-white/80 px-2 py-1 rounded">
					👁 {devlog.viewCount}
				</div>

			</div>
		{/each}

	</div>

	<!-- SENTINEL -->
	<div bind:this={sentinel} class="h-10"></div>

</div>
