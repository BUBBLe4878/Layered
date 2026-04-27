<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Head from '$lib/components/Head.svelte';
	import Footer from './Footer.svelte';

	import logo from '$lib/assets/logo-nobg.png';

	let { data } = $props();
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=Clash+Display:wght@400;600;700&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
</svelte:head>

<Head title="Layered" />

<div class="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/40 flex flex-col overflow-hidden">
	<!-- Animated background grid -->
	<div class="fixed inset-0 -z-10 opacity-[0.015]" style="background-image: linear-gradient(90deg, #000 1px, transparent 1px), linear-gradient(#000 1px, transparent 1px); background-size: 40px 40px;"></div>
	
	<!-- Gradient accent -->
	<div class="fixed -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -z-10 pointer-events-none"></div>
	
	<!-- Header -->
	<header class="border-b border-slate-200/40 bg-white/50 backdrop-blur-xl sticky top-0 z-50">
		<div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
			<div class="flex items-center gap-3 group cursor-pointer transition-transform hover:scale-105">
				<div class="relative">
					<img src={logo} alt="Layered" class="h-9 w-9 relative z-10" />
					<div class="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg opacity-0 group-hover:opacity-20 blur transition-opacity"></div>
				</div>
				<span class="font-bold text-slate-900 text-lg tracking-tight">Layered</span>
			</div>
			<nav class="flex items-center gap-6">
				<a href="/dashboard/tutorial" class="text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200 font-medium">
					Help
				</a>
				{#if data.loggedIn}
					<a href="/dashboard" class="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 hover:scale-105">
						Dashboard
					</a>
				{:else}
					<a href="/auth/idv" class="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 hover:scale-105">
						Login
					</a>
				{/if}
			</nav>
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-1 max-w-6xl mx-auto w-full px-6 py-20 md:py-32">
		<!-- Hero Section -->
		<section class="text-center mb-32 relative">
			<div class="inline-block mb-6 animate-fade-in-up" style="animation-delay: 0ms;">
				<span class="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 text-slate-700 text-xs font-semibold tracking-wide">
					✨ Design. Print. Build Your Legacy.
				</span>
			</div>
			
			<h1 class="text-6xl md:text-7xl font-bold text-slate-900 mb-8 leading-tight tracking-tight animate-fade-in-up" style="animation-delay: 100ms; font-family: 'Clash Display', sans-serif;">
				Create CAD projects that <span class="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">come to life</span>
			</h1>
			
			<p class="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style="animation-delay: 200ms;">
				Design with any CAD tool, submit your work, get it printed, and earn rewards. Track your progress, build your reputation, and compete on our leaderboard.
			</p>
			
			<div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style="animation-delay: 300ms;">
				{#if data.loggedIn}
					<a href="/dashboard" class="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-200 hover:scale-105 overflow-hidden">
						<div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
						<span class="relative flex items-center gap-2">
							Go to Dashboard
							<svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						</span>
					</a>
				{:else}
					<a href="/auth/idv" class="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold text-lg hover:shadow-2xl hover:shadow-blue-500/40 transition-all duration-200 hover:scale-105 overflow-hidden">
						<div class="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
						<span class="relative flex items-center gap-2">
							Sign in with Hack Club
							<svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
							</svg>
						</span>
					</a>
				{/if}
				<a href="/dashboard/tutorial" class="group px-8 py-4 rounded-xl border-2 border-slate-300 text-slate-900 font-semibold text-lg hover:bg-slate-50 transition-all duration-200 hover:border-slate-400">
					Learn More
				</a>
			</div>
		</section>

		<!-- Features Grid -->
		<section class="grid md:grid-cols-3 gap-6 mb-32">
			{#each [
				{ icon: '→', title: 'Build Projects', desc: 'Use any CAD tool you want. We handle the rest. Design with freedom, no restrictions.' },
				{ icon: '↑', title: 'Track Progress', desc: 'Streaks, layers, and experience. Watch your stats grow as you complete more projects.' },
				{ icon: '★', title: 'Get Rewards', desc: 'Ship approved projects. Earn stickers, physical rewards, and unlock special perks.' }
			] as feature, i}
				<div class="group relative p-8 rounded-2xl bg-white border border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 hover:border-slate-300/80" style="animation: fade-in-up 0.5s ease-out {400 + i * 100}ms both;">
					<div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50 via-transparent to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
					
					<div class="relative">
						<div class="text-5xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 bg-clip-text text-transparent mb-4 group-hover:scale-110 transition-transform duration-300 origin-left">
							{feature.icon}
						</div>
						<h3 class="text-xl font-semibold text-slate-900 mb-3">{feature.title}</h3>
						<p class="text-slate-600 leading-relaxed">
							{feature.desc}
						</p>
					</div>
				</div>
			{/each}
		</section>

		<!-- How It Works -->
		<section class="mb-32">
			<div class="text-center mb-16">
				<h2 class="text-4xl md:text-5xl font-bold text-slate-900 mb-4" style="font-family: 'Clash Display', sans-serif;">
					How It Works
				</h2>
				<p class="text-slate-600 text-lg">5 simple steps to ship your design</p>
			</div>

			<div class="relative">
				<!-- Connecting line (hidden on mobile) -->
				<div class="hidden md:block absolute top-12 left-0 right-0 h-1 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 -z-10"></div>

				<div class="grid md:grid-cols-5 gap-6">
					{#each [
						{ num: 1, title: 'Design', desc: 'Create a 3D model using any CAD software and upload it.' },
						{ num: 2, title: 'Submit', desc: 'Send it for review. Our team checks quality and specs.' },
						{ num: 3, title: 'Review', desc: 'Get feedback and iterate with community. Peers help you improve.' },
						{ num: 4, title: 'Print', desc: 'Your approved design gets 3D printed and shipped to you.' },
						{ num: 5, title: 'Earn', desc: 'Gain layers, unlock rewards, climb the leaderboard.' }
					] as step, i}
						<div class="relative group" style="animation: fade-in-up 0.5s ease-out {600 + i * 100}ms both;">
							<div class="flex flex-col items-center">
								<div class="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold flex items-center justify-center text-2xl mb-4 group-hover:shadow-lg group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-110 relative z-10">
									{step.num}
								</div>
								<h4 class="font-semibold text-slate-900 mb-2 text-center">{step.title}</h4>
								<p class="text-slate-600 text-sm text-center leading-relaxed">{step.desc}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Stats Section -->
		<section class="mb-32">
			<div class="grid md:grid-cols-3 gap-6">
				{#each [
					{ stat: '24/7', desc: 'Submit projects anytime, anywhere.' },
					{ stat: 'Real Prints', desc: 'Your designs become physical objects.' },
					{ stat: 'Community', desc: 'Compete and collaborate with makers.' }
				] as item, i}
					<div class="group relative p-8 text-center rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-slate-200/60 hover:shadow-xl hover:border-slate-300/80 transition-all duration-300" style="animation: fade-in-up 0.5s ease-out {900 + i * 100}ms both;">
						<div class="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
						<div class="relative">
							<p class="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform duration-300 origin-center">
								{item.stat}
							</p>
							<p class="text-slate-600">{item.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- CTA Section -->
		<section class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-12 md:p-20 text-center shadow-2xl" style="animation: fade-in-up 0.5s ease-out 1200ms both;">
			<div class="absolute inset-0 opacity-10 mix-blend-multiply" style="background-image: url('data:image/svg+xml,%3Csvg width=%2260%27 height=%2760%27 viewBox=%270 0 60 60%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cg fill=%27none%27 fill-rule=%27evenodd%27%3E%3Cg fill=%27%23000%27 fill-opacity=%270.1%27%3E%3Cpath d=%27M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%27/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')"></div>
			
			<div class="relative z-10">
				<h2 class="text-4xl md:text-5xl font-bold text-white mb-4" style="font-family: 'Clash Display', sans-serif;">
					Ready to start creating?
				</h2>
				<p class="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
					Join the maker community. Design, print, and build your reputation one project at a time.
				</p>
				
				{#if data.loggedIn}
					<a href="/dashboard" class="inline-block px-8 py-4 rounded-xl bg-white text-purple-600 font-bold text-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
						Go to Dashboard
					</a>
				{:else}
					<a href="/auth/idv" class="inline-block px-8 py-4 rounded-xl bg-white text-purple-600 font-bold text-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
						Sign in with Hack Club
					</a>
				{/if}
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer class="mt-20 border-t border-slate-200/40 bg-white/30 backdrop-blur-xl">
		<div class="max-w-6xl mx-auto px-6 py-12 text-center text-slate-700">
			<p class="mb-2">Made with ❤ by <a href="https://hackclub.com" class="text-blue-600 hover:text-blue-700 font-semibold transition-colors">Hack Club</a></p>
			<p class="text-sm text-slate-500">Building the future of maker education</p>
		</div>
	</footer>
</div>

<style>
	@keyframes fade-in-up {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	:global(body) {
		font-family: 'Inter', sans-serif;
	}

	:global(h1, h2, h3, h4, h5, h6) {
		font-family: 'Inter', sans-serif;
		font-weight: 600;
	}

	:global(.animate-fade-in-up) {
		animation: fade-in-up 0.6s ease-out forwards;
		opacity: 0;
	}
</style>
