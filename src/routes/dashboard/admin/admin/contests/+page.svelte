<script lang="ts">
	import Head from '$lib/components/Head.svelte';
	import { enhance } from '$app/forms';
	import { Trash2, Edit2, Plus } from 'lucide-svelte';
	import type { ActionData } from './$types';

	let { data, form }: { data: any; form: ActionData } = $props();

	let contests = $derived(data.contests ?? []);
	let editingId: number | null = $state(null);
	let showForm = $state(false);

	let formData = $state({
		title: '',
		description: '',
		image: '',
		status: 'upcoming',
		prize: '',
		deadline: ''
	});

	function startEdit(contest: any) {
		editingId = contest.id;
		formData = {
			title: contest.title,
			description: contest.description,
			image: contest.image,
			status: contest.status,
			prize: contest.prize,
			deadline: contest.deadline?.toISOString().split('T')[0] || ''
		};
		showForm = true;
	}

	function resetForm() {
		editingId = null;
		showForm = false;
		formData = {
			title: '',
			description: '',
			image: '',
			status: 'upcoming',
			prize: '',
			deadline: ''
		};
	}
</script>

<Head title="Manage Contests" />

<div class="p-6">
	<div class="flex justify-between items-center mb-6">
		<h1 class="text-3xl font-bold">Manage Contests</h1>
		<button
			onclick={() => {
				showForm = !showForm;
				if (!showForm) resetForm();
			}}
			class="button primary flex items-center gap-2"
		>
			<Plus size={18} />
			{showForm ? 'Cancel' : 'Add Contest'}
		</button>
	</div>

	<!-- Add/Edit Form -->
	{#if showForm}
		<div class="bg-white border rounded-lg p-6 mb-6 shadow-sm">
			<h2 class="text-xl font-semibold mb-4">
				{editingId ? 'Edit Contest' : 'Create New Contest'}
			</h2>

			<form
				method="POST"
				action={editingId ? '?/update' : '?/create'}
				use:enhance={() => {
					return async ({ result }) => {
						if (result.type === 'success') {
							resetForm();
						}
					};
				}}
				class="space-y-4"
			>
				{#if editingId}
					<input type="hidden" name="id" value={editingId} />
				{/if}

				<div>
					<label class="block text-sm font-medium mb-1">Title</label>
					<input
						type="text"
						name="title"
						bind:value={formData.title}
						required
						class="w-full border rounded px-3 py-2"
						placeholder="Contest title"
					/>
				</div>

				<div>
					<label class="block text-sm font-medium mb-1">Description</label>
					<textarea
						name="description"
						bind:value={formData.description}
						required
						class="w-full border rounded px-3 py-2 min-h-24"
						placeholder="Contest description"
					></textarea>
				</div>

				<div>
					<label class="block text-sm font-medium mb-1">Image URL</label>
					<input
						type="url"
						name="image"
						bind:value={formData.image}
						required
						class="w-full border rounded px-3 py-2"
						placeholder="https://example.com/image.jpg"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block text-sm font-medium mb-1">Status</label>
						<select name="status" bind:value={formData.status} class="w-full border rounded px-3 py-2">
							<option value="upcoming">Upcoming</option>
							<option value="active">Active</option>
							<option value="ended">Ended</option>
						</select>
					</div>

					<div>
						<label class="block text-sm font-medium mb-1">Prize</label>
						<input
							type="text"
							name="prize"
							bind:value={formData.prize}
							required
							class="w-full border rounded px-3 py-2"
							placeholder="$500 prize"
						/>
					</div>
				</div>

				<div>
					<label class="block text-sm font-medium mb-1">Deadline</label>
					<input
						type="date"
						name="deadline"
						bind:value={formData.deadline}
						required
						class="w-full border rounded px-3 py-2"
					/>
				</div>

				<div class="flex gap-2 pt-4">
					<button type="submit" class="button primary">
						{editingId ? 'Update' : 'Create'} Contest
					</button>
					<button type="button" onclick={resetForm} class="button secondary">
						Cancel
					</button>
				</div>
			</form>
		</div>
	{/if}

	<!-- Contests List -->
	<div class="grid grid-cols-1 gap-4">
		{#if contests.length === 0}
			<div class="text-center py-12 text-gray-500">
				<p class="text-lg">No contests yet</p>
			</div>
		{:else}
			{#each contests as contest (contest.id)}
				<div class="bg-white border rounded-lg p-4 flex items-center justify-between hover:shadow-md transition">
					<div class="flex-1">
						<h3 class="font-semibold text-lg">{contest.title}</h3>
						<p class="text-sm text-gray-600">{contest.description}</p>
						<div class="flex gap-4 mt-2 text-sm text-gray-500">
							<span>Prize: {contest.prize}</span>
							<span>Status: <span class="font-medium capitalize">{contest.status}</span></span>
							<span>Deadline: {new Date(contest.deadline).toLocaleDateString()}</span>
						</div>
					</div>

					<div class="flex gap-2 ml-4">
						<button
							onclick={() => startEdit(contest)}
							class="button secondary p-2 flex items-center gap-1"
							title="Edit"
						>
							<Edit2 size={18} />
						</button>

						<form
							method="POST"
							action="?/delete"
							use:enhance={() => {
								return async () => {
									// Form will auto-refresh
								};
							}}
							class="inline"
						>
							<input type="hidden" name="id" value={contest.id} />
							<button
								type="submit"
								class="button danger p-2 flex items-center gap-1"
								title="Delete"
								onclick={(e) => {
									if (!confirm('Are you sure you want to delete this contest?')) {
										e.preventDefault();
									}
								}}
							>
								<Trash2 size={18} />
							</button>
						</form>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>


