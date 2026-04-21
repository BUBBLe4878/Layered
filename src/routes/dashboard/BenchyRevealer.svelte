<script lang="ts">
	import { onMount } from 'svelte';

	let layers = $state(0);
	let benchyImageUrl = '/img/catfoot.png';
	
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
		const img = new Image();
		img.onload = function() {
			const canvas = document.createElement('canvas');
			canvas.width = img.width;
			canvas.height = img.height;
			const ctx = canvas.getContext('2d');
			ctx?.drawImage(img, 0, 0);
			
			const imageData = canvas.toDataURL();
			const revealElement = document.getElementById('benchyReveal');
			if (revealElement) {
				revealElement.style.backgroundImage = `url('${imageData}')`;
			}
		};
		img.onerror = function() {
			const revealElement = document.getElementById('benchyReveal');
			if (revealElement) {
				revealElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
				revealElement.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;width:100%;height:100%;color:white;font-weight:bold;">🚢 Benchy Print</div>';
			}
		};
		img.crossOrigin = 'anonymous';
		img.src = benchyImageUrl;
	});
</script>

<div class="benchy-container-wrapper">
	<h1>Your Progress</h1>
	<div class="benchy-container">
		<div class="layer-lines"></div>
		<div class="benchy-reveal" id="benchyReveal"></div>
		<div class="benchy-overlay" style="clip-path: inset(0 0 {100 - revealPercent}% 0)"></div>
	</div>

	<div class="controls">
		<div class="slider-group">
			<span class="slider-label">Layers</span>
			<input 
				type="range" 
				min="0" 
				max={MAX_LAYERS} 
				bind:value={layers} 
				step="1"
				class="benchy-slider"
			/>
			<span class="layer-value">{layers}</span>
		</div>
	</div>

	<div class="stats">
		<div class="stat-card">
			<div class="stat-label">Progress</div>
			<div class="stat-value">{percent}%</div>
			<div class="progress-bar">
				<div class="progress-fill" style="width: {percent}%"></div>
			</div>
		</div>
		<div class="stat-card">
			<div class="stat-label">Print Time</div>
			<div class="stat-value">{printTime}h</div>
		</div>
	</div>

	<div class="button-group">
		<button class="reset-btn" onclick={reset}>Reset</button>
		<button class="complete-btn" onclick={complete}>Complete Print</button>
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
		aspect-ratio: 4 / 3;
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
		opacity: 0.3;
	}

	.benchy-overlay {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: linear-gradient(180deg, rgba(200, 200, 200, 0.8) 0%, rgba(200, 200, 200, 0.8) 100%);
		z-index: 10;
		pointer-events: none;
		transition: clip-path 0.3s ease;
	}

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
			transparent 4px
		);
	}

	.controls {
		margin: 24px 0;
	}

	.slider-group {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;
	}

	.slider-label {
		font-size: 14px;
		color: #555;
		font-weight: 600;
		min-width: 60px;
	}

	.benchy-slider {
		flex: 1;
		height: 6px;
		-webkit-appearance: none;
		appearance: none;
		background: #ddd;
		border-radius: 5px;
		outline: none;
		cursor: pointer;
	}

	.benchy-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		cursor: pointer;
		box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
		transition: transform 0.2s;
	}

	.benchy-slider::-webkit-slider-thumb:active {
		transform: scale(1.2);
	}

	.benchy-slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		cursor: pointer;
		border: none;
		box-shadow: 0 2px 8px rgba(102, 126, 234, 0.4);
		transition: transform 0.2s;
	}

	.layer-value {
		font-size: 18px;
		font-weight: 700;
		color: #667eea;
		min-width: 50px;
		text-align: right;
	}

	.stats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin-bottom: 16px;
	}

	.stat-card {
		background: linear-gradient(135deg, #f5f7ff 0%, #f0f4ff 100%);
		border-radius: 12px;
		padding: 16px;
		border: 1px solid #e0e7ff;
		text-align: center;
	}

	.stat-label {
		font-size: 12px;
		color: #888;
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

	button {
		flex: 1;
		padding: 12px;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.reset-btn {
		background: #f0f0f0;
		color: #333;
	}

	.reset-btn:hover {
		background: #e0e0e0;
	}

	.complete-btn {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.complete-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3);
	}

	.complete-btn:active {
		transform: translateY(0);
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
