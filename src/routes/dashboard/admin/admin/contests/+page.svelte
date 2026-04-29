<script lang="ts">
	import Head from '$lib/components/Head.svelte';
	import { enhance } from '$app/forms';
	let { data } = $props();
	
	let contests = $derived(data.contests ?? []);
</script>

<Head title="Contests" />

<h1 class="mt-5 mb-3 font-hero text-3xl font-medium">Contests</h1>

<div class="mb-5 flex flex-col gap-5">
	{#if contests.length === 0}
		<p class="text-sm text-primary-300">No contests yet.</p>
	{:else}
		<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
			{#each contests as contest (contest.id)}
				<div class="border rounded p-4">
					<h3>{contest.title}</h3>
					<p>{contest.description}</p>
					<!-- Add more fields as needed -->
				</div>
			{/each}
		</div>
	{/if}
</div>
