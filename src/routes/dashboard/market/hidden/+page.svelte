<script lang="ts">
	import Head from '$lib/components/Head.svelte';
	import { resolve } from '$app/paths';
	import MarketItem from './MarketItem.svelte';
	import MarketTimer from './MarketTimer.svelte';
	let { data } = $props();
</script>
<Head title="Printshop" />
<h1 class="mt-5 mb-2 font-hero text-3xl font-medium">Printshop</h1>
{#if data.marketItems.length === 0}
	<MarketTimer />
{:else}
	<p class="mb-2">
		Experience: <span class="rounded-xl bg-primary-800 px-2"
			>{Math.floor(data.user.shopScore)}</span
		>
		<span class="opacity-50">(allows you to get stuff for cheaper and unlock more items!)</span>
	</p>
	<a href={resolve('/dashboard/market/printer')} class="button md primary mb-5">Printshop printers</a>
	
	<!-- Hidden button that only shows when user has a printer -->
	{#if data.user.hasBasePrinter}
		<a href={resolve('/dashboard/market/hidden')} class="button md secondary mb-5">
			Hidden Market
		</a>
	{/if}
	
	<h2 class="mb-2 text-2xl font-bold">Printshop items</h2>
	<div class="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
		{#each data.marketItems as item (item.id)}
			<MarketItem {item} userShopScore={data.user.shopScore} userLayers={data.user.brick} />
		{/each}
	</div>
{/if}
