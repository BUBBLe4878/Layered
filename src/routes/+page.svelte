<script lang="ts">
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import Head from '$lib/components/Head.svelte';
	import Footer from './Footer.svelte';
	import logo from '$lib/assets/logo-nobg.png';
	import { onMount } from 'svelte';

	let { data } = $props();
	let currentPrinterIndex = $state(0);
	injectSpeedInsights();

	const printers = [
		{
			name: 'Prusa i3 MK3S+',
			image: '🖨️',
			specs: 'Reliable FDM, Perfect for beginners',
			color: 'from-blue-500'
		},
		{
			name: 'Creality Ender 3 V2',
			image: '⚙️',
			specs: 'Affordable powerhouse, Great value',
			color: 'from-purple-500'
		},
		{
			name: 'Formlabs Form 3B',
			image: '💎',
			specs: 'Precision resin, Professional quality',
			color: 'from-cyan-500'
		},
		{
			name: 'Ultimaker S5',
			image: '🚀',
			specs: 'Industrial grade, Dual extrusion',
			color: 'from-pink-500'
		},
		{
			name: 'Anycubic Photon',
			image: '✨',
			specs: 'Resin precision, Budget friendly',
			color: 'from-amber-500'
		}
	];

	onMount(() => {
		const interval = setInterval(() => {
			currentPrinterIndex = (currentPrinterIndex + 1) % printers.length;
		}, 5000);

		return () => clearInterval(interval);
	});

	function nextPrinter() {
		currentPrinterIndex = (currentPrinterIndex + 1) % printers.length;
	}

	function prevPrinter() {
		currentPrinterIndex = (currentPrinterIndex - 1 + printers.length) % printers.length;
	}
</script>

<Head title="Layered" />

<div class="min-h-screen bg-[var(--background-color)] flex flex-col overflow-hidden">
	<!-- Navigation Header -->
	<header class="border-b border-gray-800 bg-gray-900/80 backdrop-blur-md sticky top-0 z-50">
		<div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
			<div class="flex items-center gap-3 group">
				<img src={logo} alt="Layered" class="h-10 w-10 transition-transform group-hover:scale-110 duration-300" />
				<span class="font-bold text-white text-xl tracking-tight">Layered</span>
			</div>
			<nav class="flex items-center gap-8">
				<a href="#features" class="text-sm text-gray-400 hover:text-primary-500 transition-colors">Features</a>
				<a href="#printers" class="text-sm text-gray-400 hover:text-primary-500 transition-colors">Printers</a>
				<a href="/dashboard/tutorial" class="text-sm text-gray-400 hover:text-primary-500 transition-colors">Tutorial</a>
				{#if data.loggedIn}
					<a href="/dashboard" class="button md primary">Dashboard</a>
				{:else}
					<a href="/auth" class="button md primary">Sign In</a>
				{/if}
			</nav>
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-1">
		<!-- Hero Section with Animated Background -->
		<section class="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20">
			<!-- Animated background elements -->
			<div class="absolute inset-0 overflow-hidden">
				<div class="absolute -top-40 -right-40 w-80 h-80 bg-primary-600/20 rounded-full blur-3xl animate-float-1"></div>
				<div class="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl animate-float-2" style="animation-delay: 2s;"></div>
				<div class="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
			</div>

			<!-- Hero Content -->
			<div class="relative z-10 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
				<!-- Text Content -->
				<div class="space-y-8 animate-fade-in">
					<div class="space-y-6">
						<div class="inline-block px-4 py-2 rounded-full bg-primary-600/20 border border-primary-600/50 animate-pulse-slow">
							<span class="text-sm font-semibold text-primary-400">✨ Turn Ideas Into Reality</span>
						</div>

						<h1 class="text-6xl md:text-7xl font-bold text-white leading-tight">
							Design. <br/>
							<span class="bg-gradient-to-r from-primary-500 via-cyan-400 to-purple-500 bg-clip-text text-transparent animate-gradient">
								3D Print.
							</span>
							<br/>
							<span class="text-primary-500">Earn.</span>
						</h1>

						<p class="text-xl text-gray-300 leading-relaxed max-w-2xl">
							Submit your CAD designs to Layered. We 3D print them in our studio, ship them to you, and you earn rewards. Build your maker reputation while creating something physical.
						</p>
					</div>

					<div class="flex flex-col sm:flex-row gap-4 pt-4">
						{#if data.loggedIn}
							<a href="/dashboard" class="button md primary hover:scale-105 transition-transform">
								Go to Dashboard →
							</a>
						{:else}
							<a href="/auth" class="button md primary hover:scale-105 transition-transform">
								Start Designing →
							</a>
						{/if}
						<button
							on:click={() => (window as any).layeredOpenTutorial?.()}
							class="button md secondary hover:scale-105 transition-transform"
						>
							See How It Works
						</button>
					</div>

					<!-- Stats Row -->
					<div class="grid grid-cols-3 gap-6 pt-8 border-t border-gray-800">
						<div class="animate-fade-in" style="animation-delay: 0.2s;">
							<p class="text-3xl font-bold text-primary-500">1000+</p>
							<p class="text-sm text-gray-400 mt-1">Designs Printed</p>
						</div>
						<div class="animate-fade-in" style="animation-delay: 0.4s;">
							<p class="text-3xl font-bold text-primary-500">50+</p>
							<p class="text-sm text-gray-400 mt-1">Active Makers</p>
						</div>
						<div class="animate-fade-in" style="animation-delay: 0.6s;">
							<p class="text-3xl font-bold text-primary-500">24/7</p>
							<p class="text-sm text-gray-400 mt-1">Available</p>
						</div>
					</div>
				</div>

				<!-- 3D Printer Showcase Visual -->
				<div class="relative h-96 md:h-full min-h-96 flex items-center justify-center">
					<div class="absolute inset-0 bg-gradient-to-r from-gray-900/0 to-gray-900/50 z-20"></div>
					<div class="animate-rotate-slow text-9xl opacity-20 absolute">🖨️</div>
					<div class="animate-float-up text-6xl absolute top-12 right-8 animate-bounce" style="animation-delay: 0s;">📐</div>
					<div class="animate-float-up text-6xl absolute bottom-20 left-4 animate-bounce" style="animation-delay: 0.5s;">⚙️</div>
					<div class="animate-float-up text-5xl absolute top-1/2 right-12 animate-bounce" style="animation-delay: 1s;">✨</div>
				</div>
			</div>
		</section>

		<!-- Featured Printers Carousel Section -->
		<section id="printers" class="py-24 relative overflow-hidden">
			<div class="max-w-7xl mx-auto px-6">
				<div class="text-center mb-16 space-y-4">
					<h2 class="text-5xl font-bold text-white">
						Print on <span class="text-primary-500">50+ Printers</span>
					</h2>
					<p class="text-xl text-gray-400 max-w-2xl mx-auto">
						From budget-friendly FDM to professional resin printers—your design, your choice
					</p>
				</div>

				<!-- Carousel Container -->
				<div class="relative">
					<!-- Main Carousel -->
					<div class="overflow-hidden rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-800 to-gray-900">
						<div class="relative h-96 flex items-center justify-center p-8">
							<!-- Carousel Items -->
							{#each printers as printer, idx (idx)}
								<div
									class="absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-out"
									style="opacity: {idx === currentPrinterIndex ? 1 : 0}; transform: {idx === currentPrinterIndex ? 'scale(1)' : 'scale(0.8)'};"
								>
									<div class="text-8xl mb-6 animate-bounce">{printer.image}</div>
									<h3 class="text-3xl font-bold text-white mb-2">{printer.name}</h3>
									<p class="text-lg text-gray-400">{printer.specs}</p>
								</div>
							{/each}

							<!-- Navigation Buttons -->
							<button
								on:click={prevPrinter}
								class="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-primary-600/20 hover:bg-primary-600/40 text-primary-500 transition-all group"
							>
								<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
								</svg>
							</button>
							<button
								on:click={nextPrinter}
								class="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-primary-600/20 hover:bg-primary-600/40 text-primary-500 transition-all group"
							>
								<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
								</svg>
							</button>
						</div>

						<!-- Carousel Indicators -->
						<div class="flex justify-center gap-2 pb-6">
							{#each printers as _, idx}
								<button
									on:click={() => (currentPrinterIndex = idx)}
									class="w-2 h-2 rounded-full transition-all duration-300"
									class:bg-primary-500={idx === currentPrinterIndex}
									class:bg-gray-700={idx !== currentPrinterIndex}
									class:w-8={idx === currentPrinterIndex}
								></button>
							{/each}
						</div>
					</div>

					<!-- Printer Grid -->
					<div class="grid md:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
						{#each printers as printer, idx}
							<button
								on:click={() => (currentPrinterIndex = idx)}
								class="p-4 rounded-lg border transition-all duration-300 group"
								class:border-primary-600={idx === currentPrinterIndex}
								class:bg-primary-600/20={idx === currentPrinterIndex}
								class:border-gray-700={idx !== currentPrinterIndex}
								class:bg-gray-800/50={idx !== currentPrinterIndex}
								class:hover:bg-gray-700={idx !== currentPrinterIndex}
							>
								<p class="text-2xl mb-2">{printer.image}</p>
								<p class="text-sm font-semibold text-white">{printer.name}</p>
							</button>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<!-- Features Section with Images -->
		<section id="features" class="py-24 relative">
			<div class="max-w-7xl mx-auto px-6">
				<div class="text-center mb-16 space-y-4">
					<h2 class="text-5xl font-bold text-white">How Layered Works</h2>
					<p class="text-xl text-gray-400">From imagination to reality in four simple steps</p>
				</div>

				<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
					{#each [
						{
							step: 1,
							icon: '🎨',
							title: 'Design',
							desc: 'Create your CAD masterpiece in any tool',
							color: 'from-blue-600'
						},
						{
							step: 2,
							icon: '📤',
							title: 'Submit',
							desc: 'Upload your file and claim your project',
							color: 'from-purple-600'
						},
						{
							step: 3,
							icon: '🖨️',
							title: 'Print',
							desc: 'We manufacture your design in our studio',
							color: 'from-cyan-600'
						},
						{
							step: 4,
							icon: '⭐',
							title: 'Earn',
							desc: 'Get paid and build your maker reputation',
							color: 'from-pink-600'
						}
					] as feature, idx}
						<div class="relative group animate-fade-in" style="animation-delay: {idx * 100}ms;">
							<div class="absolute inset-0 bg-gradient-to-r {feature.color} to-transparent opacity-0 group-hover:opacity-20 rounded-2xl transition-all duration-300 blur-xl"></div>
							<div class="relative p-8 rounded-2xl border border-gray-800 bg-gray-900/50 backdrop-blur-sm hover:border-primary-600 transition-all duration-300 h-full flex flex-col">
								<div class="text-6xl mb-4">{feature.icon}</div>
								<div class="flex items-baseline gap-3 mb-3">
									<span class="text-4xl font-bold text-primary-500">{feature.step}</span>
									<h3 class="text-2xl font-bold text-white">{feature.title}</h3>
								</div>
								<p class="text-gray-400 flex-grow">{feature.desc}</p>
							</div>
						</div>
					{/each}
				</div>

				<!-- Image Gallery Section -->
				<div class="mt-24">
					<h3 class="text-3xl font-bold text-white mb-8 text-center">Incredible Creations</h3>
					<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
						{#each [
							{ emoji: '🎭', title: 'Cosplay Props', desc: 'Incredible armor & costume pieces' },
							{ emoji: '🚀', title: 'Prototypes', desc: 'Product designs brought to life' },
							{ emoji: '🎮', title: 'Gaming Gear', desc: 'Custom minis & tabletop creations' },
							{ emoji: '🏠', title: 'Home Goods', desc: 'Unique organizers & decorations' },
							{ emoji: '⚙️', title: 'Mechanical', desc: 'Functional mechanical designs' },
							{ emoji: '🎨', title: 'Art & Crafts', desc: 'Artistic sculptures & figurines' }
						] as item}
							<div class="group relative overflow-hidden rounded-xl border border-gray-800 bg-gray-800/30 p-8 hover:border-primary-600 transition-all duration-300 hover:-translate-y-1">
								<div class="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">{item.emoji}</div>
								<h4 class="text-lg font-bold text-white mb-2">{item.title}</h4>
								<p class="text-sm text-gray-400">{item.desc}</p>
							</div>
						{/each}
					</div>
				</div>
			</div>
		</section>

		<!-- Stats Section -->
		<section class="py-24 relative">
			<div class="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-purple-600/10"></div>
			<div class="relative max-w-7xl mx-auto px-6">
				<div class="grid md:grid-cols-4 gap-8">
					{#each [
						{ value: '1,000+', label: 'Projects Printed', icon: '📦' },
						{ value: '$50K+', label: 'Paid to Makers', icon: '💰' },
						{ value: '50+', label: 'Printer Types', icon: '🖨️' },
						{ value: '24/7', label: 'Studio Operations', icon: '⏰' }
					] as stat, idx}
						<div class="text-center space-y-3 animate-fade-in" style="animation-delay: {idx * 150}ms;">
							<div class="text-5xl">{stat.icon}</div>
							<h3 class="text-4xl font-bold text-primary-500">{stat.value}</h3>
							<p class="text-gray-400">{stat.label}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- CTA Section -->
		<section class="py-24 relative overflow-hidden">
			<div class="max-w-4xl mx-auto px-6 text-center space-y-8">
				<div class="space-y-4">
					<h2 class="text-5xl md:text-6xl font-bold text-white">
						Your Next Masterpiece <br/>
						<span class="text-primary-500">Awaits</span>
					</h2>
					<p class="text-xl text-gray-400 max-w-2xl mx-auto">
						Join makers worldwide. Turn your imagination into something tangible.
					</p>
				</div>

				<div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
					{#if data.loggedIn}
						<a href="/dashboard" class="button md primary hover:scale-105 transition-transform">
							Create Your First Project →
						</a>
					{:else}
						<a href="/auth" class="button md primary hover:scale-105 transition-transform">
							Start Your Journey →
						</a>
					{/if}
					<button
						on:click={() => (window as any).layeredOpenTutorial?.()}
						class="button md secondary hover:scale-105 transition-transform"
					>
						Learn More
					</button>
				</div>

				<!-- Decorative elements -->
				<div class="absolute top-20 left-10 text-6xl opacity-20 animate-float-up">🎨</div>
				<div class="absolute bottom-20 right-10 text-6xl opacity-20 animate-float-up" style="animation-delay: 0.5s;">🖨️</div>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<Footer />
</div>

<style>
	:global(body) {
		font-family: 'Fredoka', 'Sora', ui-sans-serif, system-ui, sans-serif;
	}

	:global(h1, h2, h3, h4, h5, h6) {
		font-family: 'Fredoka', ui-sans-serif, system-ui, sans-serif;
		font-weight: 600;
	}

	.button {
		font-family: 'Fredoka', ui-sans-serif;
	}

	:global(a.button) {
		text-decoration: none;
	}

	/* Animations */
	@keyframes fade-in {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes float-1 {
		0%, 100% {
			transform: translate(0, 0) rotate(0deg);
		}
		33% {
			transform: translate(30px, -30px) rotate(120deg);
		}
		66% {
			transform: translate(-20px, 20px) rotate(240deg);
		}
	}

	@keyframes float-2 {
		0%, 100% {
			transform: translate(0, 0) rotate(0deg);
		}
		33% {
			transform: translate(-40px, 40px) rotate(-120deg);
		}
		66% {
			transform: translate(20px, -30px) rotate(-240deg);
		}
	}

	@keyframes float-up {
		0%, 100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-20px);
		}
	}

	@keyframes rotate-slow {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes gradient-shift {
		0%, 100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}

	:global(.animate-fade-in) {
		animation: fade-in 0.8s ease-out forwards;
		opacity: 0;
	}

	:global(.animate-float-1) {
		animation: float-1 8s ease-in-out infinite;
	}

	:global(.animate-float-2) {
		animation: float-2 8s ease-in-out infinite;
	}

	:global(.animate-float-up) {
		animation: float-up 3s ease-in-out infinite;
	}

	:global(.animate-rotate-slow) {
		animation: rotate-slow 20s linear infinite;
	}

	:global(.animate-pulse-slow) {
		animation: pulse 4s ease-in-out infinite;
	}

	:global(.animate-gradient) {
		background-size: 200% 200%;
		animation: gradient-shift 3s ease-in-out infinite;
	}
</style>
