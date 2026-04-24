<script lang="ts">
	import Accordion from '$lib/components/Accordion.svelte';

	// FAQ categories
	const faqCategories = [
		{
			name: 'Getting Started',
			icon: '🚀',
			items: [
				{
					text: 'What is Layered?',
					slug: 'what-is-layered'
				},
				{
					text: "I'm new to CAD—does that matter?",
					slug: 'new-to-cad'
				},
				{
					text: 'What are the requirements to participate?',
					slug: 'requirements'
				}
			]
		},
		{
			name: 'Projects',
			icon: '🎨',
			items: [
				{
					text: 'What can I make?',
					slug: 'what-can-i-make'
				},
				{
					text: 'How many projects can I make?',
					slug: 'how-many-projects'
				},
				{
					text: 'Can I continue an existing project?',
					slug: 'continue-project'
				},
				{
					text: 'Are group projects allowed?',
					slug: 'group-projects'
				},
				{
					text: 'Are remixes allowed?',
					slug: 'remixes'
				},
				{
					text: 'Do I have to build my project?',
					slug: 'build-project'
				},
				{
					text: 'What software is supported?',
					slug: 'software'
				}
			]
		},
		{
			name: 'Rewards',
			icon: '💎',
			items: [
				{
					text: 'How do prizes work?',
					slug: 'prizes'
				},
				{
					text: 'Can I upgrade my printer?',
					slug: 'upgrades'
				},
				{
					text: 'What is experience?',
					slug: 'experience'
				},
				{
					text: 'What is the Underground Market?',
					slug: 'underground'
				},
				{
					text: 'Is there a reward for my first project?',
					slug: 'first-project-reward'
				}
			]
		},
		{
			name: 'Tracking',
			icon: '📊',
			items: [
				{
					text: 'How do I track my time?',
					slug: 'track-time'
				},
				{
					text: "What's the streak system?",
					slug: 'streak'
				},
				{
					text: 'Are there weekly awards?',
					slug: 'weekly-awards'
				}
			]
		},
		{
			name: 'Policies',
			icon: '⚖️',
			items: [
				{
					text: 'What happens if I cheat?',
					slug: 'cheat'
				},
				{
					text: 'What if my project is rejected?',
					slug: 'rejection'
				},
				{
					text: 'When does Layered end?',
					slug: 'end-date'
				},
				{
					text: 'File format not supported on Printables',
					slug: 'file-format'
				},
				{
					text: 'Project file too large',
					slug: 'file-size'
				}
			]
		},
		{
			name: 'About',
			icon: 'ℹ️',
			items: [
				{
					text: 'Who runs this?',
					slug: 'who-runs'
				},
				{
					text: 'Is this free?',
					slug: 'is-free'
				}
			]
		}
	];

	let activeTab = $state(faqCategories[0].name);
	let expandedQuestions = $state<Set<string>>(new Set());

	function toggleQuestion(slug: string) {
		if (expandedQuestions.has(slug)) {
			expandedQuestions.delete(slug);
		} else {
			expandedQuestions.add(slug);
		}
		expandedQuestions = expandedQuestions;
	}

	let activeCategory = $derived(faqCategories.find((cat) => cat.name === activeTab));
</script>

<div class="mt-24 flex flex-col items-center justify-center px-10">
	<div class="w-full max-w-4xl">
		<!-- Header -->
		<div class="mb-8 text-center">
			<h1 class="mb-3 text-3xl font-bold sm:text-4xl">Frequently Asked Questions</h1>
			<p class="text-lg text-gray-400">Everything you need to know about Layered</p>
		</div>

		<!-- Tab Navigation -->
		<div class="mb-8 flex flex-wrap gap-2 border-b border-primary-800">
			{#each faqCategories as category (category.name)}
				<button
					onclick={() => (activeTab = category.name)}
					class="whitespace-nowrap border-b-2 px-4 py-3 font-medium transition-colors {activeTab ===
					category.name
						? 'border-blue-500 text-blue-400'
						: 'border-transparent text-gray-400 hover:text-gray-300'}"
				>
					<span class="mr-2">{category.icon}</span>
					{category.name}
				</button>
			{/each}
		</div>

		<!-- Tab Content -->
		{#if activeCategory}
			<div class="space-y-3">
				{#each activeCategory.items as item (item.slug)}
					<div class="border border-primary-800 rounded-lg overflow-hidden">
						<button
							onclick={() => toggleQuestion(item.slug)}
							class="w-full px-4 py-4 flex items-center justify-between bg-primary-900 hover:bg-primary-800 transition-colors text-left"
						>
							<span class="font-medium text-white">{item.text}</span>
							<span class="text-gray-400">
								{expandedQuestions.has(item.slug) ? '−' : '+'}
							</span>
						</button>

						{#if expandedQuestions.has(item.slug)}
							<div class="px-4 py-4 bg-primary-950 border-t border-primary-800 text-gray-300">
								{#if item.slug === 'what-is-layered'}
									<p>
										Layered is a YSWS where you design CAD projects and earn rewards—up to
										receiving and upgrading your own 3D printer. Start by creating a project at
										layered.hackclub.com.
									</p>
								{:else if item.slug === 'new-to-cad'}
									<p>
										Beginners are welcome! Note that only active work counts toward hours. Time
										spent watching tutorials or researching does not count.
									</p>
								{:else if item.slug === 'requirements'}
									<p>
										You must be between the ages 13-18 and have verified your identity on our
										identity platform.
									</p>
								{:else if item.slug === 'what-can-i-make'}
									<p>
										Projects must have a clear purpose and be primarily 3D-printable. We want to
										see you learning something new on each project.
									</p>
									<p class="mt-3 font-semibold">Allowed:</p>
									<ul class="ml-5 list-disc space-y-1 mt-2">
										<li>Functional toys</li>
										<li>Scale models (cars, planes, tanks)</li>
										<li>Wind-powered devices</li>
									</ul>
									<p class="mt-3 font-semibold">Not allowed:</p>
									<ul class="ml-5 list-disc space-y-1 mt-2">
										<li>Weapons of any kind</li>
										<li>Dummy phones</li>
										<li>Drones</li>
									</ul>
								{:else if item.slug === 'how-many-projects'}
									<p>Unlimited, as long as:</p>
									<ul class="ml-5 list-disc space-y-1 mt-2">
										<li>Each project meets the 2-hour minimum</li>
										<li>Each follows the rules</li>
									</ul>
								{:else if item.slug === 'continue-project'}
									<p>No. Each project must be new.</p>
								{:else if item.slug === 'group-projects'}
									<p>No. All projects must be individual.</p>
								{:else if item.slug === 'remixes'}
									<p>
										No direct remixes. You may create your own version as long as it is not
										copied step-by-step from a tutorial.
									</p>
								{:else if item.slug === 'build-project'}
									<p>Yes. A project must be physically produced to count.</p>
								{:else if item.slug === 'software'}
									<p>The following CAD software is supported:</p>
									<ul class="ml-5 list-disc space-y-1 mt-2">
										<li>Fusion 360</li>
										<li>Onshape</li>
										<li>Shapr3D</li>
										<li>SolidWorks</li>
										<li>FreeCAD</li>
										<li>OpenSCAD</li>
										<li>Blender</li>
										<li>SolveSpace</li>
									</ul>
								{:else if item.slug === 'prizes'}
									<p>
										You earn 1 Layer per hour of logged and approved work. Layers are the primary
										currency and can be used to redeem a 3D printer (starting at 40 Layers).
									</p>
								{:else if item.slug === 'upgrades'}
									<p>Yes! You can upgrade your printer over time using Benchies.</p>
								{:else if item.slug === 'experience'}
									<p>
										Experience rewards higher-effort projects and reduces prices in the PrintShop.
									</p>
								{:else if item.slug === 'underground'}
									<p>
										High-experience users may gain access to a hidden shop with exclusive printer
										upgrades and limited-edition parts.
									</p>
								{:else if item.slug === 'first-project-reward'}
									<p>
										Yes! After you successfully ship your first project, you receive a Layered
										keychain + stickers.
									</p>
								{:else if item.slug === 'track-time'}
									<p>
										Each project includes a journal where you can log your time and describe your
										progress.
									</p>
								{:else if item.slug === 'streak'}
									<p>
										Daily work builds a streak. Longer streaks may provide bonuses or multipliers.
										Missing a day resets your streak.
									</p>
								{:else if item.slug === 'weekly-awards'}
									<p>
										Each week, staff select top projects across categories and the community votes
										on finalists.
									</p>
								{:else if item.slug === 'cheat'}
									<p>
										Fraud results in removal from this and future programs, plus loss of all
										currency and projects.
									</p>
								{:else if item.slug === 'rejection'}
									<p>
										If your project is rejected, you will receive a specific reason for rejection,
										the reviewer's name, and the ability to DM them with questions.
									</p>
								{:else if item.slug === 'end-date'}
									<p>The program ends on April 19th. Submit your project before the deadline.</p>
								{:else if item.slug === 'file-format'}
									<p>Upload files under Model Files and include both .STEP and .STL formats.</p>
								{:else if item.slug === 'file-size'}
									<p>
										Upload to Google Drive (or similar) and provide a link in your submission.
									</p>
								{:else if item.slug === 'who-runs'}
									<p class="space-y-2">
										<span class="block"><strong>@Dr_Fishface</strong> - Founder</span>
										<span class="block"><strong>@StephenFromColorado</strong> - Co-founder</span>
										<span class="block"><strong>@HackerMan</strong> - Logistics</span>
									</p>
								{:else if item.slug === 'is-free'}
									<p>
										Yes! This program is entirely funded by <a
											href="https://hackclub.com"
											class="underline hover:text-blue-400"
										>
											Hack Club
										</a>, a US-based 501(c)(3) charity.
									</p>
								{/if}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
