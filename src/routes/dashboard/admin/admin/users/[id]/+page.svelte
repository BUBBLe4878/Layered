<script lang="ts">
	import relativeDate from 'tiny-relative-date';
	import Head from '$lib/components/Head.svelte';
	import DataCard from '$lib/components/DataCard.svelte';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let user = $derived(form?.queriedUser ?? data.queriedUser);

	let hackatimePending = $state(false);
	let currencyPending = $state(false);
	let privilegesPending = $state(false);
	let impersonatePending = $state(false);
	let logoutPending = $state(false);
	let fetchPIIPending = $state(false);
	let changeTrustPending = $state(false);

	let reason = $state('');
	let displayLayers = $state(0);

	// Initialize display layers from user data
	$effect(() => {
		if (user?.clay) {
			displayLayers = user.clay * 10;
		}
	});

	function handleLayersChange(e: Event) {
		const input = e.target as HTMLInputElement;
		displayLayers = parseFloat(input.value);
	}
</script>

<Head title={'User: ' + user.name} />

<div class="flex h-full flex-row gap-10">
	<div class="grow">
		<div class="flex grow flex-col gap-3">
			<h1 class="mt-5 font-hero text-2xl font-medium">{user.name}</h1>

			<div>
				<img
					src={user.profilePicture}
					alt="user profile"
					class="aspect-square h-45 rounded-xl border-4 border-primary-800 shadow-lg"
				/>
			</div>

			<div class="flex flex-row flex-wrap gap-3">
				<a href={`/dashboard/users/${user.id}`} class="button md primary">Public profile page</a>
				<a href={`../stickers/${user.id}`} class="button md primary">Sticker fulfilment page</a>

				<div>
					<form
						action="?/refreshHackatime"
						method="POST"
						use:enhance={() => {
							hackatimePending = true;
							return async ({ update }) => {
								await update();
								hackatimePending = false;
							};
						}}
					>
						<button type="submit" class="button md primary" disabled={hackatimePending}
							>Refresh Hackatime trust</button
						>
					</form>
				</div>
				<div>
					<form
						action="?/impersonate"
						method="POST"
						use:enhance={() => {
							impersonatePending = true;
							return async ({ update }) => {
								await update();
								impersonatePending = false;
							};
						}}
					>
						<button type="submit" class="button md primary" disabled={impersonatePending}
							>Impersonate</button
						>
					</form>
				</div>
				<div>
					<form
						action="?/logout"
						method="POST"
						use:enhance={() => {
							logoutPending = true;
							return async ({ update }) => {
								await update();
								logoutPending = false;
							};
						}}
					>
						<button type="submit" class="button md dark-red" disabled={logoutPending}
							>Log out user</button
						>
					</form>
				</div>
			</div>

			<h2 class="mt-2 text-2xl font-bold">User details</h2>

			<div
				class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
			>
				<DataCard title="Slack ID">
					<code
						><a
							class="underline"
							href={`https://hackclub.slack.com/team/${user.slackId}`}
							target="_blank">{user.slackId}</a
						></code
					>
				</DataCard>
				<DataCard title="IDV ID">
					<code>{user.idvId}</code>
				</DataCard>
				<DataCard title="Trust">
					{user.trust}
				</DataCard>
				<DataCard title="Hackatime trust">
					<a
						class="underline"
						href={`https://joe.fraud.hackclub.com/profile/${user.slackId}`}
						target="_blank">{user.hackatimeTrust}</a
					>
				</DataCard>
				<DataCard title="Has base printer">
					{user.hasBasePrinter ? 'Yes' : 'No'}
				</DataCard>
				<DataCard title="Stickers fulfilled">
					{user.stickersShipped ? 'Yes' : 'No'}
				</DataCard>
				<DataCard title="Account created">
					<abbr title={`${user.createdAt.toUTCString()}`} class="relative z-2">
						{relativeDate(user.createdAt)}
					</abbr>
				</DataCard>
				<DataCard title="Last login">
					<abbr title={`${user.lastLoginAt.toUTCString()}`} class="relative z-2">
						{relativeDate(user.lastLoginAt)}
					</abbr>
				</DataCard>
				<DataCard title="Devlog count">
					{data.devlogCount}
				</DataCard>
				<DataCard title="Journal streak">
					{user.journalStreak ?? 0} day{(user.journalStreak ?? 0) === 1 ? '' : 's'}
					{#if user.journalStreakLastJournalAt}
						<div class="mt-1 text-xs opacity-70">
							Last journal: <abbr title={`${user.journalStreakLastJournalAt.toUTCString()}`}>
								{relativeDate(user.journalStreakLastJournalAt)}
							</abbr>
						</div>
					{/if}
				</DataCard>
				<DataCard title="Referred by ID">
					{user.referralId ?? 'None'}
				</DataCard>
			</div>

			<h2 class="mt-2 text-2xl font-bold">Currency stuff</h2>
			<div class="themed-box flex flex-col gap-3 p-3 shadow-lg">
				<form
					action="?/currency"
					method="POST"
					use:enhance={() => {
						currencyPending = true;
						return async ({ update }) => {
							await update({ reset: false });
							currencyPending = false;
							reason = '';
						};
					}}
				>
					<div class="grid grid-cols-2 gap-3 lg:grid-cols-3">
						<label class="flex flex-col gap-1">
							<span class="text-sm font-medium">Layers (display value)</span>
							<input
								type="number"
								value={displayLayers}
								onchange={handleLayersChange}
								class="themed-input-on-box"
								placeholder="Layers"
								step="10"
								required
							/>
							<input
								type="hidden"
								name="clay"
								value={displayLayers / 10}
							/>
							<span class="text-xs text-gray-600">Will submit as: {displayLayers / 10}</span>
						</label>
						<label class="flex flex-col gap-1">
							<span class="text-sm font-medium">Experience</span>
							<input
								type="number"
								name="market_score"
								value={form?.currency?.fields.shopScore ?? user.shopScore}
								class="themed-input-on-box"
								placeholder="Experience"
								step="0.01"
								required
							/>
						</label>
					</div>
					<label class="mt-2 flex flex-col gap-1">
						<span class="text-sm font-medium">Reason for change</span>
						<textarea
							name="reason"
							class="themed-input-on-box"
							placeholder="they bribed me"
							required
							bind:value={reason}
						></textarea>
					</label>
					{#if form?.currency?.invalidFields}
						<p class="w-full text-center text-sm">Invalid fields</p>
					{/if}
					<button type="submit" class="button md primary mt-3 w-full" disabled={currencyPending}
						>Apply!</button
					>
				</form>
			</div>

			<h2 class="mt-2 text-2xl font-bold">Privileges</h2>
			<div class="themed-box flex flex-col gap-3 p-3 shadow-lg">
				<form
					action="?/privileges"
					method="POST"
					use:enhance={() => {
						privilegesPending = true;
						return async ({ update }) => {
							await update({ reset: false });
							privilegesPending = false;
						};
					}}
				>
					<div class="grid grid-cols-2 lg:grid-cols-4">
						<label class="flex flex-row items-center gap-1">
							<input type="checkbox" name="is_printer" checked={user.isPrinter} class="checkbox" />
							<span class="font-medium">Is printer</span>
						</label>
						<label class="flex flex-row items-center gap-1">
							<input
								type="checkbox"
								name="has_t1_review"
								checked={user.hasT1Review}
								class="checkbox"
							/>
							<span class="font-medium">Has T1 review</span>
						</label>
						<label class="flex flex-row items-center gap-1">
							<input
								type="checkbox"
								name="has_t2_review"
								checked={user.hasT2Review}
								class="checkbox"
							/>
							<span class="font-medium">Has T2 review</span>
						</label>
						<label class="flex flex-row items-center gap-1">
							<input type="checkbox" name="has_admin" checked={user.hasAdmin} class="checkbox" />
							<span class="font-medium">Has admin</span>
						</label>
					</div>
					<button type="submit" class="button md primary mt-3 w-full" disabled={privilegesPending}
						>Apply!</button
					>
				</form>
			</div>

			<h2 class="mt-2 text-2xl font-bold">Trust Level</h2>
			<div class="themed-box flex flex-col gap-3 p-3 shadow-lg">
				<form
					action="?/changeTrust"
					method="POST"
					use:enhance={() => {
						changeTrustPending = true;
						return async ({ update }) => {
							await update({ reset: false });
							changeTrustPending = false;
						};
					}}
				>
					<label class="flex flex-col gap-1">
						<span class="text-sm font-medium">User Trust Level</span>
						<select name="trust" value={user.trust} class="themed-input-on-box text-sm" required>
							<option value="green">Green</option>
							<option value="blue">Blue</option>
							<option value="yellow">Yellow</option>
							<option value="red">Red</option>
						</select>
					</label>
					{#if form?.changeTrust?.invalidTrust}
						<p class="w-full text-center text-sm">Invalid trust level</p>
					{/if}
					<button type="submit" class="button md primary mt-3 w-full" disabled={changeTrustPending}
						>Apply!</button
					>
				</form>
			</div>

			<h2 class="mt-2 text-2xl font-bold">yummy stuff</h2>
			<div class="mb-5">
				{#if form?.fetchPII?.success}
					<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
						<DataCard title="Name">
							{form.fetchPII.first_name}
						</DataCard>
						<DataCard title="Surname">
							{form.fetchPII.last_name}
						</DataCard>
						<DataCard title="Email">
							{form.fetchPII.primary_email}
						</DataCard>
						<DataCard title="Phone number">
							<code>{form.fetchPII.phone_number}</code>
						</DataCard>
						<DataCard title="Birthday">
							<code>{form.fetchPII.birthday}</code>
						</DataCard>
					</div>

					<h3 class="mt-3 mb-2 text-xl font-bold">address</h3>

					{#if form?.fetchPII.address}
						<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
							<DataCard title="Address ID">
								<code>{form.fetchPII.address.id}</code>
							</DataCard>
							<DataCard title="Address first name">
								{form.fetchPII.address.first_name}
							</DataCard>
							<DataCard title="Address last name">
								{form.fetchPII.address.last_name}
							</DataCard>
							<DataCard title="Address line 1">
								{form.fetchPII.address.line_1}
							</DataCard>
							{#if form.fetchPII.address.line_2}
								<DataCard title="Address line 2">
									{form.fetchPII.address.line_2}
								</DataCard>
							{/if}
							<DataCard title="City">
								{form.fetchPII.address.city}
							</DataCard>
							<DataCard title="State">
								{form.fetchPII.address.state}
							</DataCard>
							<DataCard title="Postcode">
								{form.fetchPII.address.postal_code}
							</DataCard>
							<DataCard title="Country">
								{form.fetchPII.address.country}
							</DataCard>
						</div>
					{/if}

					{#if form?.fetchPII.addresses?.length > 1}
						<h3 class="mt-3 mb-2 text-xl font-bold">all addresses</h3>
						<div class="flex flex-col gap-2">
							{#each form.fetchPII.addresses as addr, i}
								<div class="themed-box p-3">
									<p class="font-bold">Address {i + 1}</p>
									<p class="text-sm">
										{addr.first_name} {addr.last_name}, {addr.line_1}{addr.line_2
											? `, ${addr.line_2}`
											: ''}, {addr.city}, {addr.state}, {addr.postal_code}, {addr.country}
									</p>
								</div>
							{/each}
						</div>
					{/if}
				{:else}
					<form
						action="?/fetchPII"
						method="POST"
						use:enhance={() => {
							fetchPIIPending = true;
							return async ({ update }) => {
								await update();
								fetchPIIPending = false;
							};
						}}
					>
						<button type="submit" class="button md primary" disabled={fetchPIIPending}
							>go fetch</button
						>
						<p class="mt-1">{form?.fetchPII?.errorMessage}</p>
					</form>
				{/if}
			</div>
		</div>
	</div>
</div>
