<script lang="ts">
	import { injectSpeedInsights } from '@vercel/speed-insights/sveltekit';
	import Head from '$lib/components/Head.svelte';
	import Footer from './Footer.svelte';
	import logo from '$lib/assets/logo-nobg.png';

	let { data } = $props();
	injectSpeedInsights();
</script>

<Head title="Layered" />

<div class="min-h-screen bg-[var(--background-color)] flex flex-col">
	<!-- Header -->
	<header class="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
		<div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
			<div class="flex items-center gap-3 group">
				<img src={logo} alt="Layered" class="h-9 w-9 transition-transform group-hover:scale-110" />
				<span class="font-bold text-white text-lg tracking-tight">Layered</span>
			</div>
			<nav class="flex items-center gap-6">
				<a href="/dashboard/tutorial" class="text-sm text-gray-400 hover:text-primary-500 transition-colors duration-200 font-medium">
					Help
				</a>
				{#if data.loggedIn}
					<a href="/dashboard" class="button md primary">Dashboard</a>
				{:else}
					<a href="/auth" class="button md primary">Sign In</a>
				{/if}
			</nav>
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-1 max-w-6xl mx-auto w-full px-6 py-20 md:py-32">
		<!-- Hero Section -->
		<section class="mb-32">
			<div class="grid md:grid-cols-2 gap-16 items-center">
				<!-- Text Content -->
				<div class="space-y-8">
					<div class="space-y-4">
						<div class="inline-block px-3 py-1.5 rounded-lg bg-primary-900/40 border border-primary-700/60">
							<span class="text-xs font-semibold text-primary-300 tracking-wide">CAD • 3D PRINTING • MAKER</span>
						</div>
						<h1 class="text-5xl md:text-6xl font-bold text-white leading-tight">
							Design. <br />Print. <br />Earn.
						</h1>
						<p class="text-lg text-gray-300 leading-relaxed max-w-xl">
							Submit your CAD designs, we 3D print them, and you earn rewards. Build your maker reputation on Layered.
						</p>
					</div>

					<div class="flex flex-col sm:flex-row gap-4 pt-4">
						{#if data.loggedIn}
							<a href="/dashboard" class="button md primary">Go to Dashboard →</a>
						{:else}
							<a href="/auth" class="button md primary">Sign in with Hack Club →</a>
						{/if}
						<button
						on:click={() => (window as any).layeredOpenTutorial?.()}
						class="button md secondary"
					>
						Start Tutorial
					</button>
					</div>
				</div>

				<!-- Animated Demo -->
				<div class="relative h-96 hidden md:flex items-center justify-center">
					<div class="w-full h-full flex flex-col items-center justify-center gap-4">
						<!-- Step 1: Design -->
						<div class="flex items-center gap-3 w-full px-6 py-4 rounded-lg bg-gray-800/50 border border-gray-700 animate-pulse-slow">
							<div class="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold flex-shrink-0">1</div>
							<div>
								<div class="text-sm font-semibold text-white">Design</div>
								<div class="text-xs text-gray-400">Create in Fusion 360, Blender, etc.</div>
							</div>
						</div>

						<!-- Arrow -->
						<div class="text-primary-500 text-2xl">↓</div>

						<!-- Step 2: Upload -->
						<div class="flex items-center gap-3 w-full px-6 py-4 rounded-lg bg-gray-800/50 border border-gray-700">
							<div class="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold flex-shrink-0">2</div>
							<div>
								<div class="text-sm font-semibold text-white">Submit</div>
								<div class="text-xs text-gray-400">Upload STL/STEP and set reward goal</div>
							</div>
						</div>

						<!-- Arrow -->
						<div class="text-primary-500 text-2xl">↓</div>

						<!-- Step 3: Print -->
						<div class="flex items-center gap-3 w-full px-6 py-4 rounded-lg bg-gray-800/50 border border-gray-700">
							<div class="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold flex-shrink-0">3</div>
							<div>
								<div class="text-sm font-semibold text-white">Get Printed</div>
								<div class="text-xs text-gray-400">We review & 3D print your design</div>
							</div>
						</div>

						<!-- Arrow -->
						<div class="text-primary-500 text-2xl">↓</div>

						<!-- Step 4: Earn -->
						<div class="flex items-center gap-3 w-full px-6 py-4 rounded-lg bg-primary-900/30 border border-primary-700">
							<div class="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold flex-shrink-0">4</div>
							<div>
								<div class="text-sm font-semibold text-white">Earn Rewards</div>
								<div class="text-xs text-primary-300">Unlock items, build reputation</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Features Grid -->
		<section class="grid md:grid-cols-3 gap-6 mb-32">
			{#each [
				{ title: 'Design', desc: 'Use any CAD tool. Export STL/STEP. It\'s that simple.', emoji: '🎨' },
				{ title: 'Print', desc: 'We handle production. Your designs become real.' , emoji: '🖨️'},
				{ title: 'Earn', desc: 'Unlock rewards. Build your maker reputation.' , emoji: '⭐'}
			] as feature}
				<div class="themed-box-solid flex flex-col h-full gap-4">
					<div class="text-5xl">{feature.emoji}</div>
					<div>
						<h3 class="text-xl font-bold text-white mb-2">{feature.title}</h3>
						<p class="text-gray-300 leading-relaxed text-sm">{feature.desc}</p>
					</div>
				</div>
			{/each}
		</section>

		<!-- How It Works -->
		<section class="mb-32">
			<div class="mb-12">
				<h2 class="text-4xl font-bold text-white mb-2">The Process</h2>
				<p class="text-gray-400">From concept to physical reality in 5 steps</p>
			</div>

			<div class="space-y-4">
				{#each [
					{ num: '1', title: 'Design', desc: 'Create your CAD model (Fusion 360, Blender, FreeCAD, etc.)' },
					{ num: '2', title: 'Prepare', desc: 'Export as STL/STEP, check dimensions and tolerances' },
					{ num: '3', title: 'Submit', desc: 'Upload your file, claim the project, set your reward goal' },
					{ num: '4', title: 'Review', desc: 'Our team reviews your submission for quality and feasibility' },
					{ num: '5', title: 'Receive', desc: 'Once approved, we print and ship. You earn your reward!' }
				] as step}
					<div class="themed-box-solid flex gap-6 items-start">
						<div class="flex-shrink-0 w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center">
							<span class="text-lg font-bold text-white">{step.num}</span>
						</div>
						<div class="flex-1 py-1">
							<h3 class="text-lg font-bold text-white mb-1">{step.title}</h3>
							<p class="text-gray-400 text-sm">{step.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Stats -->
		<section class="mb-32">
			<div class="grid md:grid-cols-3 gap-6">
				{#each [
					{ label: '24/7 Access', value: '∞', desc: 'Submit anytime' },
					{ label: 'Real Prints', value: '📦', desc: 'Physical objects' },
					{ label: 'Community', value: '👥', desc: 'Compete & collaborate' }
				] as stat}
					<div class="themed-box-solid text-center py-8">
						<div class="text-5xl mb-3">{stat.value}</div>
						<h3 class="text-lg font-bold text-white mb-1">{stat.label}</h3>
						<p class="text-sm text-gray-400">{stat.desc}</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- Technical Specs -->
		<section class="mb-32">
			<div class="themed-box-solid border-2 border-gray-700">
				<div class="space-y-6">
					<div>
						<h2 class="text-3xl font-bold text-white mb-2">Technical Requirements</h2>
						<p class="text-gray-400">Everything you need to know about submitting</p>
					</div>

					<div class="grid md:grid-cols-2 gap-8">
						<div class="space-y-4">
							<div>
								<h3 class="font-bold text-white mb-2 flex items-center gap-2">
									<span class="text-lg">📐</span> Supported Formats
								</h3>
								<ul class="text-sm text-gray-300 space-y-1 pl-6">
									<li>• STL, STEP, IGES</li>
									<li>• OBJ, FBX, 3DS</li>
									<li>• Fusion 360 native files</li>
								</ul>
							</div>
							<div>
								<h3 class="font-bold text-white mb-2 flex items-center gap-2">
									<span class="text-lg">📏</span> Size Limits
								</h3>
								<ul class="text-sm text-gray-300 space-y-1 pl-6">
									<li>• Max 300 × 300 × 300 mm</li>
									<li>• Min wall thickness: 0.8 mm</li>
									<li>• File size: ≤ 50 MB</li>
								</ul>
							</div>
						</div>

						<div class="space-y-4">
							<div>
								<h3 class="font-bold text-white mb-2 flex items-center gap-2">
									<span class="text-lg">⚙️</span> Materials
								</h3>
								<ul class="text-sm text-gray-300 space-y-1 pl-6">
									<li>• PLA (standard)</li>
									<li>• ABS, PETG</li>
									<li>• Resin (for precision)</li>
								</ul>
							</div>
							<div>
								<h3 class="font-bold text-white mb-2 flex items-center gap-2">
									<span class="text-lg">✓</span> Quality Checks
								</h3>
								<ul class="text-sm text-gray-300 space-y-1 pl-6">
									<li>• Structural integrity</li>
									<li>• Print feasibility</li>
									<li>• Design originality</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Final CTA -->
		<section class="space-y-8 text-center">
			<div>
				<h2 class="text-4xl font-bold text-white mb-4">Ready to Get Started?</h2>
				<p class="text-lg text-gray-400 max-w-2xl mx-auto">
					Join makers worldwide. Your next 3D printed creation is just a submission away.
				</p>
			</div>

			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				{#if data.loggedIn}
					<a href="/dashboard" class="button md primary">Go to Dashboard →</a>
				{:else}
					<a href="/auth" class="button md primary">Sign in with Hack Club →</a>
				{/if}
				<button
					on:click={() => (window as any).layeredOpenTutorial?.()}
					class="button md secondary"
				>
					See How It Works
				</button>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer class="mt-20 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm">
		<div class="max-w-6xl mx-auto px-6 py-12 text-center text-gray-400">
			<p class="mb-2">Made by <a href="https://hackclub.com" class="text-primary-500 hover:text-primary-400 font-semibold transition-colors">Hack Club</a></p>
			<p class="text-sm text-gray-500">Building the future of maker education</p>
		</div>
	</footer>
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
</style>
