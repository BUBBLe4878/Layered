<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Head from '$lib/components/Head.svelte';
	import Footer from './Footer.svelte';

	import logo from '$lib/assets/logo-nobg.png';

	let { data } = $props();
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
			<div class="space-y-12">
				<!-- Big Prize Announcement -->
				<div class="text-center space-y-6">
					<div class="inline-block px-4 py-2 rounded-lg bg-primary-100/60 border border-primary-300/40">
						<span class="text-xs font-bold text-primary-900 tracking-widest">🏆 40 HOURS OF CAD = FREE 3D PRINTER</span>
					</div>
					
					<h1 class="text-6xl md:text-7xl font-bold text-primary-950 leading-tight">
						Design CAD.<br />Get a 3D Printer.
					</h1>
					
					<p class="text-xl text-primary-800 leading-relaxed max-w-2xl mx-auto">
						Upload your CAD designs, get them 3D printed, and earn rewards. Hit 40 hours of tracked work and receive a <strong>FREE professional 3D printer</strong>.
					</p>

					<div class="flex flex-col sm:flex-row gap-4 justify-center pt-4">
						{#if data.loggedIn}
							<button class="button md primary">Start Designing →</button>
						{:else}
							<button class="button md primary">Sign in with Hack Club →</button>
						{/if}
						<button class="button md" style="background-color: transparent; border: 2px solid var(--color-primary-300); color: var(--font-color);">
							See the Printer
						</button>
					</div>
				</div>

				<!-- 3D Printer Hero Illustration -->
				<div class="themed-box-solid border-primary-300 p-8">
					<svg viewBox="0 0 680 380" class="w-full" xmlns="http://www.w3.org/2000/svg" role="img">
						<title>Formlabs Form 3 3D Printer</title>
						<desc>A sleek professional 3D printer with a white frame, showing the build platform, resin cartridge, and cooling fans</desc>
						
						<!-- Base -->
						<rect x="120" y="320" width="440" height="40" fill="var(--color-primary-600)" rx="4"/>
						<rect x="130" y="310" width="420" height="15" fill="var(--color-primary-500)" rx="2"/>
						
						<!-- Main body -->
						<rect x="140" y="140" width="400" height="170" fill="var(--color-primary-100)" stroke="var(--color-primary-400)" stroke-width="2" rx="6"/>
						
						<!-- Door frame -->
						<rect x="150" y="155" width="260" height="140" fill="var(--color-primary-50)" stroke="var(--color-primary-500)" stroke-width="2" rx="4"/>
						
						<!-- Build platform inside -->
						<rect x="165" y="170" width="230" height="100" fill="var(--color-primary-200)" stroke="var(--color-primary-600)" stroke-width="1.5" rx="2"/>
						
						<!-- Grid pattern on platform -->
						<line x1="190" y1="170" x2="190" y2="270" stroke="var(--color-primary-400)" stroke-width="0.5" opacity="0.5"/>
						<line x1="215" y1="170" x2="215" y2="270" stroke="var(--color-primary-400)" stroke-width="0.5" opacity="0.5"/>
						<line x1="240" y1="170" x2="240" y2="270" stroke="var(--color-primary-400)" stroke-width="0.5" opacity="0.5"/>
						<line x1="265" y1="170" x2="265" y2="270" stroke="var(--color-primary-400)" stroke-width="0.5" opacity="0.5"/>
						<line x1="290" y1="170" x2="290" y2="270" stroke="var(--color-primary-400)" stroke-width="0.5" opacity="0.5"/>
						<line x1="315" y1="170" x2="315" y2="270" stroke="var(--color-primary-400)" stroke-width="0.5" opacity="0.5"/>
						
						<!-- Resin cartridge (right side) -->
						<rect x="420" y="160" width="90" height="70" fill="var(--color-primary-300)" stroke="var(--color-primary-600)" stroke-width="2" rx="4"/>
						<text x="465" y="200" class="t" text-anchor="middle" fill="var(--color-primary-950)">RESIN</text>
						
						<!-- Top assembly -->
						<path d="M 200 140 L 220 100 L 240 110 L 220 140 Z" fill="var(--color-primary-400)" stroke="var(--color-primary-600)" stroke-width="1.5"/>
						<path d="M 260 140 L 280 100 L 300 110 L 280 140 Z" fill="var(--color-primary-400)" stroke="var(--color-primary-600)" stroke-width="1.5"/>
						<path d="M 320 140 L 340 100 L 360 110 L 340 140 Z" fill="var(--color-primary-400)" stroke="var(--color-primary-600)" stroke-width="1.5"/>
						<path d="M 380 140 L 400 100 L 420 110 L 400 140 Z" fill="var(--color-primary-400)" stroke="var(--color-primary-600)" stroke-width="1.5"/>
						
						<!-- Laser indicator -->
						<circle cx="280" cy="85" r="6" fill="var(--color-primary-700)"/>
						<circle cx="280" cy="85" r="3" fill="var(--color-primary-500)"/>
						
						<!-- Control panel (right side) -->
						<rect x="420" y="250" width="90" height="50" fill="var(--color-primary-200)" stroke="var(--color-primary-500)" stroke-width="1.5" rx="3"/>
						<circle cx="435" cy="265" r="5" fill="var(--color-primary-600)"/>
						<circle cx="450" cy="265" r="5" fill="var(--color-primary-600)"/>
						<circle cx="465" cy="265" r="5" fill="var(--color-primary-600)"/>
						<circle cx="435" cy="285" r="5" fill="var(--color-primary-600)"/>
						<circle cx="450" cy="285" r="5" fill="var(--color-primary-600)"/>
						<circle cx="465" cy="285" r="5" fill="var(--color-primary-600)"/>
						
						<!-- Cooling fans (left) -->
						<circle cx="145" cy="210" r="18" fill="none" stroke="var(--color-primary-500)" stroke-width="1.5"/>
						<line x1="145" y1="192" x2="145" y2="228" stroke="var(--color-primary-500)" stroke-width="0.5" opacity="0.6"/>
						<line x1="127" y1="210" x2="163" y2="210" stroke="var(--color-primary-500)" stroke-width="0.5" opacity="0.6"/>
						
						<!-- Power indicator light -->
						<circle cx="150" cy="310" r="4" fill="var(--color-primary-500)"/>
						<circle cx="150" cy="310" r="2" fill="var(--color-primary-700)"/>
						
						<!-- Label -->
						<text x="340" y="360" class="th" text-anchor="middle" fill="var(--color-primary-950)" font-size="16">Professional 3D Printer</text>
					</svg>
				</div>
			</div>
		</section>

		<!-- The Path to Free Printer -->
		<section class="mb-32">
			<div class="space-y-12">
				<div>
					<h2 class="text-4xl font-bold text-primary-950 mb-2">The 40-Hour Journey</h2>
					<p class="text-primary-700">Here's how to unlock your free printer</p>
				</div>

				<!-- Progress milestones -->
				<div class="grid md:grid-cols-4 gap-4">
					{#each [
						{ hours: '10', reward: 'GitHub Badge', desc: 'Prove your skills' },
						{ hours: '20', reward: 'Custom Stickers', desc: 'Show your work' },
						{ hours: '30', reward: 'Reserved Spot', desc: 'Priority printing' },
						{ hours: '40+', reward: '🏆 FREE PRINTER', desc: 'The ultimate prize', highlight: true }
					] as milestone}
						<div class={`themed-box-solid text-center py-6 transition-all ${milestone.highlight ? 'ring-2 ring-primary-600 shadow-lg' : ''}`}>
							<div class="text-sm font-bold text-primary-600 mb-2">{milestone.hours} HRS</div>
							<h3 class="text-lg font-bold text-primary-950 mb-2">{milestone.reward}</h3>
							<p class="text-xs text-primary-700">{milestone.desc}</p>
						</div>
					{/each}
				</div>

				<!-- Visual progress bar -->
				<div class="themed-box-solid space-y-4">
					<div class="flex justify-between items-center">
						<span class="font-bold text-primary-950">Your Progress</span>
						<span class="text-2xl font-bold text-primary-600">{hoursTracked}/40 HRS</span>
					</div>
					<div class="w-full bg-primary-100 rounded-full h-6 overflow-hidden border border-primary-300">
						<div 
							class="bg-gradient-to-r from-primary-600 to-primary-500 h-full rounded-full transition-all duration-500"
							style="width: {Math.min(100, (hoursTracked / 40) * 100)}%"
						/>
					</div>
					<p class="text-sm text-primary-700">
						{#if hoursTracked === 0}
							Start uploading CAD designs to begin tracking hours
						{:else if hoursTracked < 40}
							{40 - hoursTracked} hours until you get your free 3D printer!
						{:else}
							🎉 Congratulations! You've earned your free printer!
						{/if}
					</p>
				</div>
			</div>
		</section>

		<!-- What You'll Design -->
		<section class="mb-32">
			<div class="space-y-8">
				<div>
					<h2 class="text-4xl font-bold text-primary-950 mb-2">Design Anything</h2>
					<p class="text-primary-700">CAD tools, complete creative freedom</p>
				</div>

				<div class="grid md:grid-cols-3 gap-6">
					{#each [
						{ title: 'Fusion 360', icon: '🛠️', desc: 'Parametric CAD with powerful modeling' },
						{ title: 'Blender', icon: '🎨', desc: 'Free 3D modeling and sculpting' },
						{ title: 'FreeCAD', icon: '📐', desc: 'Open-source precision engineering' }
					] as tool}
						<div class="themed-box-solid space-y-3">
							<div class="text-4xl">{tool.icon}</div>
							<h3 class="font-bold text-primary-950">{tool.title}</h3>
							<p class="text-sm text-primary-800">{tool.desc}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Design to Print Pipeline -->
		<section class="mb-32">
			<div class="space-y-8">
				<div>
					<h2 class="text-4xl font-bold text-primary-950 mb-2">From CAD to Real</h2>
					<p class="text-primary-700">The complete workflow</p>
				</div>

				<div class="space-y-4">
					{#each [
						{ num: '1', title: 'Design in CAD', desc: 'Create your model in any CAD tool. No restrictions.', time: '1-2 weeks' },
						{ num: '2', title: 'Export & Prepare', desc: 'Export as STL/STEP. Check dimensions and wall thickness.', time: '1 day' },
						{ num: '3', title: 'Upload to Layered', desc: 'Submit your files and claim the project. Set your goal.', time: '5 mins' },
						{ num: '4', title: 'Community Review', desc: 'Other makers validate your design. Get constructive feedback.', time: '3-5 days' },
						{ num: '5', title: '3D Print', desc: 'Approved? We print your design on professional equipment.', time: '1-2 weeks' },
						{ num: '6', title: 'Ship & Celebrate', desc: 'Receive your printed model. Track hours toward the printer.', time: '1 week' }
					] as step}
						<div class="themed-box-solid flex gap-6 items-start hover:shadow-lg transition-shadow">
							<div class="flex-shrink-0 w-14 h-14 rounded-lg bg-primary-100 border-2 border-primary-300 flex items-center justify-center">
								<span class="text-xl font-bold text-primary-700">{step.num}</span>
							</div>
							<div class="flex-1 py-1">
								<div class="flex items-baseline gap-3 mb-2">
									<h3 class="text-lg font-bold text-primary-950">{step.title}</h3>
									<span class="text-xs text-primary-600 bg-primary-100 px-2 py-1 rounded">{step.time}</span>
								</div>
								<p class="text-primary-800">{step.desc}</p>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Technical Specs for Designs -->
		<section class="mb-32">
			<div class="themed-box-solid border-primary-300 space-y-8">
				<div>
					<h2 class="text-3xl font-bold text-primary-950 mb-2">Technical Requirements</h2>
					<p class="text-primary-700 text-sm">Everything you need to know about submitting designs</p>
				</div>

				<div class="grid md:grid-cols-2 gap-8">
					<div class="space-y-4">
						<div>
							<h3 class="font-bold text-primary-900 mb-3 flex items-center gap-2 text-lg">
								📦 File Formats
							</h3>
							<ul class="text-sm text-primary-800 space-y-2 pl-7">
								<li>• STL (Stereolithography) — standard</li>
								<li>• STEP (3D Assembly) — preferred</li>
								<li>• IGES, OBJ, FBX, 3DS</li>
								<li>• Native Fusion 360 & Blender files</li>
							</ul>
						</div>
						<div>
							<h3 class="font-bold text-primary-900 mb-3 flex items-center gap-2 text-lg">
								📏 Dimensions & Limits
							</h3>
							<ul class="text-sm text-primary-800 space-y-2 pl-7">
								<li>• Max build volume: 300×300×300 mm</li>
								<li>• Min wall thickness: 0.8 mm</li>
								<li>• Min feature size: 0.5 mm</li>
								<li>• File size: ≤ 50 MB</li>
							</ul>
						</div>
					</div>

					<div class="space-y-4">
						<div>
							<h3 class="font-bold text-primary-900 mb-3 flex items-center gap-2 text-lg">
								⚙️ Printing Materials
							</h3>
							<ul class="text-sm text-primary-800 space-y-2 pl-7">
								<li>• PLA (biodegradable, colors)</li>
								<li>• ABS (durable, heat-resistant)</li>
								<li>• PETG (strong, flexible)</li>
								<li>• Resin (high precision)</li>
							</ul>
						</div>
						<div>
							<h3 class="font-bold text-primary-900 mb-3 flex items-center gap-2 text-lg">
								✓ Quality Standards
							</h3>
							<ul class="text-sm text-primary-800 space-y-2 pl-7">
								<li>• Structural integrity checks</li>
								<li>• Printability validation</li>
								<li>• Design originality review</li>
								<li>• Peer feedback & iteration</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Why Makers Love Layered -->
		<section class="mb-32">
			<div class="space-y-8">
				<div>
					<h2 class="text-4xl font-bold text-primary-950 mb-2">Why Makers Love Layered</h2>
				</div>

				<div class="grid md:grid-cols-3 gap-6">
					{#each [
						{ icon: '🔓', title: 'No Limits', desc: 'Use any CAD software. Design anything within technical specs.' },
						{ icon: '👥', title: 'Community', desc: 'Get real feedback from makers with CAD & printing experience.' },
						{ icon: '🎁', title: 'Real Rewards', desc: 'Unlock badges, stickers, and earn a FREE professional printer.' },
						{ icon: '📊', title: 'Track Progress', desc: 'Watch your hours accumulate. See your progress in real time.' },
						{ icon: '🚀', title: 'Get Printed', desc: 'Your designs become physical objects you can hold & showcase.' },
						{ icon: '💰', title: 'Zero Cost', desc: 'The entire platform is free. Keep what you earn.' }
					] as feature}
						<div class="themed-box-solid text-center space-y-3">
							<div class="text-4xl">{feature.icon}</div>
							<h3 class="font-bold text-primary-950">{feature.title}</h3>
							<p class="text-sm text-primary-800">{feature.desc}</p>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Final CTA -->
		<section class="themed-box-solid border-primary-300 text-center space-y-6 py-12">
			<div>
				<h2 class="text-4xl font-bold text-primary-950 mb-4">Ready to Start?</h2>
				<p class="text-lg text-primary-800 max-w-2xl mx-auto">
					40 hours of CAD work. One free professional 3D printer. Join thousands of makers designing the future.
				</p>
			</div>

			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				{#if data.loggedIn}
					<button class="button md primary">Go to Dashboard →</button>
				{:else}
					<button class="button md primary">Sign in with Hack Club →</button>
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
