<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Head from '$lib/components/Head.svelte';
	import Footer from './Footer.svelte';

	import logo from '$lib/assets/logo-nobg.png';

	let { data } = $props();
</script>

<Head title="Layered" />

<div class="min-h-screen bg-gradient-to-b from-primary-50 via-white to-primary-50/30 flex flex-col">
	<!-- Header -->
	<header class="border-b border-primary-200/30 bg-white/40 backdrop-blur-sm sticky top-0 z-50">
		<div class="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
			<div class="flex items-center gap-2">
				<img src={logo} alt="Layered" class="h-8 w-8" />
				<span class="font-bold text-primary-950">Layered</span>
			</div>
			<nav class="flex items-center gap-4">
				<a href="/dashboard/tutorial" class="text-sm text-gray-700 hover:text-primary-900 transition">
					Help
				</a>
				{#if data.loggedIn}
					<a href="/dashboard" class="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition">
						Dashboard
					</a>
				{:else}
					<a href="/auth/idv" class="px-4 py-2 rounded-lg bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 transition">
						Login
					</a>
				{/if}
			</nav>
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-1 max-w-5xl mx-auto w-full px-6 py-16 md:py-24">
		<!-- Hero -->
		<section class="text-center mb-20">
			<h1 class="text-5xl md:text-6xl font-bold text-primary-950 mb-6 leading-tight">
				Design. Print. Compete.
			</h1>
			<p class="text-lg text-gray-700 max-w-2xl mx-auto mb-8 leading-relaxed">
				Layered is where you design CAD projects, get them printed, and build your reputation. 
				Track your progress, unlock rewards, and compete on the leaderboard.
			</p>
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				{#if data.loggedIn}
					<a href="/dashboard" class="px-6 py-3 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition inline-block">
						Go to Dashboard
					</a>
				{:else}
					<a href="/auth/idv" class="px-6 py-3 rounded-lg bg-primary-500 text-white font-medium hover:bg-primary-600 transition inline-block">
						Sign in with Hack Club
					</a>
				{/if}
				<a href="/dashboard/tutorial" class="px-6 py-3 rounded-lg border border-primary-300 text-primary-900 font-medium hover:bg-primary-50 transition inline-block">
					Learn More
				</a>
			</div>
		</section>

		<!-- Features Grid -->
		<section class="grid md:grid-cols-3 gap-6 mb-20">
			<div class="p-6 rounded-xl bg-white border border-primary-200/50 shadow-sm hover:shadow-md transition">
				<div class="text-3xl font-bold text-primary-500 mb-2">→</div>
				<h3 class="text-lg font-semibold text-primary-950 mb-2">Build Projects</h3>
				<p class="text-gray-700 text-sm">
					Use any CAD tool you want. We handle the rest. Design with freedom, no restrictions.
				</p>
			</div>

			<div class="p-6 rounded-xl bg-white border border-primary-200/50 shadow-sm hover:shadow-md transition">
				<div class="text-3xl font-bold text-primary-500 mb-2">↑</div>
				<h3 class="text-lg font-semibold text-primary-950 mb-2">Track Progress</h3>
				<p class="text-gray-700 text-sm">
					Streaks, layers, and experience. Watch your stats grow as you complete more projects.
				</p>
			</div>

			<div class="p-6 rounded-xl bg-white border border-primary-200/50 shadow-sm hover:shadow-md transition">
				<div class="text-3xl font-bold text-primary-500 mb-2">★</div>
				<h3 class="text-lg font-semibold text-primary-950 mb-2">Get Rewards</h3>
				<p class="text-gray-700 text-sm">
					Ship approved projects. Earn stickers, physical rewards, and unlock special perks.
				</p>
			</div>
		</section>

		<!-- How It Works -->
		<section class="bg-white/60 rounded-2xl p-8 md:p-12 border border-primary-200/30 mb-20">
			<h2 class="text-3xl font-bold text-primary-950 mb-8 text-center">How It Works</h2>
			<div class="grid md:grid-cols-3 gap-8">
				<div class="flex flex-col items-center text-center">
					<div class="w-12 h-12 rounded-full bg-primary-100 text-primary-950 font-bold flex items-center justify-center text-lg mb-4">1</div>
					<h4 class="font-semibold text-primary-950 mb-2">Design</h4>
					<p class="text-gray-700 text-sm">Create a 3D model using any CAD software and upload it.</p>
				</div>
				<div class="flex flex-col items-center text-center">
					<div class="w-12 h-12 rounded-full bg-primary-100 text-primary-950 font-bold flex items-center justify-center text-lg mb-4">2</div>
					<h4 class="font-semibold text-primary-950 mb-2">Submit</h4>
					<p class="text-gray-700 text-sm">Send it for review. Our team checks quality and specs.</p>
				</div>
				<div class="flex flex-col items-center text-center">
					<div class="w-12 h-12 rounded-full bg-primary-100 text-primary-950 font-bold flex items-center justify-center text-lg mb-4">3</div>
					<h4 class="font-semibold text-primary-950 mb-2">Print & Earn</h4>
					<p class="text-gray-700 text-sm">If approved, it gets printed. You earn layers and rewards.</p>
				</div>
			</div>
		</section>

		<!-- Stats -->
		<section class="grid md:grid-cols-3 gap-6">
			<div class="p-6 rounded-xl bg-primary-50/50 border border-primary-200/50 text-center">
				<p class="text-4xl font-bold text-primary-600 mb-2">24/7</p>
				<p class="text-gray-700 text-sm">Submit projects anytime, anywhere.</p>
			</div>
			<div class="p-6 rounded-xl bg-primary-50/50 border border-primary-200/50 text-center">
				<p class="text-4xl font-bold text-primary-600 mb-2">Real Prints</p>
				<p class="text-gray-700 text-sm">Your designs become physical objects.</p>
			</div>
			<div class="p-6 rounded-xl bg-primary-50/50 border border-primary-200/50 text-center">
				<p class="text-4xl font-bold text-primary-600 mb-2">Community</p>
				<p class="text-gray-700 text-sm">Compete and collaborate with makers.</p>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer class="mt-20 border-t border-primary-200/30 bg-white/40 backdrop-blur-sm">
		<div class="max-w-5xl mx-auto px-6 py-8 text-center text-sm text-gray-700">
			<p>Made by <a href="https://hackclub.com" class="text-primary-600 hover:text-primary-700 font-medium">Hack Club</a></p>
		</div>
	</footer>
</div>

