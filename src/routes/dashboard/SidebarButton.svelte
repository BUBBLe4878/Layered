<script lang="ts">
	import { page } from '$app/state';

	let { href, children, exact = false, icon = null, admin = false, pei = null } = $props();

	let isExactMatch = $derived.by(
		() => page.url.pathname === href || page.url.pathname === href + '/'
	);
	let isCurrentPage = $derived.by(() =>
		exact ? isExactMatch : page.url.pathname.startsWith(href)
	);
</script>

<a
	href={isExactMatch ? null : href}
	class={`pei-button flex h-12 items-center rounded-lg justify-center gap-1.5 shadow-xl/3 transition-colors hover:outline-primary-100 2xl:h-13 ${pei ? `pei${pei}` : ''} ${
		admin
			? (isCurrentPage ? 'bg-primary-700 border-2 border-black' : 'bg-primary-800') + ' hover:bg-primary-700 border-2 border-dotted border-white'
			: (isCurrentPage ? 'bg-primary-700 border-2 border-black' : 'bg-primary-800') + ' hover:bg-primary-700'
	} ${isExactMatch ? '' : 'hover:outline-2'}`}
>
	{#if icon}
		{@const Icon = icon}
		<div>
			<Icon />
		</div>
	{/if}
	<div>
		{@render children?.()}
	</div>
</a>
