<script lang="ts">
	import Head from '$lib/components/Head.svelte';
</script>

<Head title="Tutorials" />

<div class="mb-4">
	<h1 class="mt-5 mb-2 font-hero text-3xl font-medium">CAD Tutorials</h1>
	<p class="text-sm text-gray-700">
		Follow these guides to learn modeling, printing prep, and practical workflows.
	</p>
</div>

<div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
	<div class="themed-box-solid p-4">
		<h2 class="text-lg font-bold">Getting started</h2>
		<ul class="mt-2 list-inside list-disc space-y-1 text-sm">
			<li>
				<a
					href="https://cdn.hackclub.com/019ceec2-a0c1-765b-809a-1b690a8d20bf/image.png"
					target="_blank"
					class="list-link">CAD Design Tips for 3D Printing</a
				> - Billie Ruben
			</li>
			<li>
				<a
					href="https://wikifactory.com/+wikifactory/stories/ultimate-guide-how-to-design-for-3d-printing"
					target="_blank"
					class="list-link">How to Design for 3D Printing</a
				> - Wikifactory
			</li>
			<li>
				<a
					href="https://hackaday.com/2025/05/11/learn-15-print-in-place-mechanisms-in-15-minutes/"
					target="_blank"
					class="list-link">15 Print-in-place Mechanisms</a
				> - Slant 3D
			</li>
		</ul>
	</div>

	<div class="themed-box-solid p-4">
		<h2 class="text-lg font-bold">Practice guides</h2>
		<ul class="mt-2 list-inside list-disc space-y-1 text-sm">
			<li>
				<a
					href="https://docs.google.com/presentation/d/1eTMoxJVEN_aZ3dzpWHGpPoI9JpMuOC8nArqn6dbEGfo"
					target="_blank"
					class="list-link">Gear Ratios Presentation</a
				>
			</li>
			<li>
				<a
					href="https://user-cdn.hackclub-assets.com/019ceebd-bf7b-7220-8971-e2e7ea1a3ee2/image.png"
					target="_blank"
					class="list-link">Bed Leveling Guide</a
				> - Billie Ruben
			</li>
		</ul>
	</div>
</div>
