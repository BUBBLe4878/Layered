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
			</div>

			<h2 class="mt-2 text-2xl font-bold">User details</h2>

			<div class="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
				<DataCard title="Slack ID">
					<code>{user.slackId}</code>
				</DataCard>

				<DataCard title="Trust">
					{user.trust}
				</DataCard>

				<DataCard title="Hackatime trust">
					{user.hackatimeTrust}
				</DataCard>

				<DataCard title="Created">
					<abbr title={user.createdAt?.toUTCString()}>
						{relativeDate(user.createdAt)}
					</abbr>
				</DataCard>
			</div>

			<!-- ================= PII SECTION ================= -->
			<h2 class="mt-6 text-2xl font-bold">yummy stuff</h2>

			<div class="mb-5">
				{#if fetchPIIPending}
					<p>Loading...</p>
				{:else if form?.fetchPII}
					{#if form.fetchPII.success}
						<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
							<DataCard title="Name">
								{form.fetchPII.first_name ?? 'N/A'}
							</DataCard>

							<DataCard title="Surname">
								{form.fetchPII.last_name ?? 'N/A'}
							</DataCard>

							<DataCard title="Email">
								{form.fetchPII.primary_email ?? 'N/A'}
							</DataCard>

							<DataCard title="Phone">
								{form.fetchPII.phone_number ?? 'N/A'}
							</DataCard>

							<DataCard title="Birthday">
								{form.fetchPII.birthday ?? 'N/A'}
							</DataCard>
						</div>

						{#if form.fetchPII.address}
							<h3 class="mt-4 mb-2 text-xl font-bold">Address</h3>

							<div class="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
								<DataCard title="Line 1">
									{form.fetchPII.address.line_1 ?? 'N/A'}
								</DataCard>

								<DataCard title="City">
									{form.fetchPII.address.city ?? 'N/A'}
								</DataCard>

								<DataCard title="State">
									{form.fetchPII.address.state ?? 'N/A'}
								</DataCard>

								<DataCard title="Country">
									{form.fetchPII.address.country ?? 'N/A'}
								</DataCard>

								{#if form.fetchPII.address.postal_code}
									<DataCard title="Postcode">
										{form.fetchPII.address.postal_code}
									</DataCard>
								{/if}
							</div>
						{/if}
					{:else}
						<p class="text-red-500">
							{form.fetchPII.errorMessage ?? 'Failed to fetch data'}
						</p>
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
						<button type="submit" class="button md primary">
							go fetch
						</button>
					</form>
				{/if}
			</div>
		</div>
	</div>
</div>
