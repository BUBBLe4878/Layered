<script lang="ts">
	import Sidebar from './Sidebar.svelte'; //acutaully the header...
	import { ProgressBar } from '@prgm/sveltekit-progress-bar';
	let { children, data } = $props();
</script>

<ProgressBar class="text-primary-500" />
<Sidebar user={data.user} />
<div class="flex min-h-[calc(100svh-60px)] flex-col">
	<div class="grow overflow-auto px-3 pt-4 sm:px-5 sm:pt-5">
		{@render children?.()}
	</div>
</div>
