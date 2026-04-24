<script lang="ts">
    import Button from '$lib/components/Button.svelte';
    import Head from '$lib/components/Head.svelte';

    let { data } = $props();
    let reason = $derived(data?.reason ?? null);
    let detail = $derived(data?.detail ?? null);
</script>

<Head title="Authentication failed" />

<div class="min-h-screen bg-gradient-to-b from-primary-50 via-white to-primary-50/30 px-6 py-16">
    <div class="mx-auto flex w-full max-w-2xl flex-col items-center rounded-3xl border border-primary-200 bg-white/85 px-6 py-10 text-center shadow-xl">
        <p class="text-sm font-semibold uppercase tracking-[0.24em] text-primary-700">Sign-in issue</p>
        <h1 class="mt-3 text-4xl font-bold text-primary-950">Authentication failed</h1>
        <p class="mt-4 max-w-lg text-base leading-relaxed text-gray-700">
            {#if reason === 'access_denied'}
                You cancelled the login or denied access.
            {:else if reason}
                Something went wrong while connecting your account.
            {:else}
                Something went wrong while connecting your account.
            {/if}
            {#if detail}
                <span class="mt-2 block text-sm text-gray-600">{detail}</span>
            {:else}
                <span class="mt-2 block text-sm text-gray-600">
                    You can try the login flow again, or come back in a minute if the external service is having trouble.
                </span>
            {/if}
        </p>
        <div class="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button text="Try again" href="/auth/idv" />
            <a href="/" class="button md orange">Go home</a>
        </div>
        <img
            src="https://slack-files.com/T09V59WQY1E-F0AU4N7B1KQ-20523a2fe6"
            alt="Sad cat holding a sign"
            class="mt-10 w-full max-w-sm rounded-2xl border border-primary-200 object-cover"
        />
    </div>
</div>
