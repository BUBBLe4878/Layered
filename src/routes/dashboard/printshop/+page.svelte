<script lang="ts">
	import Head from '$lib/components/Head.svelte';
	import { resolve } from '$app/paths';
	import MarketItem from './MarketItem.svelte';
	import MarketTimer from './MarketTimer.svelte';
	import printpheus from '$lib/assets/ovenpheus.png';
	import { LAYERS_PER_HOUR, LAYERS_PER_HOUR_CONVERTED, CLAY_PER_HOUR } from '$lib/defs';

	let { data } = $props();
</script>

<Head title="Printshop" />

<h1 class="mt-5 mb-2 font-hero text-3xl font-medium">Printshop</h1>

{#if data.printshopItems.length === 0}
	<MarketTimer />
{:else}
	<p class="mb-2">
		Experience: <span class="rounded-xl bg-primary-800 px-2"
			>{Math.floor(data.user.shopScore)}</span
		>
		<span class="opacity-50">(allows you to get stuff for cheaper and unlock more items!)</span>
	</p>

	<div class="themed-box mb-5 flex flex-col gap-4 p-3 md:flex-row md:gap-5">
		<div class="w-full md:w-80">
			<img src={printpheus} alt="printpheus" class="rounded-lg border-20 border-white" />
		</div>
		<div class="flex grow flex-col">
			<div class="animate-pulse">
				<h2 class="text-xl font-bold text-primary-400 sm:text-2xl">
					Fire your benchies into layers with Printpheus today!!1!
				</h2>
				<p class="text-base text-primary-200 sm:text-lg">Get your yummy yummy layers here!</p>
			</div>
			<p>
				You'll get {(data.user.hasBasePrinter ? LAYERS_PER_HOUR : LAYERS_PER_HOUR_CONVERTED) /
					CLAY_PER_HOUR} layers per benchie
			</p>
			<div class="grow"></div>
			<a href={resolve('/dashboard/printshop/ovenpheus')} class="button md primary"
				>Go get your layers</a
			>
		</div>
	</div>

	<a href={resolve('/dashboard/printshop/printer')} class="button md primary mb-5">Printshop printers</a>

	<h2 class="mb-2 text-2xl font-bold">Printshop items</h2>

	<div class="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
		{#each data.printshopItems as item (item.id)}
			<MarketItem {item} userShopScore={data.user.shopScore} userLayers={data.user.layer} />
		{/each}
	</div>
	<!-- <div class="themed-box p-3">
		The printshop is currently under maintenance! Please come back later.
	</div> -->
{/if}
