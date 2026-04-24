<script lang="ts">
	import { enhance } from '$app/forms';
	import Head from '$lib/components/Head.svelte';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();

	let formPending = $state(false);
</script>

<Head title="Create project" />

<div class="mt-5 mb-4 rounded-2xl border border-primary-200 bg-gradient-to-br from-white to-primary-50 p-5 sm:p-6">
	<h1 class="text-3xl font-semibold text-primary-950" style="font-family: var(--font-display-alt);">
		Create Project
	</h1>
	<p class="mt-2 max-w-2xl text-sm text-gray-700" style="font-family: var(--font-body-alt);">
		Start a new build entry. Keep your description clear, your journals frequent, and your files printable.
	</p>
</div>

<div class="mb-5 rounded-2xl border border-primary-300 bg-white/85 p-5 sm:p-6">
	<h2 class="text-xl font-bold text-primary-900">Before You Start</h2>
	<p class="mt-2 text-sm text-gray-700">This flow keeps reviews fast and reduces print failures.</p>
	<ol class="mt-3 list-inside list-decimal space-y-2 text-sm text-gray-800">
		<li>You finish your project, upload it to Printables and ship it.</li>
		<li>
			We will review your project to make sure everything looks fine and is printable. We will also
			check if there are any makes or photos of it on Printables. This can be done in a few ways:
			<ul class="mt-2 list-inside list-disc space-y-1 indent-5">
				<li>Someone on Printables thinks your design is cool, prints it and posts a make of it!</li>
				<li>
					You print it yourself and put pictures of it on Printables (though obviously you can only
					do this if you already have a printer).
				</li>
				<li>
					It doesn't have any pictures or makes when we review your ship. In this case, your design
					is printed by someone on our printer team and they add a make of it on Printables. To help
					cover the filament cost, we will take a small cut of your payout, though we will be
					subsidising some of the cost ourselves.
					<strong class="text-primary-900"
						>For this reason we recommend fewer, longer projects. Aim for ~6-10h or more.</strong
					>
				</li>
			</ul>
		</li>
		<li>It gets approved once more and you'll get your layers!</li>
	</ol>
	<p class="mt-4 text-sm text-gray-800">
		Make sure you design your project to be 3D printable! Avoid overhangs if you can and reduce the
		places where you'd need supports. During the design process you should always keep how it will
		be printed in mind and avoid wasting filament. You also can't use any electronics or other
		hardware such as bearings, except nuts and bolts in standard metric and imperial sizes (don't go
		above M6 or 1/4" though).
	</p>
	<p class="mt-3 text-sm text-gray-800">
		Aim to do journal every 30 mins to 1 hour, frequent and higher quality journal logs will earn
		you a higher experience!
	</p>
	<h3 class="mt-4 text-lg font-bold text-primary-900">Experience</h3>
	<p class="mt-1 text-sm text-gray-800">
		Experience is our system of encouraging you to make better projects! In the second review
		stage, we decide how much experience you'll gain from your project. Here's what your experience
		depends on:
	</p>
	<ul class="mt-2 list-inside list-disc space-y-1 text-sm text-gray-800">
		<li>How cool we think your project is!</li>
		<li>The number and quality of your devlogs</li>
		<li>How polished your project is</li>
	</ul>
	<p class="mt-3 text-sm text-gray-800">
		A higher experience:
	</p>
	<ul class="mt-2 list-inside list-disc space-y-1 text-sm text-gray-800">
		<li>Reduces the price of printshop items</li>
		<li>Lets you unlock more items in the printshop</li>
		<li>Gives you a cool profile badge!</li>
		<li>Maybe lets you access a secret printshop 👀?</li>
	</ul>
	<a href="/dashboard/tutorial" class="mt-3 inline-block underline text-primary-700"
		>Read Help + FAQ</a
	>
</div>

<form
	method="POST"
	class="mb-5 rounded-2xl border border-primary-200 bg-white/85 p-5 sm:p-6 flex flex-col gap-4"
	use:enhance={() => {
		formPending = true;
		return async ({ update }) => {
			await update();
			formPending = false;
		};
	}}
>
	<div>
		<label class="flex flex-col gap-1">
			<span class="text-sm font-semibold uppercase tracking-wide text-gray-600">Project Name</span>
			<input
				type="text"
				name="name"
				placeholder="Come up with an interesting name"
				required
				value={form?.fields?.name ?? ''}
				class="themed-input-on-box"
			/>
		</label>
		{#if form?.invalid_name}
			<p class="text-sm text-red-700">Invalid name, must be between 1 and 80 characters</p>
		{/if}
	</div>
	<div>
		<label class="flex flex-col gap-1">
			<span class="text-sm font-semibold uppercase tracking-wide text-gray-600"
				>Description <span class="inline opacity-50">(optional)</span></span
			>
			<textarea
				name="description"
				placeholder="A couple sentences to describe your project"
				class="themed-input-on-box min-h-28"
				>{form?.fields?.description ?? ''}</textarea
			>
		</label>
		{#if form?.invalid_description}
			<p class="text-sm text-red-700">Invalid description, must be at most 2000 characters</p>
		{/if}
	</div>
	<button type="submit" class="button md primary mt-3 shadow-lg" disabled={formPending}>
		Create!
	</button>
</form>
