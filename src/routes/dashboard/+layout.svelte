<script lang="ts">
	import Header from './Header.svelte';
	import { ProgressBar } from "@prgm/sveltekit-progress-bar";
	let { children, data } = $props();
</script>

<ProgressBar class="text-primary-500" />
<Header user={data.user} />
<div class="flex flex-col h-[calc(100svh-60px)]">
	<div class="grow overflow-auto px-5 pt-5">
		{@render children?.()}
	</div>
</div>
