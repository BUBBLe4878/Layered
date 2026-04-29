<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Head from '$lib/components/Head.svelte';
	import Footer from './Footer.svelte';

	import logo from '$lib/assets/logo-nobg.png';

	export let data;

	let hoursTracked = 0;
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
					<div class="inline-block px-4 py-2 rounded-lg bg-primary-100/60 border border-primary-300/40">
						<span class="text-xs font-bold text-primary-900 tracking-widest">DESIGN. PRINT. WIN.</span>
					</div>
					
					<div>
						<h1 class="text-6xl md:text-7xl font-bold text-primary-950 leading-tight mb-6">
							40 hours of CAD design.
						</h1>
						<p class="text-5xl font-bold text-primary-600">One free 3D printer.</p>
					</div>
					
					<p class="text-xl text-primary-800 leading-relaxed">
						Upload your CAD creations. Get them professionally 3D printed. Earn a fully-equipped professional 3D printer worth $3000+.
					</p>

					<div class="flex flex-col sm:flex-row gap-4 pt-4">
						{#if data.loggedIn}
							<button class="button md primary">Start Designing</button>
						{:else}
							<button class="button md primary">Begin Your Journey</button>
						{/if}
						<button class="button md" style="background-color: transparent; border: 2px solid var(--color-primary-300); color: var(--font-color);">
							See How It Works
						</button>
					</div>

					<!-- Social Proof Stats -->
					<div class="grid grid-cols-3 gap-4 pt-8 border-t border-primary-200">
						<div>
							<div class="text-3xl font-bold text-primary-600">500+</div>
							<p class="text-sm text-primary-700">Designs Created</p>
						</div>
						<div>
							<div class="text-3xl font-bold text-primary-600">200+</div>
							<p class="text-sm text-primary-700">Printed Objects</p>
						</div>
						<div>
							<div class="text-3xl font-bold text-primary-600">50</div>
							<p class="text-sm text-primary-700">Printers Earned</p>
						</div>
					</div>
				</div>

				<!-- Hand-drawn 3D Printer Illustration -->
				<div class="hidden md:block">
					<svg viewBox="0 0 400 500" class="w-full drop-shadow-lg" xmlns="http://www.w3.org/2000/svg" role="img">
						<title>Hand-drawn 3D printer</title>
						<desc>An artistic, hand-drawn illustration of a modern 3D printer with organic curves and warm colors</desc>
						
						<!-- Frame outline - hand-drawn style -->
						<path d="M 60 80 Q 70 70 85 75 L 315 75 Q 330 70 340 80" fill="none" stroke="#5a4623" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
						<path d="M 60 80 L 55 320 Q 50 340 65 345 L 335 345 Q 350 340 345 320 L 340 80" fill="none" stroke="#5a4623" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
						
						<!-- Main body fill -->
						<path d="M 65 85 L 62 340 Q 60 350 70 355 L 330 355 Q 340 350 338 340 L 335 85 Z" fill="#fef3c7" opacity="0.8"/>
						
						<!-- Build plate - organic shape -->
						<ellipse cx="200" cy="260" rx="110" ry="45" fill="#fce8a6" stroke="#b8924a" stroke-width="2.5" opacity="0.9"/>
						<path d="M 140 250 Q 130 260 135 275 Q 145 285 160 280 Q 170 272 165 258" fill="#fdd97b" stroke="#8b6a32" stroke-width="1.5"/>
						<path d="M 260 250 Q 270 260 265 275 Q 255 285 240 280 Q 230 272 235 258" fill="#fdd97b" stroke="#8b6a32" stroke-width="1.5"/>
						<path d="M 200 240 Q 190 245 195 260 Q 205 268 215 260 Q 220 245 210 238" fill="#fdd97b" stroke="#8b6a32" stroke-width="1.5"/>
						
						<!-- Nozzle assembly - artistic -->
						<g transform="translate(200, 150)">
							<path d="M -8 0 Q -10 15 -5 30 Q 0 35 5 30 Q 10 15 8 0 Z" fill="#d4af85" stroke="#8b6a32" stroke-width="2"/>
							<circle cx="0" cy="35" r="6" fill="#c9a25b" stroke="#8b6a32" stroke-width="1.5"/>
							<path d="M -3 35 L -3 45 M 3 35 L 3 45" stroke="#8b6a32" stroke-width="1.5" stroke-linecap="round"/>
						</g>
						
						<!-- Cartridge/Material slot -->
						<rect x="310" y="120" width="35" height="80" rx="6" fill="#fdd97b" stroke="#b8924a" stroke-width="2.5" opacity="0.85"/>
						<path d="M 320 130 L 320 190 M 325 130 L 325 190 M 330 130 L 330 190" stroke="#c9a25b" stroke-width="1" opacity="0.6"/>
						<text x="305" y="145" font-family="Fredoka" font-size="9" font-weight="bold" fill="#5a4623">RESIN</text>
						
						<!-- Control buttons - artistic arrangement -->
						<g transform="translate(320, 220)">
							<circle cx="0" cy="0" r="5" fill="#fcc84a" stroke="#8b6a32" stroke-width="1.5" opacity="0.9"/>
							<circle cx="15" cy="0" r="5" fill="#fcc84a" stroke="#8b6a32" stroke-width="1.5" opacity="0.9"/>
							<circle cx="0" cy="15" r="5" fill="#fcc84a" stroke="#8b6a32" stroke-width="1.5" opacity="0.9"/>
							<circle cx="15" cy="15" r="5" fill="#fcc84a" stroke="#8b6a32" stroke-width="1.5" opacity="0.9"/>
						</g>
						
						<!-- Light indicator - glowing effect -->
						<circle cx="70" cy="100" r="6" fill="#fcc84a" stroke="#8b6a32" stroke-width="1.5"/>
						<circle cx="70" cy="100" r="3" fill="#fdd97b" opacity="0.8"/>
						
						<!-- Base/Stand - organic curves -->
						<path d="M 50 345 Q 40 360 60 375 L 340 375 Q 360 360 350 345" fill="#d4af85" stroke="#8b6a32" stroke-width="2.5" stroke-linejoin="round"/>
						<path d="M 60 375 Q 50 385 70 395 L 330 395 Q 350 385 340 375" fill="#c9a25b" stroke="#8b6a32" stroke-width="2" stroke-linejoin="round"/>
						
						<!-- Decorative accents - hand-drawn details -->
						<path d="M 100 110 Q 102 108 104 110" fill="none" stroke="#8b6a32" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
						<path d="M 295 110 Q 297 108 299 110" fill="none" stroke="#8b6a32" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
						
						<!-- Shadow beneath -->
						<ellipse cx="200" cy="410" rx="140" ry="20" fill="#8b6a32" opacity="0.08"/>
					</svg>
				</div>
			</div>
		</section>

		<!-- 40-Hour Journey Section -->
		<section class="mb-32">
			<div class="space-y-12">
				<div>
					<h2 class="text-4xl font-bold text-primary-950 mb-4">Your Path to $3000+ Equipment</h2>
					<p class="text-primary-700">Track your progress. Unlock rewards. Reach the grand prize.</p>
				</div>

				<!-- Milestone Tracker -->
				<div class="grid md:grid-cols-5 gap-4">
					{#each [
						{ hours: '10', label: 'First Steps', color: 'primary-100', border: 'primary-300' },
						{ hours: '20', label: 'Momentum', color: 'primary-200', border: 'primary-400' },
						{ hours: '30', label: 'Home Stretch', color: 'primary-300', border: 'primary-500' },
						{ hours: '35', label: 'Nearly There', color: 'primary-400', border: 'primary-600' },
						{ hours: '40+', label: 'FREE PRINTER', color: 'primary-600', border: 'primary-700', highlight: true }
					] as milestone}
						<div class={`themed-box-solid text-center py-6 transition-all duration-300 hover:scale-105 ${milestone.highlight ? 'ring-2 ring-primary-600 shadow-xl' : ''}`} style={`background-color: var(--color-${milestone.color}); border-color: var(--color-${milestone.border});`}>
							<div class="text-sm font-bold text-primary-950 mb-2">{milestone.hours}</div>
							<h3 class="text-base font-bold text-primary-950">{milestone.label}</h3>
						</div>
					{/each}
				</div>

				<!-- Progress Bar -->
				<div class="themed-box-solid space-y-4 border-2 border-primary-400">
					<div class="flex justify-between items-center">
						<span class="font-bold text-primary-950 text-lg">Your Progress</span>
						<span class="text-3xl font-bold text-primary-600">{hoursTracked}/40</span>
					</div>
					<div class="w-full bg-primary-100 rounded-full h-8 overflow-hidden border-2 border-primary-300">
						<div 
							class="bg-gradient-to-r from-primary-600 to-primary-500 h-full rounded-full transition-all duration-500"
							style="width: {Math.min(100, (hoursTracked / 40) * 100)}%"
						/>
					</div>
					<p class="text-primary-700 font-medium">
						{#if hoursTracked === 0}
							Start designing to track your hours
						{:else if hoursTracked < 40}
							{40 - hoursTracked} hours remaining until your free printer arrives
						{:else}
							Success! Your printer is on the way!
						{/if}
					</p>
				</div>
			</div>
		</section>

		<!-- CAD Tools Section -->
		<section class="mb-32">
			<div class="space-y-12">
				<div>
					<h2 class="text-4xl font-bold text-primary-950 mb-4">Design With Your Favorite Tools</h2>
					<p class="text-primary-700">Complete creative freedom. Any CAD platform.</p>
				</div>

				<div class="grid md:grid-cols-3 gap-8">
					<!-- Fusion 360 -->
					<div class="themed-box-solid hover:shadow-xl transition-all">
						<svg viewBox="0 0 120 120" class="w-20 h-20 mx-auto mb-6" xmlns="http://www.w3.org/2000/svg">
							<title>Fusion 360 icon</title>
							<!-- Orange/gold circle background -->
							<circle cx="60" cy="60" r="55" fill="#fdd97b" stroke="#b8924a" stroke-width="2"/>
							<!-- Stylized F shape - hand-drawn style -->
							<path d="M 40 35 L 40 85 M 40 35 L 75 35 M 40 55 L 70 55" fill="none" stroke="#5a4623" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						<h3 class="text-lg font-bold text-primary-950 mb-2 text-center">Fusion 360</h3>
						<p class="text-sm text-primary-800 text-center">Parametric CAD with powerful surface modeling</p>
					</div>

					<!-- Blender -->
					<div class="themed-box-solid hover:shadow-xl transition-all">
						<svg viewBox="0 0 120 120" class="w-20 h-20 mx-auto mb-6" xmlns="http://www.w3.org/2000/svg">
							<title>Blender icon</title>
							<!-- Light orange circle -->
							<circle cx="60" cy="60" r="55" fill="#fce8a6" stroke="#b8924a" stroke-width="2"/>
							<!-- Stylized B - hand-drawn -->
							<path d="M 40 35 L 40 85 M 40 35 L 70 45 Q 75 45 75 52 Q 70 60 40 60 M 40 60 L 72 60 Q 78 60 78 70 Q 78 85 65 85 L 40 85" fill="none" stroke="#5a4623" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
						</svg>
						<h3 class="text-lg font-bold text-primary-950 mb-2 text-center">Blender</h3>
						<p class="text-sm text-primary-800 text-center">Free 3D modeling, sculpting & rendering</p>
					</div>

					<!-- FreeCAD -->
					<div class="themed-box-solid hover:shadow-xl transition-all">
						<svg viewBox="0 0 120 120" class="w-20 h-20 mx-auto mb-6" xmlns="http://www.w3.org/2000/svg">
							<title>FreeCAD icon</title>
							<!-- Warm cream circle -->
							<circle cx="60" cy="60" r="55" fill="#fef3c7" stroke="#b8924a" stroke-width="2"/>
							<!-- Stylized gear/technical symbol -->
							<g transform="translate(60, 60)">
								<circle cx="0" cy="0" r="12" fill="none" stroke="#5a4623" stroke-width="2"/>
								<path d="M 0 -20 L 0 -15 M 0 15 L 0 20 M 20 0 L 15 0 M -15 0 L -20 0" stroke="#5a4623" stroke-width="2.5" stroke-linecap="round"/>
								<path d="M 12 -12 L 14 -14 M -12 12 L -14 14 M 12 12 L 14 14 M -12 -12 L -14 -14" stroke="#5a4623" stroke-width="2" stroke-linecap="round"/>
							</g>
						</svg>
						<h3 class="text-lg font-bold text-primary-950 mb-2 text-center">FreeCAD</h3>
						<p class="text-sm text-primary-800 text-center">Open-source precision engineering</p>
					</div>
				</div>
			</div>
		</section>

		<!-- The Complete Journey -->
		<section class="mb-32">
			<div class="space-y-8">
				<div>
					<h2 class="text-4xl font-bold text-primary-950 mb-2">From Concept to Creation</h2>
					<p class="text-primary-700">Six steps. Real results. Measurable progress.</p>
				</div>

				<div class="space-y-4">
					{#each [
						{ num: '1', title: 'Design', desc: 'Create your CAD model in your chosen software. No restrictions, unlimited creativity.' },
						{ num: '2', title: 'Export', desc: 'Prepare your design. Export as STL or STEP. Verify dimensions and wall thickness.' },
						{ num: '3', title: 'Upload', desc: 'Submit your design to Layered. Claim the project. Set your personal goal.' },
						{ num: '4', title: 'Review', desc: 'Community feedback. Peer validation. Real makers provide constructive critique.' },
						{ num: '5', title: 'Print', desc: 'Approved design gets 3D printed on professional equipment. Full quality control.' },
						{ num: '6', title: 'Ship', desc: 'Receive your printed creation. Track hours toward your free 3D printer.' }
					] as step, idx}
						<div class="themed-box-solid flex gap-6 items-start hover:shadow-lg transition-shadow hover:-translate-y-1">
							<div class="flex-shrink-0 w-16 h-16 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 border-2 border-primary-400 flex items-center justify-center">
								<span class="text-2xl font-bold text-primary-700">{step.num}</span>
							</div>
							<div class="flex-1 py-1">
								<h3 class="text-lg font-bold text-primary-950 mb-1">{step.title}</h3>
								<p class="text-primary-800">{step.desc}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Why Layered -->
		<section class="mb-32">
			<div class="space-y-8">
				<div>
					<h2 class="text-4xl font-bold text-primary-950 mb-2">Why Makers Choose Layered</h2>
				</div>

				<div class="grid md:grid-cols-3 gap-6">
					{#each [
						{ title: 'No Limits', desc: 'Use any CAD software. Design anything within technical specs.' },
						{ title: 'Real Community', desc: 'Get genuine feedback from experienced makers and engineers.' },
						{ title: 'Actual Rewards', desc: 'Unlock badges, stickers, reserves, and a free 3D printer.' },
						{ title: 'Track Progress', desc: 'Transparent hour tracking. Watch your journey to the printer.' },
						{ title: 'Get Printed', desc: 'Your designs become physical objects on professional equipment.' },
						{ title: 'Zero Cost', desc: 'Free to join. No hidden fees. Keep everything you earn.' }
					] as feature}
						<div class="themed-box-solid space-y-3 hover:shadow-lg transition-shadow hover:-translate-y-1">
							<h3 class="font-bold text-primary-950 text-lg">{feature.title}</h3>
							<p class="text-sm text-primary-800">{feature.desc}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Technical Requirements -->
		<section class="mb-32">
			<div class="themed-box-solid border-2 border-primary-400 space-y-8">
				<div>
					<h2 class="text-3xl font-bold text-primary-950 mb-2">Technical Specifications</h2>
					<p class="text-primary-700">What you need to know before submitting</p>
				</div>

				<div class="grid md:grid-cols-2 gap-8">
					<div class="space-y-6">
						<div>
							<h3 class="font-bold text-primary-900 mb-3 text-lg">Supported File Formats</h3>
							<ul class="text-sm text-primary-800 space-y-2">
								<li class="flex items-center gap-2"><span class="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></span> STL (Stereolithography)</li>
								<li class="flex items-center gap-2"><span class="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></span> STEP (3D Assembly)</li>
								<li class="flex items-center gap-2"><span class="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></span> IGES, OBJ, FBX</li>
								<li class="flex items-center gap-2"><span class="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></span> Native Fusion 360 & Blender</li>
							</ul>
						</div>
						<div>
							<h3 class="font-bold text-primary-900 mb-3 text-lg">Print Materials</h3>
							<ul class="text-sm text-primary-800 space-y-2">
								<li class="flex items-center gap-2"><span class="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></span> PLA (biodegradable)</li>
								<li class="flex items-center gap-2"><span class="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></span> ABS (durable)</li>
								<li class="flex items-center gap-2"><span class="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></span> PETG (flexible)</li>
								<li class="flex items-center gap-2"><span class="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></span> Resin (precision)</li>
							</ul>
						</div>
					</div>

					<div class="space-y-6">
						<div>
							<h3 class="font-bold text-primary-900 mb-3 text-lg">Build Specifications</h3>
							<ul class="text-sm text-primary-800 space-y-2">
								<li class="flex items-center gap-2"><span class="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></span> Max 300 × 300 × 300 mm</li>
								<li class="flex items-center gap-2"><span class="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></span> Min wall: 0.8 mm</li>
								<li class="flex items-center gap-2"><span class="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></span> Min feature: 0.5 mm</li>
								<li class="flex items-center gap-2"><span class="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></span> File size: ≤ 50 MB</li>
							</ul>
						</div>
						<div>
							<h3 class="font-bold text-primary-900 mb-3 text-lg">Quality Standards</h3>
							<ul class="text-sm text-primary-800 space-y-2">
								<li class="flex items-center gap-2"><span class="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></span> Structural integrity</li>
								<li class="flex items-center gap-2"><span class="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></span> Printability check</li>
								<li class="flex items-center gap-2"><span class="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></span> Design originality</li>
								<li class="flex items-center gap-2"><span class="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0"></span> Peer validation</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Final CTA -->
		<section class="themed-box-solid border-2 border-primary-500 text-center space-y-8 py-16">
			<div>
				<h2 class="text-5xl font-bold text-primary-950 mb-6">Ready to Create?</h2>
				<p class="text-xl text-primary-800 max-w-2xl mx-auto">
					40 hours of your design work. One free professional 3D printer. Join hundreds of makers building the future.
				</p>
			</div>

			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				{#if data.loggedIn}
					<button class="button md primary">Go to Dashboard</button>
				{:else}
					<button class="button md primary">Begin Your Journey</button>
				{/if}
				<button class="button md" style="background-color: transparent; border: 2px solid var(--color-primary-300); color: var(--font-color);">
					Learn More
				</button>
			</div>
		</section>
	</main>

	<!-- Footer -->
	<footer class="mt-20 border-t border-primary-200 bg-primary-50/30 backdrop-blur-sm">
		<div class="max-w-6xl mx-auto px-6 py-12 text-center text-primary-800">
			<p class="mb-2 text-sm">Made by <a href="https://hackclub.com" class="text-primary-600 hover:text-primary-700 font-semibold transition-colors">Hack Club</a></p>
			<p class="text-xs text-primary-700">Building the future of maker education</p>
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
