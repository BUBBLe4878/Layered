<script lang="ts">
	import { onMount } from 'svelte';
	import Head from '$lib/components/Head.svelte';
	import { ChevronDown, Clock3, Heart, Trophy, Zap } from '@lucide/svelte';
	import { enhance } from '$app/forms';
	import Spinny3DPreview from '$lib/components/Spinny3DPreview.svelte';

	let { data } = $props();

	type SortType = 'newest' | 'trending' | 'random' | 'liked';

	let devlogs = $state(data.devlogs);
	let contests = $state(data.contests || []);
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
	let contestsContainer: HTMLDivElement | null = null;

	const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
	const timeFormatter = new Intl.DateTimeFormat(undefined, { timeStyle: 'short' });

	const rootMargin = '300px 0px';

	// ---------------------------
	// Contests
	// ---------------------------
	function scrollContests(direction: 'left' | 'right') {
		if (!contestsContainer) return;
	
		const scrollAmount = 320; // ~1 card width + gap
	
		contestsContainer.scrollBy({
			left: direction === 'right' ? scrollAmount : -scrollAmount,
			behavior: 'smooth'
		});
	}

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

	function getContestStatus(contest: any) {
		if (!contest.isActive) {
			return 'ended';
		}
		if (contest.daysRemaining <= 3) {
			return 'ending-soon';
		}
		return 'active';
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

<div class="flex flex-col gap-8">

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

	<!-- DESIGN CONTESTS SECTION -->
	<div class="contests-section">
		<div class="contests-header">
			<div class="flex justify-between items-center">
				<div class="contests-title-group">
					<Trophy size={28} class="text-amber-500" />
					<h2>Design Contests</h2>
				</div>
		
				<div class="flex gap-2">
					<button onclick={() => scrollContests('left')} class="arrow-btn">
						←
					</button>
					<button onclick={() => scrollContests('right')} class="arrow-btn">
						→
					</button>
				</div>
			</div>
		
			<p class="contests-subtitle">Show your skills and win exciting prizes</p>
		</div>

		{#if contests.length > 0}
			<div class="contests-grid" bind:this={contestsContainer}>
				{#each contests as c (c.id)}
					{@const deadline = parseDate(c.deadline)}
					{@const status = getContestStatus(c)}
					<div class="contest-card">
						<!-- Featured Image -->
						<div class="contest-image-wrapper">
							<img src={c.image} alt={c.title} class="contest-image" />
							
							<!-- Status Badge -->
							<div class="contest-badge" class:badge-active={status === 'active'} class:badge-ending={status === 'ending-soon'} class:badge-ended={status === 'ended'}>
								{#if status === 'active'}
									<Zap size={14} class="badge-icon" />
									Active
								{:else if status === 'ending-soon'}
									<Clock3 size={14} class="badge-icon" />
									Ending Soon
								{:else}
									Ended
								{/if}
							</div>

							<!-- Days Remaining -->
							{#if c.isActive}
								<div class="days-remaining">
									<div class="days-number">{c.daysRemaining}</div>
									<div class="days-label">days left</div>
								</div>
							{/if}
						</div>

						<!-- Content -->
						<div class="contest-content">
							<h3 class="contest-title">{c.title}</h3>
							<p class="contest-description">{c.description}</p>

							<div class="contest-meta">
								<div class="meta-item">
									<Trophy size={16} class="text-amber-500" />
									<span>{c.prize}</span>
								</div>
								<div class="meta-item">
									<Clock3 size={16} class="text-blue-500" />
									<span>{dateFormatter.format(deadline)}</span>
								</div>
							</div>

							<button class="contest-btn">
								<a href="https://layered-xi.vercel.app/dashboard/projects">
									{c.isActive ? 'Enter Contest' : 'View Details'}
								</a>
							</button>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="no-contests">
				<Trophy size={48} class="text-gray-300" />
				<p>No contests available right now. Check back soon!</p>
			</div>
		{/if}
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
	/* ========================
	   CONTESTS SECTION
	   ======================== */

	.contests-section {
		animation: fadeInUp 0.6s ease-out;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.contests-header {
		margin-bottom: 24px;
	}

	.contests-title-group {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 8px;
	}

	.contests-title-group h2 {
		font-size: 28px;
		font-weight: 700;
		color: #1f2937;
		margin: 0;
	}

	.contests-subtitle {
		font-size: 14px;
		color: #6b7280;
		margin: 0;
	}

	.contests-grid {
		display: flex;
		gap: 20px;
		overflow-x: auto;
		scroll-behavior: smooth;
		padding-bottom: 8px;
		flex-wrap: nowrap;
		scroll-snap-type: x mandatory;
	}
	
	.contests-grid::-webkit-scrollbar {
		display: none;
	}

	.contest-card {
		min-width: 90%;
		flex-shrink: 0;
		background: white;
		border-radius: 12px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border: 1px solid #e5e7eb;
	}


	.contest-card:hover {
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
		transform: translateY(-4px);
		scroll-snap-align: start;
	}

	.contest-image-wrapper {
		position: relative;
		width: 100%;
		height: 250px;      
		overflow: hidden;   
	}

	.contest-image {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;     
		object-fit: cover;   
	}

	.contest-badge {
		position: absolute;
		top: 12px;
		right: 12px;
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 12px;
		border-radius: 20px;
		font-size: 12px;
		font-weight: 600;
		backdrop-filter: blur(8px);
		background: rgba(255, 255, 255, 0.9);
		color: #1f2937;
		border: 1px solid rgba(255, 255, 255, 0.5);
	}

	.badge-icon {
		display: inline-block;
	}

	.contest-badge.badge-active {
		background: rgba(34, 197, 94, 0.15);
		border-color: rgba(34, 197, 94, 0.3);
		color: #16a34a;
	}

	.contest-badge.badge-ending {
		background: rgba(245, 158, 11, 0.15);
		border-color: rgba(245, 158, 11, 0.3);
		color: #d97706;
	}

	.contest-badge.badge-ended {
		background: rgba(107, 114, 128, 0.15);
		border-color: rgba(107, 114, 128, 0.3);
		color: #6b7280;
	}

	.days-remaining {
		position: absolute;
		bottom: 12px;
		left: 12px;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		width: 50px;
		height: 50px;
		background: rgba(59, 130, 246, 0.95);
		color: white;
		border-radius: 8px;
		backdrop-filter: blur(4px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.days-number {
		font-size: 20px;
		font-weight: 700;
		line-height: 1;
	}

	.days-label {
		font-size: 10px;
		font-weight: 600;
		margin-top: 2px;
		text-transform: uppercase;
	}

	.contest-content {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.contest-title {
		font-size: 18px;
		font-weight: 700;
		color: #1f2937;
		margin: 0;
		line-height: 1.3;
	}

	.contest-description {
		font-size: 13px;
		color: #6b7280;
		margin: 0;
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.contest-meta {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 8px 0;
		border-top: 1px solid #f3f4f6;
		border-bottom: 1px solid #f3f4f6;
	}

	.meta-item {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		color: #4b5563;
	}

	.contest-btn {
		padding: 10px 16px;
		background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.3s ease;
		margin-top: 4px;
	}

	.contest-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 12px rgba(59, 130, 246, 0.3);
	}

	.contest-btn:active {
		transform: translateY(0);
	}

	.no-contests {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 48px 24px;
		text-align: center;
		color: #9ca3af;
	}

	.no-contests p {
		margin-top: 12px;
		font-size: 14px;
	}

	.arrow-btn {
		width: 36px;
		height: 36px;
		border-radius: 8px;
		border: 1px solid #e5e7eb;
		background: white;
		cursor: pointer;
		font-size: 16px;
		transition: all 0.2s ease;
	}
	
	.arrow-btn:hover {
		background: #f3f4f6;
		transform: translateY(-1px);
	}

	/* ========================
	   LEADERBOARD SECTION
	   ======================== */
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

	/* ========================
	   MODAL STYLES
	   ======================== */
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

	@media (max-width: 768px) {
		.contests-grid {
			grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		}
	}

	@media (max-width: 640px) {
		.contests-grid {
			grid-template-columns: 1fr;
		}

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

		.contests-title-group h2 {
			font-size: 24px;
		}
	}
</style>
