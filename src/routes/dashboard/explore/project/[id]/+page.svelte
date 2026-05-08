<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const { project, devlogs, comments, totalHours, isOwner, currentUserId } = $derived(data);

	let selectedDevlogId = $state<number | null>(null);
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
			<span>🗂 <strong class="text-gray-800">{devlogs.length}</strong> devlogs</span>
			<span>⏱ <strong class="text-gray-800">{formatHours(totalHours)}</strong> logged</span>
			<span>💬 <strong class="text-gray-800">{comments.length}</strong> comments</span>
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
			{#if project.editorUrl}
				<a
					href={project.editorUrl}
					target="_blank"
					rel="noopener"
					class="rounded-lg bg-gray-100 px-4 py-1.5 text-sm font-medium hover:bg-gray-200"
				>
					✏️ Open Editor
				</a>
			{/if}
		</div>

		<!-- Reactions -->
		<!--
    <div class="flex gap-2 pt-2">
      {#each ['👍','❤️','🔥','😮','🎉'] as emoji}
        <form method="POST" action="?/toggleReaction" use:enhance>
          <input type="hidden" name="reaction" value={emoji} />
          <button class="px-3 py-1 rounded-full border text-sm hover:bg-gray-50">
            {emoji} {reactions.find(r => r.reaction === emoji)?.reactionCount ?? 0}
          </button>
        </form>
      {/each}
    </div>
    -->
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

	<!-- Devlogs tab -->
	{#if activeTab === 'devlogs'}
		<div class="space-y-4">
			{#each devlogs as log (log.id)}
				<div class="space-y-2 rounded-xl border bg-white p-4">
					{#if log.image}
						<img src={log.image} alt="devlog" class="h-48 w-full rounded-lg object-cover" />
					{/if}
					<p class="text-sm whitespace-pre-line text-gray-700">{log.description}</p>
					<div class="flex items-center justify-between text-xs text-gray-400">
						<span>{formatDate(log.createdAt)} · ⏱ {formatHours((log.timeSpent ?? 0) / 600)}</span>
						<span>❤️ {log.likeCount}</span>
					</div>

					<!-- Comment on this devlog -->
					{#if currentUserId}
						<form
							method="POST"
							action="?/addComment"
							use:enhance={() => {
								return ({ update }) => {
									commentText = '';
									selectedDevlogId = null;
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
				</div>
			{:else}
				<p class="text-sm text-gray-400 text-center py-8">No devlogs yet.</p>
			{/each}
		</div>
	{/if}

	<!-- Comments tab -->
	{#if activeTab === 'comments'}
		<div class="space-y-3">
			{#each comments as c (c.id)}
				<div class="rounded-xl border bg-white p-4">
					<div class="mb-1 flex items-center justify-between">
						<span class="text-sm font-medium">{c.authorName}</span>
						<span class="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
					</div>
					<p class="mb-1 text-sm text-xs text-gray-500">
						on: "{c.devlogDescription?.slice(0, 60)}…"
					</p>
					<p class="text-sm text-gray-700">{c.comment}</p>
				</div>
			{:else}
				<p class="text-sm text-gray-400 text-center py-8">No comments yet.</p>
			{/each}
		</div>
	{/if}
</div>
