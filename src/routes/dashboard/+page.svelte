<script lang="ts">
	import '../app.css';
	import Head from '$lib/components/Head.svelte';
	import ChecklistItem from '$lib/components/ChecklistItem.svelte';
	import { BarChart3, BookOpen, Compass, PencilRuler, Store, Moon, Sun, Sparkles, Zap, Target, Flame } from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import BenchyRevealer from './BenchyRevealer.svelte';
	
	let performanceModeEnabled = $state(false);
	let performanceModeReady = $state(false);
	let darkModeEnabled = $state(false);
	let darkModeReady = $state(false);
	let hoveredCard = $state<string | null>(null);

	let projectCount = $derived($page.data?.stats?.projectCount ?? 0);
	let devlogCount = $derived($page.data?.stats?.devlogCount ?? 0);
	let shipCount = $derived($page.data?.stats?.shipCount ?? 0);

	console.log('[Dashboard] page.data:', $page.data);
	console.log('[Dashboard] stats:', $page.data?.stats);

	function persistPerformanceMode() {
		window.localStorage.setItem('enableModelRendering', (!performanceModeEnabled).toString());
		window.dispatchEvent(
			new CustomEvent('enableModelRenderingChanged', {
				detail: { performanceModeEnabled }
			})
		);
	}

	function persistDarkMode() {
		window.localStorage.setItem('darkModeEnabled', darkModeEnabled.toString());
		if (darkModeEnabled) {
			document.body.classList.add('dark-mode');
			document.body.classList.remove('theme-1', 'theme-3', 'theme-4');
			document.body.classList.add('theme-2');
		} else {
			document.body.classList.remove('dark-mode');
			document.body.classList.remove('theme-1', 'theme-2', 'theme-3', 'theme-4');
		}
		window.dispatchEvent(
			new CustomEvent('darkModeChanged', {
				detail: { darkModeEnabled }
			})
		);
	}

	onMount(() => {
		performanceModeEnabled = window.localStorage.getItem('enableModelRendering') === 'false';
		performanceModeReady = true;
		persistPerformanceMode();

		darkModeEnabled = window.localStorage.getItem('darkModeEnabled') === 'true';
		darkModeReady = true;
		persistDarkMode();
	});
</script>

<Head title="Dashboard" />



<div class="dashboard-container">
	<!-- Header -->
	<div class="header">
		<div class="header-content">
			<div class="header-icon">
				<Sparkles size={28} style="color: white;" />
			</div>
			<div>
				<h1>Creative Hub</h1>
				<p class="tagline">Your personal command center for building and creating</p>
			</div>
		</div>
	</div>

	<!-- Stats Grid -->
	<div class="stats-grid">
		<div class="stat-card">
			<div class="stat-accent"></div>
			<p class="stat-label">Projects</p>
			<p class="stat-value">{projectCount}</p>
		</div>
		<div class="stat-card">
			<div class="stat-accent"></div>
			<p class="stat-label">Journal Entries</p>
			<p class="stat-value">{devlogCount}</p>
		</div>
		<div class="stat-card">
			<div class="stat-accent"></div>
			<p class="stat-label">Shipped</p>
			<p class="stat-value">{shipCount}</p>
		</div>
	</div>

	<!-- Main Content -->
	<div class="main-grid">
		<!-- Checklist -->
		<div class="card-primary" class:active={shipCount === 0}>
			<h2 class="card-title">
				<Target size={24} />
				Progress Checklist
			</h2>
			<div class="checklist">
				<div class="checklist-item" class:completed={projectCount > 0}>
					<div class="checklist-checkbox">
						{#if projectCount > 0}
							<span style="color: white; font-weight: bold; font-size: 0.8rem;">✓</span>
						{/if}
					</div>
					<span class="checklist-text">
						<a href={resolve('/dashboard/projects/create')}>Create</a> your first project
					</span>
				</div>
				<div class="checklist-item" class:completed={devlogCount > 0}>
					<div class="checklist-checkbox">
						{#if devlogCount > 0}
							<span style="color: white; font-weight: bold; font-size: 0.8rem;">✓</span>
						{/if}
					</div>
					<span class="checklist-text">Make your first journal entry</span>
				</div>
				<div class="checklist-item" class:completed={shipCount > 0}>
					<div class="checklist-checkbox">
						{#if shipCount > 0}
							<span style="color: white; font-weight: bold; font-size: 0.8rem;">✓</span>
						{/if}
					</div>
					<span class="checklist-text">Ship your project</span>
				</div>
			</div>
		</div>

		<!-- Settings -->
		<div class="settings-card">
			<h2 class="settings-title">Settings</h2>

			<!-- Display Mode -->
			<div class="setting-group">
				<label class="setting-label">Display Mode</label>
				<label class="toggle-switch">
					<input
						type="checkbox"
						bind:checked={darkModeEnabled}
						onchange={() => {
							if (!darkModeReady) return;
							persistDarkMode();
						}}
					/>
					<span class="toggle-checkbox">
						{#if darkModeEnabled}
							<span style="color: white; font-weight: bold;">✓</span>
						{/if}
					</span>
					<span class="toggle-label">
						{#if darkModeEnabled}
							<Moon size={16} />
							<span>Dark Mode</span>
						{:else}
							<Sun size={16} />
							<span>Light Mode</span>
						{/if}
					</span>
				</label>
			</div>

			<!-- Performance -->
			<div class="setting-group">
				<label class="setting-label">Performance</label>
				<p class="setting-description">Disable 3D previews for better performance on slower devices</p>
				<label class="toggle-switch">
					<input
						type="checkbox"
						bind:checked={performanceModeEnabled}
						onchange={() => {
							if (!performanceModeReady) return;
							persistPerformanceMode();
						}}
					/>
					<span class="toggle-checkbox">
						{#if performanceModeEnabled}
							<span style="color: white; font-weight: bold;">✓</span>
						{/if}
					</span>
					<span class="toggle-label">
						<Zap size={16} />
						<span>Optimize</span>
					</span>
				</label>
				<p class="toggle-status">{performanceModeEnabled ? 'Enabled' : 'Disabled'}</p>
			</div>
		</div>
	</div>

	<!-- Streak Section -->
	<div class="streak-badge">
		<div class="streak-content">
			<div class="streak-fire">🔥</div>
			<p class="streak-number">
				{$page.data?.user?.journalStreak ?? 0}
			</p>
			<p class="streak-label">
				Day{($page.data?.user?.journalStreak ?? 0) === 1 ? '' : 's'} Streak
			</p>
			<p class="streak-hint">Keep the momentum going. Create a journal entry every day to maintain your streak.</p>
		</div>
	</div>

	<!-- Navigation Grid -->
	<div class="nav-grid">
		<a href={resolve('/dashboard/projects')} class="nav-card">
			<div class="nav-icon">
				<PencilRuler size={24} />
			</div>
			<div class="nav-content">
				<h3>Projects</h3>
				<p>Build and manage your work</p>
			</div>
		</a>
		<a href={resolve('/dashboard/explore')} class="nav-card">
			<div class="nav-icon">
				<Compass size={24} />
			</div>
			<div class="nav-content">
				<h3>Explore</h3>
				<p>See what others are making</p>
			</div>
		</a>
		<a href={resolve('/dashboard/market')} class="nav-card">
			<div class="nav-icon">
				<Store size={24} />
			</div>
			<div class="nav-content">
				<h3>Printshop</h3>
				<p>Spend layers and unlock upgrades</p>
			</div>
		</a>
		<a href={resolve('/dashboard/tutorial')} class="nav-card">
			<div class="nav-icon">
				<BookOpen size={24} />
			</div>
			<div class="nav-content">
				<h3>Help</h3>
				<p>FAQ, tutorials, and support</p>
			</div>
		</a>
	</div>

	<!-- Benchy Revealer -->
	<div style="margin-top: 2rem;">
		<BenchyRevealer />
	</div>
</div>
