<script lang="ts">
	import Accordion from '$lib/components/Accordion.svelte';
	import Head from '$lib/components/Head.svelte';
</script>

<Head title="Help" />

<div class="mb-4">
	<h1 class="mt-5 mb-2 font-hero text-3xl font-medium">Help Center</h1>
	<p class="text-sm text-gray-700">
		FAQ, tutorials, and support for getting started, shipping projects, and earning Layers.
	</p>
</div>

<div class="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
	<div class="themed-box-solid p-4">
		<h2 class="text-lg font-bold">FAQ</h2>
		<div class="mt-2 space-y-2">
			<Accordion text="What is Layered?">
				<p>Layered is a YSWS where you design CAD projects and earn Layers, experience, and rewards.</p>
			</Accordion>
			<Accordion text="How do I track my time?">
				<p>
					Use the project journal for manual logs, or lapse.hackclub.com to auto-track time,
					description, and images.
				</p>
			</Accordion>
			<Accordion text="How do prizes work?">
				<p>
					You earn Layers from approved work, and those Layers can be spent on printer rewards and
					shop items.
				</p>
			</Accordion>
			<Accordion text="What is experience?">
				<p>
					Experience lowers PrintShop prices and can unlock special systems like the Underground Market.
				</p>
			</Accordion>
			<Accordion text="Can I continue a finished project?">
				<p>
					Yes. Start a new version like v2 or v3 if the next iteration builds on the same idea.
				</p>
			</Accordion>
			<Accordion text="Are streaks a thing?">
				<p>
					Yes. Daily work can build a streak, and streaks may grant bonuses or multipliers. Missing a day
					resets it.
				</p>
			</Accordion>
			<Accordion text="How do weekly awards work?">
				<p>
					Staff pick top projects, the community votes on finalists, and winners can receive bonus Layers.
				</p>
			</Accordion>
			<Accordion text="Is there a leaderboard?">
				<p>
					Yes. It tracks total Layers, experience, and project count.
				</p>
			</Accordion>
			<Accordion text="What happens if my project is rejected?">
				<p>
					You’ll get a specific reason and the reviewer’s name, and you can fix it and resubmit.
				</p>
			</Accordion>
			<Accordion text="Can I get feedback before submitting?">
				<p>
					Yes. Use #layered-help or ask for pre-submission feedback before you ship.
				</p>
			</Accordion>
			<Accordion text="What project types are encouraged?">
				<p>
					We still focus on fully 3D-printable designs, but simple mechanisms, modular designs, and
					print-assisted tools may be supported in the future.
				</p>
			</Accordion>
			<Accordion text="What is the Underground Market?">
				<p>
					A hidden shop unlocked by experience with exclusive upgrades, rotating items, and special deals.
				</p>
			</Accordion>
			<Accordion text="What can I do after my first project?">
				<p>
					Your first shipped project earns a Layered keychain and stickers.
				</p>
			</Accordion>
			<Accordion text="What happened to benchies?">
				<p>Benchies are retired. Everything is measured in Layers now.</p>
			</Accordion>
		</div>
	</div>

	<div class="themed-box-solid p-4">
		<h2 class="text-lg font-bold">Support</h2>
		<ul class="mt-2 list-inside list-disc space-y-1 text-sm">
			<li>Use #layered-help for idea validation and pre-submission feedback.</li>
			<li>Ask early if you’re unsure whether a project is allowed.</li>
			<li>Beginners are welcome, and you only need to keep active work moving.</li>
		</ul>
	</div>
</div>

<div class="grid grid-cols-1 gap-3 lg:grid-cols-2">
	<div class="themed-box-solid p-4">
		<h2 class="text-lg font-bold">Tutorials</h2>
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

<div class="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
	<div class="themed-box-solid p-4">
		<h2 class="text-lg font-bold">What to make</h2>
		<ul class="mt-2 list-inside list-disc space-y-1 text-sm">
			<li>Functional toys and mechanisms are great.</li>
			<li>Scale models and print-in-place designs are encouraged.</li>
			<li>We are still primarily focused on fully 3D-printable designs.</li>
		</ul>
	</div>

	<div class="themed-box-solid p-4">
		<h2 class="text-lg font-bold">Project tips</h2>
		<ul class="mt-2 list-inside list-disc space-y-1 text-sm">
			<li>Longer projects can earn more experience and cheaper PrintShop items.</li>
			<li>First shipped projects earn a Layered keychain and stickers.</li>
			<li>Daily work can build a streak with possible bonuses.</li>
		</ul>
	</div>
</div>
