<script lang="ts">
	import Accordion from '$lib/components/Accordion.svelte';
	import Button from '$lib/components/Button.svelte';
	import Head from '$lib/components/Head.svelte';
	import Footer from './Footer.svelte';

	import logo from '$lib/assets/logo-nobg.png';
	import sticker1Image from '$lib/assets/sticker1.png';
	import sticker2Image from '$lib/assets/sticker2.png';

	let { data } = $props();
</script>

<Head title="" />

<div class="relative overflow-hidden">
	<div class="pointer-events-none absolute -top-40 -right-40 h-96 w-96 rounded-full bg-cyan-300/40 blur-3xl"></div>
	<div class="pointer-events-none absolute top-50 -left-24 h-72 w-72 rounded-full bg-yellow-300/50 blur-3xl"></div>

	<section class="mx-auto w-full max-w-6xl px-6 pt-12 pb-14">
		<div class="mb-8 flex items-center justify-between gap-4">
			<a href="https://hackclub.com" class="flex items-center gap-3 transition-opacity hover:opacity-80">
				<img src="https://assets.hackclub.com/icon-rounded.svg" alt="Hack Club" class="h-8 w-8" />
				<span class="text-sm font-semibold tracking-wide uppercase">Hack Club Presents</span>
			</a>
			<p
				class="rounded-full border border-primary-300 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-wide"
			>
				Layered
			</p>
		</div>

		<div class="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
			<div>
				<p class="mb-3 text-sm font-semibold tracking-[0.2em] text-primary-700 uppercase">
					Design. Print. Earn Layers.
				</p>
				<h1
					class="text-5xl leading-[1.04] font-semibold text-primary-950 sm:text-6xl"
					style="font-family: var(--font-display-alt);"
				>
					Layered Is Your 3D Design Sprint
				</h1>
				<p
					class="mt-5 max-w-xl text-lg leading-relaxed text-gray-800"
					style="font-family: var(--font-body-alt);"
				>
					Build CAD projects, ship real prints, and climb the ecosystem with Layers, streaks, and
					experience-based unlocks.
				</p>

				<div class="mt-8 flex flex-wrap items-center gap-3">
					{#if data.loggedIn}
						<Button text="Open Dashboard" href="/dashboard" />
					{:else}
						<Button text="Login with Hack Club" href="/auth/idv" />
					{/if}
					<a href="/dashboard/tutorial" class="button md orange">Open Help Center</a>
				</div>

				<div class="mt-8 grid max-w-xl grid-cols-3 gap-3">
					<div class="rounded-xl border border-primary-200 bg-white/80 p-3 text-center">
						<p class="text-xs font-semibold uppercase tracking-wide text-gray-600">Base Printer</p>
						<p class="mt-1 text-2xl font-bold text-primary-900">40</p>
						<p class="text-xs text-gray-600">Layers</p>
					</div>
					<div class="rounded-xl border border-primary-200 bg-white/80 p-3 text-center">
						<p class="text-xs font-semibold uppercase tracking-wide text-gray-600">Currency</p>
						<p class="mt-1 text-2xl font-bold text-primary-900">1</p>
						<p class="text-xs text-gray-600">Layers-only</p>
					</div>
					<div class="rounded-xl border border-primary-200 bg-white/80 p-3 text-center">
						<p class="text-xs font-semibold uppercase tracking-wide text-gray-600">Build Mode</p>
						<p class="mt-1 text-2xl font-bold text-primary-900">24/7</p>
						<p class="text-xs text-gray-600">Ship anytime</p>
					</div>
				</div>
			</div>

			<div class="relative rounded-3xl border border-primary-300 bg-white/85 p-6 shadow-2xl">
				<img src={logo} alt="Layered logo" class="mx-auto mb-5 h-34 w-34 object-contain" />
				<h2
					class="text-center text-2xl font-semibold text-primary-900"
					style="font-family: var(--font-display-alt);"
				>
					First Project Reward
				</h2>
				<p class="mt-2 text-center text-sm text-gray-700">
					Ship your first approved project to unlock physical rewards.
				</p>
				<div class="mt-5 grid grid-cols-2 gap-3">
					<div class="rounded-xl border border-primary-200 bg-primary-50 p-3 text-center">
						<img
							src={sticker1Image}
							alt="Layered sticker 1"
							class="mx-auto h-20 w-20 object-contain"
						/>
						<p class="mt-2 text-sm font-semibold">Stickers</p>
					</div>
					<div class="rounded-xl border border-primary-200 bg-primary-50 p-3 text-center">
						<img
							src={sticker2Image}
							alt="Layered sticker 2"
							class="mx-auto h-20 w-20 object-contain"
						/>
						<p class="mt-2 text-sm font-semibold">Layered Keychain</p>
					</div>
				</div>
			</div>
		</div>
	</section>
</div>

<section class="mx-auto w-full max-w-6xl px-6 pb-10">
	<div class="rounded-2xl border border-primary-200 bg-white/80 p-6 sm:p-8">
		<h2 class="text-3xl font-semibold text-primary-950" style="font-family: var(--font-display-alt);">
			What Is New In Layered
		</h2>
		<div class="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
			<div class="rounded-xl border border-primary-200 bg-primary-50 p-4">
				<h3 class="font-bold text-primary-900">Streak System</h3>
				<p class="mt-1 text-sm text-gray-700">Daily work builds streaks. Missing a day resets progress.</p>
			</div>
			<div class="rounded-xl border border-primary-200 bg-primary-50 p-4">
				<h3 class="font-bold text-primary-900">Weekly Awards</h3>
				<p class="mt-1 text-sm text-gray-700">
					Staff picks finalists, community votes, winners earn bonus Layers.
				</p>
			</div>
			<div class="rounded-xl border border-primary-200 bg-primary-50 p-4">
				<h3 class="font-bold text-primary-900">Leaderboard</h3>
				<p class="mt-1 text-sm text-gray-700">Tracks total Layers, experience, and project count.</p>
			</div>
			<div class="rounded-xl border border-primary-200 bg-primary-50 p-4">
				<h3 class="font-bold text-primary-900">Underground Market</h3>
				<p class="mt-1 text-sm text-gray-700">Experience unlocks exclusive upgrades and rotating offers.</p>
			</div>
			<div class="rounded-xl border border-primary-200 bg-primary-50 p-4">
				<h3 class="font-bold text-primary-900">Project Extensions</h3>
				<p class="mt-1 text-sm text-gray-700">Continue shipped builds as v2, v3, and beyond.</p>
			</div>
			<div class="rounded-xl border border-primary-200 bg-primary-50 p-4">
				<h3 class="font-bold text-primary-900">Time Tracking</h3>
				<p class="mt-1 text-sm text-gray-700">Use lapse.hackclub.com for automated logs with images.</p>
			</div>
		</div>
	</div>
</section>

<section class="mx-auto w-full max-w-6xl px-6 pb-14">
	<div class="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
		<div class="rounded-2xl border border-primary-200 bg-white/80 p-6">
			<h2 class="text-3xl font-semibold text-primary-950" style="font-family: var(--font-display-alt);">
				Fast FAQ
			</h2>
			<p class="mt-2 text-sm text-gray-700">Need more detail? Open the full FAQ in Help.</p>
			<div class="mt-4 space-y-2">
				<Accordion text="How do I earn Layers?">
					<p>Approved, logged build time earns Layers. Layers are now the only currency.</p>
				</Accordion>
				<Accordion text="Can I continue an existing project?">
					<p>Yes, use a new version like v2 or v3 for the next iteration.</p>
				</Accordion>
				<Accordion text="How does experience help me?">
					<p>Experience lowers PrintShop prices and unlocks advanced systems.</p>
				</Accordion>
				<Accordion text="What if my project is rejected?">
					<p>You receive a specific reason and reviewer info, then fix and resubmit.</p>
				</Accordion>
			</div>
		</div>

		<div class="rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-100 to-primary-50 p-6">
			<h2 class="text-3xl font-semibold text-primary-950" style="font-family: var(--font-display-alt);">
				Get Started
			</h2>
			<ol class="mt-4 list-inside list-decimal space-y-2 text-sm text-gray-800">
				<li>Create a new project and keep your logs clear.</li>
				<li>Ask in #layered-help before shipping if you want feedback.</li>
				<li>Ship, review, and earn Layers for approved progress.</li>
			</ol>
			<div class="mt-6 flex flex-wrap gap-3">
				<a href="/dashboard/projects/create" class="button md primary">Create A Project</a>
				<a href="/dashboard/tutorial" class="button md orange">Open Help</a>
			</div>
		</div>
	</div>
</section>

<Footer />
