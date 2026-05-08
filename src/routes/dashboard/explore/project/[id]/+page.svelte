<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const { project, devlogs, comments, totalHours, isOwner, currentUserId } = $derived(data);

	let expandedDevlogId = $state<number | null>(null);
	let commentText = $state('');
	let activeTab = $state<'devlogs' | 'comments'>('devlogs');

	const statusColors: Record<string, string> = {
		building: 'bg-yellow-100 text-yellow-800',
		shipped: 'bg-green-100 text-green-800',
		rejected: 'bg-red-100 text-red-800',
		submitted: 'bg-blue-100 text-blue-800'
	};

	function formatDate(d: string | Date) {
		return new Date(d).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	}

	function formatHours(h: number) {
		return h < 1 ? `${Math.round(h * 60)}m` : `${h.toFixed(1)}h`;
	}

	// Get comments for a specific devlog
	function getDevlogComments(devlogId: number) {
		return comments.filter(c => c.devlogId === devlogId);
	}
</script>

<div class="mx-auto max-w-3xl space-y-8 px-4 py-8">
	<!-- Back -->
	<a href="/dashboard/explore" class="text-sm text-gray-500 hover:text-gray-800"
		>← Back to Explore</a
	>

	<!-- Project Header -->
	<div class="space-y-3 rounded-2xl border bg-white p-6">
		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<h1 class="text-2xl font-bold">{project.name}</h1>
				<p class="mt-1 text-sm text-gray-500">
					by <span class="font-medium text-gray-700">{project.authorName}</span>
					· {formatDate(project.createdAt)}
				</p>
			</div>
			<span
				class="rounded-full px-3 py-1 text-xs font-semibold {statusColors[project.status] ??
					'bg-gray-100 text-gray-600'}"
			>
				{project.status}
			</span>
		</div>

		{#if project.description}
			<p class="text-sm leading-relaxed text-gray-700">{project.description}</p>
		{/if}

		<!-- Stats row -->
		<div class="flex gap-6 pt-2 text-sm text-gray-500">
			<span> <strong class="text-gray-800">{devlogs.length}</strong> devlogs</span>
			<span> <strong class="text-gray-800">{formatHours(totalHours)}</strong> logged</span>
			<span> <strong class="text-gray-800">{comments.length}</strong> comments</span>
		</div>

		<!-- Links -->
		<div class="flex flex-wrap gap-3 pt-1">
			{#if project.url}
				<a
					href={project.url}
					target="_blank"
					rel="noopener"
					class="rounded-lg bg-gray-100 px-4 py-1.5 text-sm font-medium hover:bg-gray-200"
				>
					🔗 View on Printables
				</a>
			{/if}
		</div>
	</div>

	<!-- Tabs -->
	<div class="flex gap-1 border-b">
		{#each ['devlogs', 'comments'] as const as tab}
			<button
				onclick={() => (activeTab = tab)}
				class="border-b-2 px-4 py-2 text-sm font-medium capitalize transition-colors
          {activeTab === tab
					? 'border-black text-black'
					: 'border-transparent text-gray-400 hover:text-gray-700'}"
			>
				{tab === 'devlogs' ? `Devlogs (${devlogs.length})` : `Comments (${comments.length})`}
			</button>
		{/each}
	</div>

	<!-- Devlogs tab (with nested comments) -->
	{#if activeTab === 'devlogs'}
		<div class="space-y-4">
			{#each devlogs as log (log.id)}
				<div class="space-y-2 rounded-xl border bg-white p-4">
					{#if log.image}
						<img src={log.image} alt="devlog" class="h-48 w-full rounded-lg object-cover" />
					{/if}
					<p class="text-sm whitespace-pre-line text-gray-700">{log.description || 'No description'}</p>
					<div class="flex items-center justify-between text-xs text-gray-400">
						<span>{formatDate(log.createdAt)} · ⏱ {formatHours((log.timeSpent ?? 0) / 600)}</span>
						<span>❤️ {log.likeCount ?? 0}</span>
					</div>

					<!-- Comment input -->
					{#if currentUserId}
						<form
							method="POST"
							action="?/addComment"
							use:enhance={() => {
								return ({ update }) => {
									commentText = '';
									update();
								};
							}}
							class="flex gap-2 pt-2"
						>
							<input type="hidden" name="devlogId" value={log.id} />
							<input
								type="text"
								name="comment"
								placeholder="Add a comment…"
								class="flex-1 rounded-lg border px-3 py-1.5 text-sm focus:ring-1 focus:ring-black focus:outline-none"
								required
							/>
							<button
								type="submit"
								class="rounded-lg bg-black px-3 py-1.5 text-sm text-white hover:bg-gray-800"
							>
								Post
							</button>
						</form>
					{/if}

					<!-- Comments section -->
					{#if getDevlogComments(log.id).length > 0}
						<div class="mt-4 border-t pt-4">
							<button
								onclick={() =>
									(expandedDevlogId = expandedDevlogId === log.id ? null : log.id)}
								class="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
							>
								<span>{expandedDevlogId === log.id ? '↓' : '→'}</span>
								<span
									>{getDevlogComments(log.id).length} comment{getDevlogComments(log.id).length !==
									1
										? 's'
										: ''}</span
								>
							</button>

							<!-- Expanded comments -->
							{#if expandedDevlogId === log.id}
								<div class="mt-3 space-y-2">
									{#each getDevlogComments(log.id) as c (c.id)}
										<div class="rounded-lg bg-gray-50 p-3">
											<div class="mb-1 flex items-center justify-between">
												<span class="text-sm font-medium text-gray-900">
													{c.authorName || 'Anonymous'}
												</span>
												<span class="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
											</div>
											<p class="text-sm text-gray-700">{c.comment}</p>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/if}
				</div>
			{:else}
				<p class="text-sm text-gray-400 text-center py-8">No devlogs yet.</p>
			{/each}
		</div>
	{/if}

	<!-- Comments tab (all comments view) -->
	{#if activeTab === 'comments'}
		<div class="space-y-3">
			{#each comments as c (c.id)}
				<div class="rounded-xl border bg-white p-4">
					<div class="mb-1 flex items-center justify-between">
						<span class="text-sm font-medium">{c.authorName || 'Anonymous'}</span>
						<span class="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
					</div>
					<p class="mb-1 text-sm text-xs text-gray-500">
						on: "{(c.devlogDescription || 'Untitled devlog').slice(0, 60)}…"
					</p>
					<p class="text-sm text-gray-700">{c.comment}</p>
				</div>
			{:else}
				<p class="text-sm text-gray-400 text-center py-8">No comments yet.</p>
			{/each}
		</div>
	{/if}
</div>