<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Head from '$lib/components/Head.svelte';
	import Footer from './Footer.svelte';

	import logo from '$lib/assets/logo-nobg.png';

	let { data } = $props();
</script>

<Head title="Layered" />

<div class="min-h-screen bg-[var(--background-color)] flex flex-col">
	<!-- Header -->
	<header class="border-b border-primary-200 bg-primary-50/40 backdrop-blur-sm sticky top-0 z-50">
		<div class="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
			<div class="flex items-center gap-3 group">
				<img src={logo} alt="Layered" class="h-9 w-9 transition-transform group-hover:scale-110" />
				<span class="font-bold text-primary-950 text-lg tracking-tight">Layered</span>
			</div>
			<nav class="flex items-center gap-6">
				<a href="/dashboard/tutorial" class="text-sm text-primary-700 hover:text-primary-900 transition-colors duration-200 font-medium">
					Help
				</a>
				{#if data.loggedIn}
					<button class="button md primary">Dashboard</button>
				{:else}
					<button class="button md primary">Sign In</button>
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
						<div class="inline-block px-3 py-1.5 rounded-lg bg-primary-100/60 border border-primary-300/40">
							<span class="text-xs font-semibold text-primary-900 tracking-wide">CAD × 3D PRINTING × MAKER</span>
						</div>
						<h1 class="text-5xl md:text-6xl font-bold text-primary-950 leading-tight">
							Design in Layers. <br /> Build Your Vision.
						</h1>
						<p class="text-lg text-primary-800 leading-relaxed max-w-xl">
							Layered is where makers design CAD projects, get them 3D printed, and build reputation. Track your progress, unlock rewards, and compete on the leaderboard.
						</p>
					</div>

					<div class="flex flex-col sm:flex-row gap-4 pt-4">
						{#if data.loggedIn}
							<button class="button md primary">Go to Dashboard →</button>
						{:else}
							<button class="button md primary">Sign in with Hack Club →</button>
						{/if}
						<button class="button md" style="background-color: transparent; border: 2px solid var(--color-primary-300); color: var(--font-color); hover: border-color: var(--color-primary-500);">
							Learn More
						</button>
					</div>
				</div>

				<!-- CAD Blueprint Visualization -->
				<div class="relative h-96 hidden md:block">
					<svg viewBox="0 0 400 400" class="w-full h-full" xmlns="http://www.w3.org/2000/svg">
						<!-- Grid background -->
						<defs>
							<pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
								<path d="M 20 0 L 0 0 0 20" fill="none" stroke="var(--color-primary-300)" stroke-width="0.5" opacity="0.3"/>
							</pattern>
						</defs>
						<rect width="400" height="400" fill="var(--background-color)" />
						<rect width="400" height="400" fill="url(#grid)" />

						<!-- Coordinate axes -->
						<line x1="50" y1="350" x2="350" y2="350" stroke="var(--color-primary-500)" stroke-width="2"/>
						<line x1="50" y1="350" x2="50" y2="50" stroke="var(--color-primary-500)" stroke-width="2"/>
						<text x="360" y="365" font-size="12" fill="var(--color-primary-900)" font-family="monospace">X</text>
						<text x="25" y="35" font-size="12" fill="var(--color-primary-900)" font-family="monospace">Z</text>

						<!-- Isometric cube 1 (front) -->
						<g opacity="0.8">
							<path d="M 100 200 L 150 170 L 150 270 L 100 300 Z" fill="var(--color-primary-100)" stroke="var(--color-primary-600)" stroke-width="2"/>
							<path d="M 100 200 L 150 170 L 200 200 L 150 230 Z" fill="var(--color-primary-200)" stroke="var(--color-primary-600)" stroke-width="2"/>
							<path d="M 150 230 L 200 200 L 200 300 L 150 330 Z" fill="var(--color-primary-50)" stroke="var(--color-primary-600)" stroke-width="2"/>
						</g>

						<!-- Isometric cube 2 (back/stacked) -->
						<g opacity="0.7">
							<path d="M 220 240 L 270 210 L 270 310 L 220 340 Z" fill="var(--color-primary-100)" stroke="var(--color-primary-600)" stroke-width="2"/>
							<path d="M 220 240 L 270 210 L 320 240 L 270 270 Z" fill="var(--color-primary-200)" stroke="var(--color-primary-600)" stroke-width="2"/>
							<path d="M 270 270 L 320 240 L 320 340 L 270 370 Z" fill="var(--color-primary-50)" stroke="var(--color-primary-600)" stroke-width="2"/>
						</g>

						<!-- Dimension lines -->
						<line x1="100" y1="320" x2="220" y2="320" stroke="var(--color-primary-400)" stroke-width="1" stroke-dasharray="3,3"/>
						<line x1="100" y1="315" x2="100" y2="325" stroke="var(--color-primary-400)" stroke-width="1"/>
						<line x1="220" y1="315" x2="220" y2="325" stroke="var(--color-primary-400)" stroke-width="1"/>
						<text x="155" y="345" font-size="10" fill="var(--color-primary-700)" font-family="monospace" text-anchor="middle">120mm</text>

						<!-- Center point markers -->
						<circle cx="150" cy="230" r="3" fill="var(--color-primary-600)"/>
						<circle cx="270" cy="270" r="3" fill="var(--color-primary-600)"/>

						<!-- Rotation indicator -->
						<g opacity="0.5">
							<path d="M 320 100 Q 340 80 360 100" fill="none" stroke="var(--color-primary-500)" stroke-width="1.5" stroke-dasharray="2,2"/>
							<text x="365" y="100" font-size="11" fill="var(--color-primary-700)" font-family="monospace">45°</text>
						</g>
					</svg>
				</div>
			</div>
		</section>

		<!-- Features Grid -->
		<section class="grid md:grid-cols-3 gap-6 mb-32">
			{#each [
				{ title: 'Design', desc: 'Use Fusion 360, Blender, or any CAD tool. Export and submit your models.', icon: '⬡' },
				{ title: 'Print', desc: 'We handle production. Your designs become real objects you can hold.' , icon: '⬢'},
				{ title: 'Earn', desc: 'Complete goals, unlock rewards, and build your maker reputation.' , icon: '⬣'}
			] as feature}
				<div class="group themed-box-solid hover:-translate-y-1">
					<div class="flex flex-col h-full gap-4">
						<div class="text-4xl opacity-70">{feature.icon}</div>
						<div>
							<h3 class="text-xl font-bold text-primary-950 mb-2">{feature.title}</h3>
							<p class="text-primary-800 leading-relaxed">{feature.desc}</p>
						</div>
					</div>
				</div>
			{/each}
		</section>

		<!-- How It Works - Technical Flow -->
		<section class="mb-32">
			<div class="mb-12">
				<h2 class="text-4xl font-bold text-primary-950 mb-2">The Process</h2>
				<p class="text-primary-700">5 steps from concept to reality</p>
			</div>

			<div class="space-y-6">
				{#each [
					{ num: '01', title: 'Design', desc: 'Create your CAD model with any tool (Fusion 360, Blender, FreeCAD, etc.)', time: '1-2 weeks' },
					{ num: '02', title: 'Prepare', desc: 'Export as STL/STEP and prepare for printing. Check dimensions and tolerances.', time: '1-2 days' },
					{ num: '03', title: 'Submit', desc: 'Upload your files and claim the project. Set your reward goal.', time: 'Minutes' },
					{ num: '04', title: 'Review', desc: 'Our team reviews your submission. Peers provide feedback and validation.', time: '3-5 days' },
					{ num: '05', title: 'Receive', desc: 'Approved? We print and ship your design. You earn your reward.', time: '2-3 weeks' }
				] as step, i}
					<div class="themed-box-solid flex gap-6 items-start hover:-translate-y-0.5 transition-transform">
						<div class="flex-shrink-0 w-16 h-16 rounded-lg bg-primary-100 border-2 border-primary-300 flex items-center justify-center">
							<span class="text-2xl font-bold text-primary-700">{step.num}</span>
						</div>
						<div class="flex-1 py-2">
							<div class="flex items-baseline gap-3 mb-2">
								<h3 class="text-lg font-bold text-primary-950">{step.title}</h3>
								<span class="text-xs text-primary-600 bg-primary-100 px-2 py-1 rounded">{step.time}</span>
							</div>
							<p class="text-primary-800">{step.desc}</p>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Stats with Grid -->
		<section class="mb-32">
			<div class="grid md:grid-cols-3 gap-6">
				{#each [
					{ label: '24/7 Access', value: '∞', desc: 'Submit anytime' },
					{ label: 'Real Prints', value: '📦', desc: 'Physical objects' },
					{ label: 'Community', value: '👥', desc: 'Compete & Collaborate' }
				] as stat}
					<div class="themed-box-solid text-center py-8 hover:shadow-lg transition-shadow">
						<div class="text-5xl mb-3 opacity-70">{stat.value}</div>
						<h3 class="text-lg font-bold text-primary-950 mb-1">{stat.label}</h3>
						<p class="text-sm text-primary-700">{stat.desc}</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- Blueprint Technical Specs Section -->
		<section class="mb-32">
			<div class="themed-box-solid border-2 border-primary-300">
				<div class="space-y-6">
					<div>
						<h2 class="text-3xl font-bold text-primary-950 mb-2">Technical Specs</h2>
						<p class="text-primary-700">Everything you need to know about submitting</p>
					</div>

					<div class="grid md:grid-cols-2 gap-8">
						<div class="space-y-4">
							<div>
								<h3 class="font-bold text-primary-900 mb-2 flex items-center gap-2">
									<span class="text-lg">📐</span> Supported Formats
								</h3>
								<ul class="text-sm text-primary-800 space-y-1 pl-6">
									<li>• STL, STEP, IGES</li>
									<li>• OBJ, FBX, 3DS</li>
									<li>• Native Fusion 360 files</li>
								</ul>
							</div>
							<div>
								<h3 class="font-bold text-primary-900 mb-2 flex items-center gap-2">
									<span class="text-lg">📏</span> Size Limits
								</h3>
								<ul class="text-sm text-primary-800 space-y-1 pl-6">
									<li>• Max 300 × 300 × 300 mm</li>
									<li>• Min wall thickness: 0.8 mm</li>
									<li>• File size: ≤ 50 MB</li>
								</ul>
							</div>
						</div>

						<div class="space-y-4">
							<div>
								<h3 class="font-bold text-primary-900 mb-2 flex items-center gap-2">
									<span class="text-lg">⚙️</span> Materials
								</h3>
								<ul class="text-sm text-primary-800 space-y-1 pl-6">
									<li>• PLA (standard)</li>
									<li>• ABS, PETG</li>
									<li>• Resin (for precision)</li>
								</ul>
							</div>
							<div>
								<h3 class="font-bold text-primary-900 mb-2 flex items-center gap-2">
									<span class="text-lg">✓</span> Quality Checks
								</h3>
								<ul class="text-sm text-primary-800 space-y-1 pl-6">
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

		<!-- CTA Section -->
		<section class="space-y-8 text-center">
			<div>
				<h2 class="text-4xl font-bold text-primary-950 mb-4">Ready to Design?</h2>
				<p class="text-lg text-primary-800 max-w-2xl mx-auto">
					Join the Layered community. Your next 3D printed creation is one submission away.
				</p>
			</div>

			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				{#if data.loggedIn}
					<button class="button md primary">Go to Dashboard →</button>
				{:else}
					<button class="button md primary">Sign in with Hack Club →</button>
				{/if}
				<button class="button md" style="background-color: transparent; border: 2px solid var(--color-primary-300); color: var(--font-color);">
					Read the Docs
				</button>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer class="mt-20 border-t border-primary-200 bg-primary-50/30 backdrop-blur-sm">
		<div class="max-w-6xl mx-auto px-6 py-12 text-center text-primary-800">
			<p class="mb-2">Made by <a href="https://hackclub.com" class="text-primary-600 hover:text-primary-700 font-semibold transition-colors">Hack Club</a></p>
			<p class="text-sm text-primary-700">Building the future of maker education</p>
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
</style>
