<script lang="ts">
	//setLayers(50); will set the layers to 50 in devtools for debugging
	import { onMount } from 'svelte';

	let layers = $state(0);
	let benchyImageUrl = '/img/benchy.png';
	
	const MAX_LAYERS = 100;
	const PRINT_TIME_HOURS = 3.5;

	let percent = $derived.by(() => Math.round((layers / MAX_LAYERS) * 100));
	let printTime = $derived.by(() => ((layers / MAX_LAYERS) * PRINT_TIME_HOURS).toFixed(1));
	let revealPercent = $derived.by(() => (layers / MAX_LAYERS) * 100);

	function reset() {
		layers = 0;
	}

	function complete() {
		layers = MAX_LAYERS;
	}

	onMount(() => {
		// Load the Benchy image
		const revealElement = document.getElementById('benchyReveal');
		window.setLayers = (val: number) => {
			layers = val;
		};
		if (revealElement) {
			const img = new Image();
			img.onload = function() {
				revealElement.style.backgroundImage = `url('${benchyImageUrl}')`;
				console.log('Image loaded:', benchyImageUrl);
			};
			img.onerror = function() {
				console.error('Image failed to load:', benchyImageUrl);
				revealElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
				revealElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:white;font-weight:bold;">🚢 Benchy Print</div>';
			};
			img.crossOrigin = 'anonymous';
			img.src = benchyImageUrl;
		}
	});
</script>

<div class="benchy-container-wrapper">
	<div class="benchy-header">
		<h2 class="benchy-title">Layer Progress</h2>
	</div>

	<div class="benchy-container">
		<div class="layer-lines"></div>
		<div class="benchy-reveal" id="benchyReveal"></div>
		<div class="benchy-overlay" style="clip-path: inset(0 0 {1 + revealPercent}% 0)"></div>
	</div>

	<div class="stats">
		<div class="stat-card">
			<div class="stat-label">Progress</div>
			<div class="stat-value">{percent}%</div>
			<div class="progress-bar">
				<div class="progress-fill" style="width: {percent}%"></div>
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

	.benchy-subtitle {
		font-size: 14px;
		color: #888;
		margin: 6px 0 0 0;
	}

	.benchy-container {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 6;
		margin: 24px 0;
		background: #f5f5f5;
		border-radius: 12px;
		overflow: hidden;
		border: 2px solid #eee;
	}

	.benchy-reveal {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-size: contain;
		background-repeat: no-repeat;
		background-position: center;
		opacity: 1;
	}

	.benchy-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: white;
		z-index: 10;
		pointer-events: none;
		transition: clip-path 0.3s ease;
	}
/*
	.layer-lines {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		left: 0;
		z-index: 5;
		pointer-events: none;
		background: repeating-linear-gradient(
			0deg,
			rgba(0, 0, 0, 0.03) 0px,
			rgba(0, 0, 0, 0.03) 1px,
			transparent 1px,
			transparent 3px
		);
	}
*/
	.layer-value {
		font-size: 18px;
		font-weight: 700;
		color: #667eea;
		min-width: 50px;
		text-align: right;
	}

	.stat-card {
		width:100%;
		background-color: #FAF6F1;
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
	}

	.stat-value {
		font-size: 24px;
		font-weight: 700;
		color: #667eea;
		margin-bottom: 8px;
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
		border-radius: 2px;
		transition: width 0.3s ease;
	}

	.button-group {
		display: flex;
		gap: 8px;
	}

	@media (max-width: 640px) {
		.benchy-container-wrapper {
			padding: 16px;
		}

		.benchy-title {
			font-size: 20px;
		}

		.stat-card {
			padding: 12px;
		}

		.stat-value {
			font-size: 20px;
		}
	}
</style>
