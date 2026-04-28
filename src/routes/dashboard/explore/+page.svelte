<script lang="ts">
	import { onMount } from 'svelte';
	import Head from '$lib/components/Head.svelte';
	import { ChevronDown, Clock3, Heart } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import Spinny3DPreview from '$lib/components/Spinny3DPreview.svelte';

	let { data } = $props();

	type SortType = 'newest' | 'trending' | 'random' | 'liked';

	let devlogs = $state(data.devlogs);
	let hasMore = $state(data.hasMore);
	let nextOffset = $state(data.nextOffset);
	let loadingMore = $state(false);
	let loadError = $state('');
	let sentinel = $state<HTMLDivElement | null>(null);
	let sortBy: SortType = $state('newest');
	let performanceModeEnabled = $state(false);
	let hoveredDevlogId = $state<number | null>(null);
	let leaderboard = $state(data.leaderboard);
	let selectedUser = $state<any>(null);

	const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
	const timeFormatter = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' });

	const rootMargin = '300px 0px';

	// ---------------------------
	// LOAD MORE
	// ---------------------------
	async function loadMore() {
		if (loadingMore || !hasMore) return;
		loadingMore = true;

		try {
			const res = await fetch(
				`/dashboard/explore?offset=${nextOffset}&sort=${sortBy}`
			);

			const json = await res.json();

			devlogs = [...devlogs, ...json.devlogs];
			nextOffset = json.nextOffset;
			hasMore = json.hasMore;
		} finally {
			loadingMore = false;
		}
	}

	// ---------------------------
	// SORT CHANGE
	// ---------------------------
	async function changeSort(sort: SortType) {
		sortBy = sort;
	
		devlogs = [];
		nextOffset = 0;
		hasMore = true;
	
		const res = await fetch(`/dashboard/explore?offset=0&sort=${sort}`);
		const json = await res.json();
	
		devlogs = json.devlogs;
		nextOffset = json.nextOffset;
		hasMore = json.hasMore;
	}

	function parseDate(value: Date | string) {
		return value instanceof Date ? value : new Date(value);
	}

	function getHoverModelState(devlogId: number, modelUrl?: string | null) {
		return !performanceModeEnabled && hoveredDevlogId === devlogId && Boolean(modelUrl);
	}

	// ---------------------------
	// INFINITE SCROLL
	// ---------------------------
	onMount(() => {
		performanceModeEnabled = window.localStorage.getItem('enableModelRendering') === 'false';

		const onStorage = (event: StorageEvent) => {
			if (event.key === 'enableModelRendering') {
				performanceModeEnabled = window.localStorage.getItem('enableModelRendering') === 'false';
			}
		};

		window.addEventListener('storage', onStorage);

		const onPerformanceModeChange = () => {
			performanceModeEnabled = window.localStorage.getItem('enableModelRendering') === 'false';
		};

		window.addEventListener('enableModelRenderingChanged', onPerformanceModeChange);

		if (!sentinel) {
			return () => {
				window.removeEventListener('storage', onStorage);
				window.removeEventListener('enableModelRenderingChanged', onPerformanceModeChange);
			};
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) loadMore();
			},
			{ rootMargin }
		);

		observer.observe(sentinel);
		return () => {
			observer.disconnect();
			window.removeEventListener('storage', onStorage);
			window.removeEventListener('enableModelRenderingChanged', onPerformanceModeChange);
		};
	});
</script>

<Head title="Explore" />

<div class="flex flex-col gap-5">

	<!-- HEADER -->
	<div class="flex justify-between items-center">
		<h1 class="text-3xl font-medium">Explore</h1>

		<div class="relative w-44">
				<select
					bind:value={sortBy}
					onchange={(e) => changeSort(e.currentTarget.value as SortType)}
					class="themed-input w-full appearance-none pr-9 text-sm font-medium"
				>
					<option value="newest">Newest</option>
					<option value="trending">Trending</option>
					<option value="random">Random</option>
					<option value="liked">Liked</option>
				</select>
			<div class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-600">
				<ChevronDown size={16} />
			</div>
		</div>
	</div>

	<!-- LEADERBOARD -->
	<div class="leaderboard-container">
		<div class="leaderboard">
			{#each leaderboard as user, i}
				<button
					onclick={() => selectedUser = user}
					class="leaderboard-item"
				>
					<div class="rank">#{i + 1}</div>
					<div class="user-info">
						<div class="name">{user.name}</div>
						<div class="score-preview">{user.score.toFixed(2)} pts</div>
					</div>
					<div class="medal">
						{#if i === 0}
							🥇
						{:else if i === 1}
							🥈
						{:else if i === 2}
							🥉
						{/if}
					</div>
				</button>
			{/each}
		</div>
	</div>

	{#if selectedUser}
		<div class="modal-overlay" onclick={(e) => e.target === e.currentTarget && (selectedUser = null)}>
			<div class="modal-content">
				<button class="close-btn" onclick={() => selectedUser = null}>✕</button>
				
				<div class="modal-header">
					<h2>{selectedUser.name}</h2>
					<div class="total-score">{selectedUser.score.toFixed(2)}</div>
				</div>

				<div class="stats-grid">
					<div class="stat-card">
						<div class="stat-label">3D Modeling Time</div>
						<div class="stat-value">{selectedUser.totalHours}h</div>
						<div class="stat-breakdown">
							<div class="breakdown-bar">
								<div class="breakdown-fill" style="width: {selectedUser.score > 0 ? (selectedUser.totalHours * 0.3 / selectedUser.score) * 100 : 0}%"></div>
							</div>
							<div class="breakdown-text">{(selectedUser.totalHours * 0.3).toFixed(2)} pts (30%)</div>
						</div>
					</div>

					<div class="stat-card">
						<div class="stat-label">Devlogs Created</div>
						<div class="stat-value">{selectedUser.totalLogs}</div>
						<div class="stat-breakdown">
							<div class="breakdown-bar">
								<div class="breakdown-fill" style="width: {selectedUser.score > 0 ? (selectedUser.totalLogs * 0.3 / selectedUser.score) * 100 : 0}%"></div>
							</div>
							<div class="breakdown-text">{(selectedUser.totalLogs * 0.3).toFixed(2)} pts (30%)</div>
						</div>
					</div>

					<div class="stat-card">
						<div class="stat-label">Likes Received</div>
						<div class="stat-value">{selectedUser.totalLikes}</div>
						<div class="stat-breakdown">
							<div class="breakdown-bar">
								<div class="breakdown-fill" style="width: {selectedUser.score > 0 ? (selectedUser.totalLikes * 0.2 / selectedUser.score) * 100 : 0}%"></div>
							</div>
							<div class="breakdown-text">{(selectedUser.totalLikes * 0.2).toFixed(2)} pts (20%)</div>
						</div>
					</div>

					<div class="stat-card">
						<div class="stat-label">Layers Earned</div>
						<div class="stat-value">{selectedUser.totalClay}</div>
						<div class="stat-breakdown">
							<div class="breakdown-bar">
								<div class="breakdown-fill" style="width: {selectedUser.score > 0 ? (selectedUser.totalClay * 0.2 / selectedUser.score) * 100 : 0}%"></div>
							</div>
							<div class="breakdown-text">{(selectedUser.totalClay * 0.2).toFixed(2)} pts (20%)</div>
						</div>
					</div>
				</div>

				<div class="bonus-stat">
					<span>Projects Created:</span>
					<span class="value">{selectedUser.totalProjects}</span>
				</div>
			</div>
		</div>
	{/if}

	<!-- GRID -->
	<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">

		{#each devlogs as devlog (devlog.devlog.id)}
			{@const updatedAt = parseDate(devlog.devlog.createdAt)}
			<div
				class="themed-box-solid group relative overflow-hidden border border-primary-200 bg-white/80 p-0"
				onmouseenter={() => {
					if (!performanceModeEnabled) {
						hoveredDevlogId = devlog.devlog.id;
					}
				}}
				onmouseleave={() => {
					if (hoveredDevlogId === devlog.devlog.id) {
						hoveredDevlogId = null;
					}
				}}
			>
				<!-- IMAGE LINK -->
				<div class="relative aspect-square w-full overflow-hidden">
					<a
						href={`/dashboard/projects/${devlog.project.id}#devlog-${devlog.devlog.id}`}
						class="block h-full"
					>
						<img
							src={devlog.devlog.image}
							class={`h-full w-full object-cover transition-opacity duration-200 ${getHoverModelState(devlog.devlog.id, devlog.devlog.model) ? 'opacity-0' : 'opacity-100'}`}
						/>
						{#if getHoverModelState(devlog.devlog.id, devlog.devlog.model)}
							<div class="pointer-events-none absolute inset-0 bg-white/80">
								<Spinny3DPreview
									identifier={`explore-hover-${devlog.devlog.id}`}
									modelUrl={devlog.devlog.model}
									sizeCutoff={7.5 * 1024 * 1024}
								/>
							</div>
						{/if}
					</a>

					<!-- LIKE BUTTON -->
					<div class="absolute bottom-2 left-2 z-10">
						<form
							method="POST"
							action="?/toggleLike"
							use:enhance={() => {
								return async ({ result }) => {
									if (result?.data?.success) {
										location.reload();
									}
								};
							}}
						>
							<input type="hidden" name="devlogId" value={devlog.devlog.id} />

							<button
								type="submit"
								class={`cursor-pointer flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold transition-all ${
									devlog.userLiked
										? 'bg-red-500 text-white'
										: 'bg-white/80 text-gray-700 hover:bg-white'
								}`}
							>
								<Heart
									size={14}
									class={`transition-all ${devlog.userLiked ? 'fill-current' : ''}`}
								/>
								<span>{devlog.likeCount}</span>
							</button>
						</form>
					</div>
					</div>

				<a
					href={`/dashboard/projects/${devlog.project.id}#devlog-${devlog.devlog.id}`}
					class="block"
				>
					<div class="flex flex-col gap-1.5 p-3">
						<p class="truncate text-base font-semibold text-primary-900">{devlog.project.name}</p>
						<p class="text-xs leading-relaxed text-gray-700">
							{devlog.devlog.description || 'No update notes yet.'}
						</p>
						<div class="flex items-center gap-3 text-[11px] text-gray-600">
							<span>
								<Clock3 size={12} class="mr-1 inline" />
								{dateFormatter.format(updatedAt)} at {timeFormatter.format(updatedAt)}
							</span>
						</div>
					</div>
				</a>

			</div>
		{/each}

	</div>

	<!-- SENTINEL -->
	<div bind:this={sentinel} class="h-10"></div>

</div>

<style>
	.leaderboard-container {
		max-height: 400px;
		overflow-y: auto;
		border-radius: 12px;
		background: linear-gradient(135deg, #f5f7fa 0%, #f0f4f8 100%);
		padding: 8px;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
	}

	.leaderboard {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.leaderboard-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		background: white;
		border: 2px solid transparent;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		font-family: inherit;
		text-align: left;
		width: 100%;
	}

	.leaderboard-item:hover {
		border-color: #3b82f6;
		box-shadow: 0 8px 16px rgba(59, 130, 246, 0.15);
		transform: translateX(4px);
	}

	.rank {
		font-weight: 700;
		font-size: 14px;
		color: #1f2937;
		min-width: 40px;
	}

	.user-info {
		flex: 1;
		margin-left: 12px;
	}

	.name {
		font-weight: 600;
		font-size: 14px;
		color: #111827;
	}

	.score-preview {
		font-size: 12px;
		color: #6b7280;
		margin-top: 2px;
	}

	.medal {
		font-size: 20px;
		min-width: 30px;
		text-align: right;
	}

	/* MODAL STYLES */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fadeIn 0.3s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	.modal-content {
		background: white;
		border-radius: 16px;
		padding: 32px;
		max-width: 500px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
		position: relative;
		box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2);
		animation: slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	@keyframes slideUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	.close-btn {
		position: absolute;
		top: 16px;
		right: 16px;
		background: #f3f4f6;
		border: none;
		width: 36px;
		height: 36px;
		border-radius: 8px;
		cursor: pointer;
		font-size: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s ease;
	}

	.close-btn:hover {
		background: #e5e7eb;
		transform: scale(1.1);
	}

	.modal-header {
		text-align: center;
		margin-bottom: 32px;
	}

	.modal-header h2 {
		font-size: 28px;
		font-weight: 700;
		color: #111827;
		margin: 0 0 8px 0;
	}

	.total-score {
		font-size: 36px;
		font-weight: 800;
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 16px;
		margin-bottom: 24px;
	}

	.stat-card {
		background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
		border: 1px solid #e2e8f0;
		border-radius: 12px;
		padding: 16px;
	}

	.stat-label {
		font-size: 12px;
		font-weight: 600;
		color: #64748b;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 6px;
	}

	.stat-value {
		font-size: 24px;
		font-weight: 700;
		color: #1e293b;
		margin-bottom: 12px;
	}

	.stat-breakdown {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.breakdown-bar {
		height: 8px;
		background: #e2e8f0;
		border-radius: 4px;
		overflow: hidden;
	}

	.breakdown-fill {
		height: 100%;
		background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%);
		border-radius: 4px;
		transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.breakdown-text {
		font-size: 12px;
		color: #475569;
		font-weight: 500;
	}

	.bonus-stat {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px;
		background: #f0fdf4;
		border: 1px solid #dcfce7;
		border-radius: 8px;
		font-weight: 500;
		color: #166534;
	}

	.bonus-stat .value {
		font-weight: 700;
		font-size: 18px;
	}

	@media (max-width: 640px) {
		.modal-content {
			padding: 24px;
			width: 95%;
		}

		.modal-header h2 {
			font-size: 24px;
		}

		.total-score {
			font-size: 28px;
		}

		.leaderboard-item {
			padding: 10px 12px;
		}

		.name {
			font-size: 13px;
		}

		.score-preview {
			font-size: 11px;
		}
	}
</style>
