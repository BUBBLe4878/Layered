<script lang="ts">
	import { onMount } from 'svelte';

	let { data } = $props();

	console.log('[Benchy] raw data:', data);
	console.log('[Benchy] user:', data?.user);

	// ─────────────────────────────────────────
	// Config
	// ─────────────────────────────────────────
	const benchyImageUrl = '/img/benchy.png';

	const MAX_CLAY = 40;
	const PRINT_TIME_HOURS = 3.5;

	// ─────────────────────────────────────────
	// DEBUG: clay extraction
	// ─────────────────────────────────────────
	let clay = $derived(data?.user?.clay ?? 0);

	// ─────────────────────────────────────────
	// Derived UI values (debug wrapped)
	// ─────────────────────────────────────────
	let percent = $derived.by(() => {
		const value = Math.round((clay / MAX_CLAY) * 100);
		console.log('[Benchy] percent:', value);
		return value;
	});

	let revealPercent = $derived.by(() => {
		const value = (clay / MAX_CLAY) * 100;
		console.log('[Benchy] revealPercent:', value);
		return value;
	});

	let printTime = $derived.by(() => {
		const value = ((clay / MAX_CLAY) * PRINT_TIME_HOURS).toFixed(1);
		console.log('[Benchy] printTime:', value);
		return value;
	});

	// ─────────────────────────────────────────
	// Image debug
	// ─────────────────────────────────────────
	onMount(() => {
		console.log('[Benchy] mounted');

		const el = document.getElementById('benchyReveal');

		console.log('[Benchy] DOM element:', el);

		if (!el) {
			console.warn('[Benchy] benchyReveal element missing');
			return;
		}

		const img = new Image();

		img.onload = () => {
			console.log('[Benchy] image loaded');
			el.style.backgroundImage = `url('${benchyImageUrl}')`;
		};

		img.onerror = () => {
			console.error('[Benchy] image failed:', benchyImageUrl);

			el.style.background =
				'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

			el.innerHTML = `
				<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:white;font-weight:bold;">
					🚢 Benchy Print
				</div>
			`;
		};

		img.src = benchyImageUrl;
	});
</script>

<!-- ───────────────────────────────────────── -->
<!-- UI -->
<!-- ───────────────────────────────────────── -->

<div class="benchy-container-wrapper">
	<div class="benchy-header">
		<h2 class="benchy-title">Clay Progress</h2>
	</div>

	<div class="benchy-container">
		<div class="benchy-reveal" id="benchyReveal"></div>

		<div
			class="benchy-overlay"
			style="clip-path: inset(0 0 {revealPercent}% 0)"
		></div>
	</div>

	<div class="stats">
		<div class="stat-card">
			<div class="stat-label">Progress</div>

			<div class="stat-value">{percent}%</div>

			<div class="progress-bar">
				<div class="progress-fill" style="width: {percent}%"></div>
			</div>

			<div class="stat-meta">
				Clay: {clay} / {MAX_CLAY}
			</div>

			<div class="stat-meta">
				Print time: ~{printTime}h
			</div>
		</div>
	</div>
</div>

<style>
	.benchy-container-wrapper {
		background: white;
		border-radius: 12px;
		padding: 24px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.benchy-header {
		margin-bottom: 24px;
		text-align: center;
	}

	.benchy-title {
		font-size: 24px;
		font-weight: 600;
		color: #333;
		margin: 0;
	}

	.benchy-container {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 6;
		margin: 24px 0;
		background: transparent;
		border-radius: 12px;
		overflow: hidden;
		border: 2px solid #eee;
	}

	.benchy-reveal {
		position: absolute;
		inset: 0;
		background-size: contain;
		background-repeat: no-repeat;
		background-position: center;
	}

	.benchy-overlay {
		position: absolute;
		inset: 0;
		background: white;
		pointer-events: none;
		transition: clip-path 0.3s ease;
		z-index: 10;
	}

	.stat-card {
		width: 100%;
		background-color: #faf6f1;
		border-radius: 12px;
		padding: 16px;
		border: 1px solid #e0e7ff;
		text-align: center;
	}

	.stat-label {
		font-size: 12px;
		font-weight: 600;
		margin-bottom: 8px;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		color: #666;
	}

	.stat-value {
		font-size: 24px;
		font-weight: 700;
		color: #667eea;
		margin-bottom: 8px;
	}

	.stat-meta {
		font-size: 12px;
		color: #777;
		margin-top: 6px;
	}

	.progress-bar {
		width: 100%;
		height: 4px;
		background: #ddd;
		border-radius: 2px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
		transition: width 0.3s ease;
	}

	@media (max-width: 640px) {
		.benchy-container-wrapper {
			padding: 16px;
		}

		.benchy-title {
			font-size: 20px;
		}

		.stat-value {
			font-size: 20px;
		}
	}
</style>
