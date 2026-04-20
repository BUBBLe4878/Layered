<script lang="ts">
	import { onMount } from 'svelte';
	import Head from '$lib/components/Head.svelte';
	import { Heart } from '@lucide/svelte';
	import relativeDate from 'tiny-relative-date';

	let { data } = $props();

	type SortType = 'newest' | 'trending' | 'random' | 'liked';

	let devlogs = $state(Array.isArray(data.devlogs) ? [...data.devlogs] : []);
	let hasMore = $state(data.hasMore);
	let nextOffset = $state(data.nextOffset);
	let loadingMore = $state(false);
	let loadError = $state('');
	let sentinel = $state<HTMLDivElement | null>(null);
	let observer: IntersectionObserver | null = null;
	let sortBy: SortType = $state('newest');

	const rootMargin = '320px 0px';

	function hydrateDevlogs(rawDevlogs: typeof data.devlogs) {
		return rawDevlogs.map((entry) => ({
			...entry,
			devlog: {
				...entry.devlog,
				createdAt: new Date(entry.devlog.createdAt)
			}
		}));
	}

	async function loadMoreDevlogs() {
		if (loadingMore || !hasMore) return;
		loadingMore = true;
		loadError = '';
		try {
			const params = new URLSearchParams({
				offset: `${nextOffset}`,
				sort: sortBy
			});
			const response = await fetch(`/dashboard/explore?${params.toString()}`);
			if (!response.ok) {
				throw new Error('Failed to load more devlogs');
			}
			const payload = await response.json();
			const incoming = hydrateDevlogs(payload.devlogs ?? []);
			devlogs = [...devlogs, ...incoming];
			nextOffset = payload.nextOffset ?? nextOffset + incoming.length;
			hasMore = Boolean(payload.hasMore);
		} catch (error) {
			console.error(error);
			loadError = 'Could not load more right now.';
		} finally {
			loadingMore = false;
		}
	}

	async function handleLike(event, index) {
  const form = event.currentTarget;

  const formData = new FormData(form);

  const res = await fetch(form.action, {
    method: 'POST',
    body: formData
  });

  const data = await res.json();

  if (!data.success) return;

  // 🔥 update UI immediately (Svelte does NOT do this for you)
  devlogs[index].userLiked = data.liked;

  if (data.liked) {
    devlogs[index].likeCount += 1;
  } else {
    devlogs[index].likeCount -= 1;
  }
}
	async function changeSortOrder(newSort: SortType) {
		if (newSort === sortBy) return;

		sortBy = newSort;
		devlogs = [];
		nextOffset = 0;
		hasMore = true;

		try {
			const params = new URLSearchParams({ offset: '0', sort: newSort });
			const response = await fetch(`/dashboard/explore?${params.toString()}`);
			if (!response.ok) throw new Error('Failed to load devlogs');

			const payload = await response.json();
			devlogs = hydrateDevlogs(payload.devlogs ?? []);
			nextOffset = payload.nextOffset ?? 0;
			hasMore = Boolean(payload.hasMore);
		} catch (error) {
			console.error(error);
			loadError = 'Could not load devlogs.';
		}
	}

	onMount(() => {
		if (!hasMore || !sentinel) return;
		observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						loadMoreDevlogs();
					}
				});
			},
			{ rootMargin }
		);
		observer.observe(sentinel);
		return () => observer?.disconnect();
	});
</script>

<Head title="Explore" />

<div class="flex flex-col gap-5">
	<!-- Header with sort -->
	<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="mt-5 mb-2 font-hero text-3xl font-medium">Explore</h1>
			<p class="text-sm text-[#72685e]">Check out what everyone's been working on</p>
		</div>

		<!-- Sort dropdown -->
		<div class="flex gap-2">
			<select
				bind:value={sortBy}
				onchange={(e) => changeSortOrder(e.currentTarget.value as SortType)}
				class="themed-input text-sm"
			>
				<option value="newest">Newest</option>
				<option value="trending">Trending</option>
				<option value="random">Random</option>
				<option value="liked">My Liked</option>
			</select>
		</div>
	</div>

	{#if devlogs.length == 0}
		<div class="themed-box flex flex-col items-center justify-center gap-3 py-12">
			<p class="text-lg font-medium">No journal entries yet</p>
			<img
				src="https://cdn.hackclub.com/019d1090-6521-7123-9834-65baa89d29d0/image.png"
				alt="heavysob"
				class="h-8"
			/>
		</div>
	{:else}
		<!-- Grid of cards -->
		<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
			{#each devlogs as devlog, index (devlog.devlog.id)}
				<a
					href={`/dashboard/projects/${devlog.project.id}#devlog-${devlog.devlog.id}`}
					class="group relative rounded-lg overflow-hidden bg-white border-2 border-primary-200 transition-all hover:shadow-lg hover:border-primary-400 hover:scale-105"
				>
					<!-- Image -->
					<div class="aspect-square w-full overflow-hidden bg-gray-100">
						<img
							src={devlog.devlog.image}
							alt={devlog.project.name}
							class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
						/>
					</div>

					<!-- Info overlay on hover -->
					<div class="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex flex-col justify-end p-3 text-shadow-strong">
						<!-- Title & Project (hidden until hover) -->
						<div class="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col gap-1">
							<h3 class="font-semibold text-sm text-white line-clamp-2">
								{devlog.project.name}
							</h3>
							<p class="text-xs text-gray-200">
								by <span class="font-medium">{devlog.user.name}</span>
							</p>
							<p class="text-xs text-gray-300">
								{relativeDate(devlog.devlog.createdAt)}
							</p>
						</div>
					</div>

					<!-- Badges - time and like count -->
					<div class="absolute top-2 right-2 flex flex-col gap-2">
						<!-- Time badge -->
						<div class="bg-primary-600 text-white px-2 py-1 rounded text-xs font-semibold opacity-90 group-hover:opacity-100">
							{Math.floor(devlog.devlog.timeSpent / 60)}h {devlog.devlog.timeSpent % 60}m
						</div>
					</div>

					<!-- Like button - bottom left -->
					<div class="absolute bottom-2 left-2 flex gap-2">
						<form method="POST" action="?/toggleLike" onsubmit|preventDefault={handleLike}>
						  <input type="hidden" name="devlogId" value={devlog.devlog.id} />
						
						  <button type="submit">
						    {devlog.userLiked ? 'Unlike' : 'Like'}
						  </button>
						</form>
							<input type="hidden" name="devlogId" value={devlog.devlog.id} />
							<button
								type="submit"
								class={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all ${
									devlog.devlog.userLiked
										? 'bg-red-500 text-white'
										: 'bg-white/80 text-gray-700 hover:bg-white'
								}`}
							>
								<Heart
									size={14}
									class={`transition-all ${devlog.devlog.userLiked ? 'fill-current' : ''}`}
								/>
								<span>{devlog.devlog.likeCount}</span>
							</button>
						</form>

						<!-- View count -->
						<div class="bg-white/80 text-gray-700 px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
							👁️ {devlog.devlog.viewCount}
						</div>
					</div>
				</a>
			{/each}
		</div>

		<!-- Sentinel for infinite scroll -->
		<div bind:this={sentinel} class="h-1 w-full"></div>

		<!-- Loading/Error states -->
		<div class="flex flex-col items-center gap-3 mt-8">
			{#if loadingMore}
				<p class="text-sm opacity-70">Loading more...</p>
			{/if}

			{#if loadError}
				<div class="flex items-center gap-2 text-sm text-red-500">
					<span>{loadError}</span>
					<button class="button xs primary" type="button" onclick={loadMoreDevlogs}>
						Retry
					</button>
				</div>
			{/if}

			{#if !hasMore && !loadingMore}
				<p class="text-center text-sm opacity-70">You're caught up! 🎉</p>
			{/if}
		</div>
	{/if}
</div>
