<script lang="ts">
	import { onMount } from 'svelte';
	import Head from '$lib/components/Head.svelte';
	import { ExternalLink } from '@lucide/svelte';
	import relativeDate from 'tiny-relative-date';

	let { data } = $props();

	let devlogs = $state([...data.devlogs]);
	let hasMore = $state(data.hasMore);
	let nextOffset = $state(data.nextOffset);
	let loadingMore = $state(false);
	let loadError = $state('');
	let sentinel = $state<HTMLDivElement | null>(null);
	let observer: IntersectionObserver | null = null;

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
			const params = new URLSearchParams({ offset: `${nextOffset}` });
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
	<div>
		<h1 class="mt-5 mb-2 font-hero text-3xl font-medium">Explore</h1>
		<p class="text-sm text-[#72685e]">Check out what everyone's been working on</p>
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
			{#each devlogs as devlog (devlog.devlog.id)}
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

					<!-- Badge - always visible -->
					<div class="absolute top-2 right-2 bg-primary-600 text-white px-2 py-1 rounded text-xs font-semibold opacity-90 group-hover:opacity-100">
						{Math.floor(devlog.devlog.timeSpent / 60)}h {devlog.devlog.timeSpent % 60}m
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
