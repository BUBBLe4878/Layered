<script lang="ts">
	import Head from '$lib/components/Head.svelte';

	let { data, form } = $props();
</script>

<Head title="Weekly Awards" />

<div class="flex h-full flex-col gap-4 pb-8">
	<div class="mt-5">
		<h1 class="font-hero text-3xl font-medium">Weekly Awards</h1>
		<p class="mt-1 text-sm text-gray-300">
			Vote for this week&apos;s finalists. You can cast one vote per category.
		</p>
	</div>

	{#if !data.activeRound}
		<div class="themed-box p-4 shadow-xl/30">
			<p>Voting is closed right now. Check back when staff opens this week&apos;s ballot.</p>
		</div>
	{:else if data.categories.length === 0}
		<div class="themed-box p-4 shadow-xl/30">
			<p>{data.activeRound.label} is open, but finalists have not been published yet.</p>
		</div>
	{:else}
		<div class="themed-box p-4 shadow-xl/30">
			<p class="text-sm text-gray-300">
				Currently voting: <span class="font-semibold text-white">{data.activeRound.label}</span>
			</p>
		</div>

		<div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
			{#each data.categories as category}
				<section class="themed-box p-4 shadow-xl/30">
					<div class="mb-3">
						<h2 class="text-xl font-semibold">{category.name}</h2>
						{#if category.description}
							<p class="text-sm text-gray-300">{category.description}</p>
						{/if}
					</div>

					<div class="space-y-2">
						{#each category.finalists as finalist}
							<div class={`rounded border p-3 ${data.votesByCategory[category.id] === finalist.id ? 'border-green-500 bg-green-950/20' : 'border-primary-600/40 bg-primary-900/25'}`}>
								<div class="flex items-start justify-between gap-3">
									<div class="min-w-0">
										<p class="truncate font-medium">{finalist.user?.name ?? `User #${finalist.user?.id ?? 'unknown'}`}</p>
										{#if finalist.reason}
											<p class="mt-1 text-xs text-gray-300">{finalist.reason}</p>
										{/if}
										<p class="mt-1 text-xs text-gray-300">Votes: {finalist.voteCount}</p>
									</div>
									<form method="POST" action="?/vote">
										<input type="hidden" name="categoryId" value={category.id} />
										<input type="hidden" name="finalistId" value={finalist.id} />
										<button class="button sm" type="submit">
											{data.votesByCategory[category.id] === finalist.id ? 'Voted' : 'Vote'}
										</button>
									</form>
								</div>
							</div>
						{/each}
					</div>
				</section>
			{/each}
		</div>
	{/if}

	{#if form?.voteError}
		<p class="text-sm text-red-300">{form.voteError}</p>
	{/if}
</div>
