<script lang="ts">
	import Head from '$lib/components/Head.svelte';

	let { data, form } = $props();
</script>

<Head title="Weekly Awards" />

<div class="flex h-full flex-col gap-4 pb-8">
	<div class="mt-5">
		<h1 class="font-hero text-3xl font-medium">Weekly Awards</h1>
		<p class="mt-1 text-sm text-gray-300">
			Configure categories, open community voting, and grant bonus Layers to winners.
		</p>
	</div>

	<div class="themed-box p-4 shadow-xl/30">
		<h2 class="text-xl font-semibold">Create Weekly Round</h2>
		<form method="POST" action="?/createRound" class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
			<label class="flex flex-col gap-1">
				<span class="text-sm text-gray-300">Week start</span>
				<input class="themed-box p-2" type="date" name="weekStart" required />
			</label>
			<label class="flex flex-col gap-1 md:col-span-2">
				<span class="text-sm text-gray-300">Label (optional)</span>
				<input
					class="themed-box p-2"
					type="text"
					name="label"
					placeholder="Week of 2026-04-27"
				/>
			</label>
			<div class="md:col-span-3">
				<button class="button md" type="submit">Create round</button>
			</div>
		</form>
		{#if form?.createRoundError}
			<p class="mt-2 text-sm text-red-300">{form.createRoundError}</p>
		{/if}
	</div>

	{#if data.rounds.length === 0}
		<div class="themed-box p-4 shadow-xl/30">
			<p>No rounds yet. Create one to get started.</p>
		</div>
	{:else}
		{#each data.rounds as round}
			<section class="themed-box p-4 shadow-xl/30">
				<div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
					<div>
						<h2 class="text-2xl font-semibold">{round.label}</h2>
						<p class="text-sm text-gray-300">Week starting {new Date(round.weekStart).toLocaleDateString()}</p>
					</div>
					<form method="POST" action="?/toggleVoting" class="flex items-center gap-2">
						<input type="hidden" name="roundId" value={round.id} />
						<input type="hidden" name="votingOpen" value={round.votingOpen ? 'false' : 'true'} />
						<span class={`rounded px-2 py-1 text-xs ${round.votingOpen ? 'bg-green-800 text-green-100' : 'bg-gray-700 text-gray-100'}`}>
							{round.votingOpen ? 'Voting open' : 'Voting closed'}
						</span>
						<button class="button sm" type="submit">
							{round.votingOpen ? 'Close voting' : 'Open voting'}
						</button>
					</form>
				</div>

				<div class="mt-4 border-t border-primary-600/30 pt-4">
					<h3 class="text-lg font-semibold">Add Category</h3>
					<form method="POST" action="?/createCategory" class="mt-2 grid grid-cols-1 gap-3 lg:grid-cols-4">
						<input type="hidden" name="roundId" value={round.id} />
						<input class="themed-box p-2" type="text" name="name" placeholder="Most Helpful Builder" required />
						<input class="themed-box p-2" type="text" name="description" placeholder="Optional description" />
						<input class="themed-box p-2" type="number" min="1" max="10000" name="bonusLayers" placeholder="Bonus Layers (default 50)" />
						<button class="button md" type="submit">Add category</button>
					</form>
				</div>

				<div class="mt-4 space-y-3">
					{#if round.categories.length === 0}
						<p class="text-sm text-gray-300">No categories yet for this week.</p>
					{:else}
						{#each round.categories as category}
							<div class="rounded border border-primary-600/40 bg-primary-900/25 p-3">
								<div class="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
									<div>
										<h4 class="text-lg font-semibold">{category.name}</h4>
										{#if category.description}
											<p class="text-sm text-gray-300">{category.description}</p>
										{/if}
										<p class="text-xs text-gray-300">Winner bonus: {category.bonusLayers} Layers</p>
									</div>
									{#if category.payout}
										<span class="rounded bg-emerald-800 px-2 py-1 text-xs text-emerald-100">
											Awarded to {category.payout.winnerName ?? `User #${category.payout.winnerUserId}`}
										</span>
									{/if}
								</div>

								<form method="POST" action="?/addFinalist" class="mt-3 grid grid-cols-1 gap-2 lg:grid-cols-4">
									<input type="hidden" name="categoryId" value={category.id} />
									<select class="themed-box p-2" name="userId" required>
										<option value="">Select finalist</option>
										{#each data.awardUsers as awardUser}
											<option value={awardUser.id}>{awardUser.name}</option>
										{/each}
									</select>
									<input class="themed-box p-2 lg:col-span-2" type="text" name="reason" placeholder="Optional finalist reason" />
									<button class="button sm" type="submit">Add finalist</button>
								</form>

								<div class="mt-3 space-y-2">
									{#if category.finalists.length === 0}
										<p class="text-sm text-gray-300">No finalists yet.</p>
									{:else}
										{#each category.finalists as finalist}
											<div class="flex flex-col gap-2 rounded bg-primary-950/40 p-2 md:flex-row md:items-center md:justify-between">
												<div>
													<p class="font-medium">{finalist.user?.name ?? `User #${finalist.user?.id ?? 'unknown'}`}</p>
													{#if finalist.reason}
														<p class="text-xs text-gray-300">{finalist.reason}</p>
													{/if}
													<p class="text-xs text-gray-300">Votes: {finalist.voteCount}</p>
												</div>
												{#if !category.payout}
													<form method="POST" action="?/grantWinner">
														<input type="hidden" name="categoryId" value={category.id} />
														<input type="hidden" name="finalistId" value={finalist.id} />
														<button class="button sm" type="submit">
															Grant {category.bonusLayers} Layers
														</button>
													</form>
												{/if}
											</div>
										{/each}
									{/if}
								</div>
							</div>
						{/each}
					{/if}
				</div>
			</section>
		{/each}
	{/if}

	{#if form?.createCategoryError}
		<p class="text-sm text-red-300">{form.createCategoryError}</p>
	{/if}
	{#if form?.addFinalistError}
		<p class="text-sm text-red-300">{form.addFinalistError}</p>
	{/if}
	{#if form?.grantWinnerError}
		<p class="text-sm text-red-300">{form.grantWinnerError}</p>
	{/if}
</div>
