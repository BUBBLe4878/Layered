<script lang="ts">
	import { page } from '$app/state';
</script>

<div class="mt-40 w-full items-center justify-center px-10 text-center md:mt-24 lg:mt-16 flex flex-col gap-1">
	<p>oh no!!!</p>
	<h1 class="font-hero text-2xl">Error {page.status}</h1>
	<p class="text-lg font-medium">{page.error?.message}</p>
	<img src="https://slack-files.com/T09V59WQY1E-F0ATRAQ9PRV-ecd87f9b7d" class="mt-2" alt={`error ${page.status}`} />
	<a href="/" class="underline mt-10">Go back home</a>
</div>
