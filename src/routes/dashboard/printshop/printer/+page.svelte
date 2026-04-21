<script lang="ts">
	import Head from '$lib/components/Head.svelte';
	import Printers from './Printers.svelte';
	import themeSong from '$lib/assets/construct-printer-printshop.mp3';

	let { data } = $props();

	let audio: HTMLAudioElement | null = $state(null);

	$effect(() => {
		if (audio) {
			audio.volume = 0.2;
			audio.play();
		}
	});
</script>

<Head title="Printshop Printers" />

<div class="flex h-full flex-col overflow-hidden">
	<div class="mt-5 mb-2 flex flex-row gap-1">
		<h1 class="grow font-hero text-3xl font-medium">Printshop printers</h1>
		{#if data.user.printerFulfilment === 'none' && data.user.hasBasePrinter}
			<a href="printer/get" class="button md primary">Get printer</a>
		{/if}
	</div>

	<p class="mb-2">
		Experience: <span class="rounded-xl bg-primary-800 px-2"
			>{Math.floor(data.user.shopScore)}</span
		>
		<span class="opacity-50">(allows you to get stuff for cheaper!)</span>
	</p>

	<!-- <h2 class="mb-2 text-2xl font-bold">Printshop items</h2> -->

	<audio loop bind:this={audio}>
		<source src={themeSong} type="audio/mp3" />
	</audio>

	<Printers {data} />
</div>

<!-- <div class="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
		{#each data.printshopItems as item (item.id)}
			<MarketItem {item} userShopScore={data.user.shopScore} userLayers={data.user.layer} />
		{/each}
	</div> -->
