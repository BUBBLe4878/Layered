<script lang="ts">
	import {
		House,
		PencilRuler,
		Compass,
		BookOpen,
		LogOut,
		ClipboardPen,
		ClipboardPenLine,
		Store,
		ShieldUser,
		Box,
		Users,
		ChevronDown,
		Menu,
		X
	} from '@lucide/svelte';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import logo from '$lib/assets/logo.png';

	let { user } = $props();

	let isOnOwnUserPage = $derived(
		page.url.pathname === `/dashboard/users/${user.id}` ||
			page.url.pathname === `/dashboard/users/${user.id}/`
	);

	let showAdminMenu = $state(false);
	let showMobileMenu = $state(false);
	let showMobileAdminMenu = $state(false);
	let adminButtonElement: HTMLButtonElement | null = $state(null);
	let logoElement: HTMLImageElement | null = $state(null);
	let logoAspectRatio = $state('1 / 1');

	function handleLogoLoad() {
		if (logoElement) {
			const aspectRatio = logoElement.naturalWidth / logoElement.naturalHeight;
			logoAspectRatio = `${aspectRatio} / 1`;
		}
	}

	let dropdownPosition = $derived.by(() => {
		if (!adminButtonElement) return { left: '0px' };
		const rect = adminButtonElement.getBoundingClientRect();
		return {
			left: `${rect.left}px`
		};
	});

	let hasAdminAccess = $derived(
		user.isPrinter || user.hasT1Review || user.hasT2Review || user.hasAdmin
	);
</script>

<!-- Top Header Navigation -->
<header
	class="dashboard-header relative sticky top-0 z-50 border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm"
>
	<div class="flex items-center justify-between gap-3 px-3 py-3 sm:px-4">
		<!-- Logo -->
		<div class="mr-2 flex shrink-0 items-center border-gray-700 pr-0 md:mr-2 md:border-r md:pr-8">
			<a href={resolve('/')} class="flex items-center" style="aspect-ratio: {logoAspectRatio};">
				<img
					bind:this={logoElement}
					onload={handleLogoLoad}
					src={logo}
					alt="logo"
					class="h-10 w-auto"
				/>
			</a>
		</div>

		<!-- Main Navigation -->
		<nav class="hidden flex-1 items-center gap-2 overflow-x-auto md:flex">
			<!-- Home -->
			<a
				href={resolve('/dashboard')}
				class="header-nav-button pei-button pei1 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm transition-colors hover:bg-primary-700"
				class:bg-primary-700={page.url.pathname === '/dashboard'}
			>
				<House size={20} />
				<span>Home</span>
			</a>

			<!-- Projects -->
			<a
				href={resolve('/dashboard/projects')}
				class="header-nav-button pei-button pei1 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-700 px-3 py-2 text-sm transition-colors hover:bg-primary-600"
				class:bg-primary-600={page.url.pathname.startsWith('/dashboard/projects')}
			>
				<PencilRuler size={20} />
				<span>Projects</span>
			</a>

			<!-- Explore -->
			<a
				href={resolve('/dashboard/explore')}
				class="header-nav-button pei-button pei1 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-700 px-3 py-2 text-sm transition-colors hover:bg-primary-600"
				class:bg-primary-600={page.url.pathname.startsWith('/dashboard/explore')}
			>
				<Compass size={20} />
				<span>Explore</span>
			</a>

			<!-- Market -->
			<a
				href={resolve('/dashboard/market')}
				class="header-nav-button pei-button pei1 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-700 px-3 py-2 text-sm transition-colors hover:bg-primary-600"
				class:bg-primary-600={page.url.pathname.startsWith('/dashboard/market')}
			>
				<Store size={20} />
				<span>Market</span>
			</a>

			<!-- Club -->
			<a
				href={resolve('/dashboard/clubs')}
				class="header-nav-button pei-button pei1 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-700 px-3 py-2 text-sm transition-colors hover:bg-primary-600"
				class:bg-primary-600={page.url.pathname.startsWith('/dashboard/clubs')}
			>
				<Users size={20} />
				<span>Club</span>
			</a>

			<!-- Tutorial -->
			<a
				href={resolve('/dashboard/tutorial')}
				class="header-nav-button pei-button pei1 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-700 px-3 py-2 text-sm transition-colors hover:bg-primary-600"
				class:bg-primary-600={page.url.pathname.startsWith('/dashboard/tutorial')}
			>
				<BookOpen size={20} />
				<span>Tutorials</span>
			</a>

			<!-- Admin Button -->
			{#if hasAdminAccess}
				<button
					bind:this={adminButtonElement}
					onclick={() => (showAdminMenu = !showAdminMenu)}
					class="header-nav-button pei-button pei1 flex h-10 items-center justify-center gap-1.5 rounded-lg border-2 border-dotted border-white bg-primary-800 px-3 py-2 text-sm transition-colors hover:bg-primary-700"
				>
					<span>Admin</span>
					<ChevronDown size={16} />
				</button>
			{/if}
		</nav>

		<!-- Right Side - User Profile & Logout -->
		<div class="hidden shrink-0 items-center gap-2 md:flex">
			<!-- User Profile Button -->
			{#if isOnOwnUserPage}
				<div
					class="pei-button pei7 flex h-10 cursor-default items-center gap-2 rounded-lg border-2 border-primary-700 bg-primary-800 px-3 py-2 text-sm"
				>
					<img src={user.profilePicture} alt="User profile pic" class="h-6 w-6 rounded" />
					<div class="hidden text-xs sm:block">
						<p class="truncate font-medium">{user.name.split(' ')[0]}</p>
						<p class="text-gray-400">{Math.floor(user.brick)} brick</p>
					</div>
				</div>
			{:else}
				<a
					href={resolve('/dashboard/users/[id]', { id: `${user.id}` })}
					class="pei-button pei7 flex h-10 items-center gap-2 rounded-lg border-2 border-primary-800 bg-primary-900 px-3 py-2 text-sm transition-colors hover:bg-primary-800"
				>
					<img src={user.profilePicture} alt="User profile pic" class="h-6 w-6 rounded" />
					<div class="hidden text-xs sm:block">
						<p class="truncate font-medium">{user.name.split(' ')[0]}</p>
						<p class="text-gray-400">{Math.floor(user.brick)} brick</p>
					</div>
				</a>
			{/if}

			<!-- Logout Button -->
			<a
				href={resolve('/auth/logout')}
				class="pei-button pei1 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm transition-colors hover:bg-primary-700"
			>
				<LogOut size={20} />
				<span class="hidden md:inline">Logout</span>
			</a>
		</div>

		<div class="flex items-center gap-2 md:hidden">
			{#if isOnOwnUserPage}
				<div
					class="pei-button pei7 flex h-10 w-10 cursor-default items-center justify-center rounded-lg border-2 border-primary-700 bg-primary-800"
					aria-label="Your profile"
				>
					<img src={user.profilePicture} alt="User profile pic" class="h-6 w-6 rounded" />
				</div>
			{:else}
				<a
					href={resolve('/dashboard/users/[id]', { id: `${user.id}` })}
					class="pei-button pei7 flex h-10 w-10 items-center justify-center rounded-lg border-2 border-primary-800 bg-primary-900"
					aria-label="Your profile"
				>
					<img src={user.profilePicture} alt="User profile pic" class="h-6 w-6 rounded" />
				</a>
			{/if}
			<button
				class="header-nav-button pei-button pei1 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-700"
				onclick={() => (showMobileMenu = !showMobileMenu)}
				aria-label="Toggle menu"
				aria-expanded={showMobileMenu}
			>
				{#if showMobileMenu}
					<X size={20} />
				{:else}
					<Menu size={20} />
				{/if}
			</button>
		</div>

		{#if showMobileMenu}
			<div
				class="absolute top-full left-0 z-[60] w-full border-t border-gray-700 bg-gray-900/95 p-3 backdrop-blur-sm md:hidden"
			>
				<div class="grid grid-cols-2 gap-2">
					<a
						href={resolve('/dashboard')}
						class="header-nav-button pei-button pei1 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-700 px-3 text-sm"
						onclick={() => (showMobileMenu = false)}
					>
						<House size={18} />
						<span>Home</span>
					</a>
					<a
						href={resolve('/dashboard/projects')}
						class="header-nav-button pei-button pei1 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-700 px-3 text-sm"
						onclick={() => (showMobileMenu = false)}
					>
						<PencilRuler size={18} />
						<span>Projects</span>
					</a>
					<a
						href={resolve('/dashboard/explore')}
						class="header-nav-button pei-button pei1 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-700 px-3 text-sm"
						onclick={() => (showMobileMenu = false)}
					>
						<Compass size={18} />
						<span>Explore</span>
					</a>
					<a
						href={resolve('/dashboard/market')}
						class="header-nav-button pei-button pei1 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-700 px-3 text-sm"
						onclick={() => (showMobileMenu = false)}
					>
						<Store size={18} />
						<span>Market</span>
					</a>
					<a
						href={resolve('/dashboard/clubs')}
						class="header-nav-button pei-button pei1 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-700 px-3 text-sm"
						onclick={() => (showMobileMenu = false)}
					>
						<Users size={18} />
						<span>Club</span>
					</a>
					<a
						href={resolve('/dashboard/tutorial')}
						class="header-nav-button pei-button pei1 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-700 px-3 text-sm"
						onclick={() => (showMobileMenu = false)}
					>
						<BookOpen size={18} />
						<span>Tutorials</span>
					</a>
				</div>

				{#if hasAdminAccess}
					<div class="mt-2">
						<button
							class="header-nav-button pei-button pei1 flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dotted border-white bg-primary-800 px-3 text-sm"
							onclick={() => (showMobileAdminMenu = !showMobileAdminMenu)}
							aria-expanded={showMobileAdminMenu}
						>
							<span>Admin</span>
							<ChevronDown size={16} />
						</button>
						{#if showMobileAdminMenu}
							<div class="mt-2 grid grid-cols-1 gap-2">
								{#if user.isPrinter}
									<a
										href={resolve('/dashboard/admin/print')}
										class="header-nav-button pei-button pei1 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-700 px-3 text-sm"
										onclick={() => (showMobileMenu = false)}
									>
										<Box size={16} />
										<span>Print</span>
									</a>
								{/if}
								{#if user.hasT1Review}
									<a
										href={resolve('/dashboard/admin/review')}
										class="header-nav-button pei-button pei1 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-700 px-3 text-sm"
										onclick={() => (showMobileMenu = false)}
									>
										<ClipboardPen size={16} />
										<span>Review</span>
									</a>
								{/if}
								{#if user.hasT2Review}
									<a
										href={resolve('/dashboard/admin/ysws-review')}
										class="header-nav-button pei-button pei1 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-700 px-3 text-sm"
										onclick={() => (showMobileMenu = false)}
									>
										<ClipboardPenLine size={16} />
										<span>YSWS Review</span>
									</a>
								{/if}
								{#if user.hasAdmin}
									<a
										href={resolve('/dashboard/admin/admin')}
										class="header-nav-button pei-button pei1 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-700 px-3 text-sm"
										onclick={() => (showMobileMenu = false)}
									>
										<ShieldUser size={16} />
										<span>Admin</span>
									</a>
								{/if}
							</div>
						{/if}
					</div>
				{/if}

				<a
					href={resolve('/auth/logout')}
					class="header-nav-button pei-button pei1 mt-2 flex h-10 items-center justify-center gap-1.5 rounded-lg bg-primary-600 px-3 text-sm"
				>
					<LogOut size={18} />
					<span>Logout</span>
				</a>
			</div>
		{/if}

		<!-- Admin Dropdown Menu - Outside nav to avoid overflow clipping -->
		{#if showAdminMenu && hasAdminAccess}
			<div
				class="absolute top-full z-[60] mt-2 hidden w-48 rounded-lg border border-gray-700 bg-gray-800 shadow-lg md:block"
				style="left: {dropdownPosition.left};"
			>
				{#if user.isPrinter}
					<a
						href={resolve('/dashboard/admin/print')}
						class="flex items-center gap-2 px-3 py-2 text-sm text-white transition-colors first:rounded-t-lg hover:bg-gray-700"
						onclick={() => (showAdminMenu = false)}
					>
						<Box size={16} />
						Print
					</a>
				{/if}
				{#if user.hasT1Review}
					<a
						href={resolve('/dashboard/admin/review')}
						class="flex items-center gap-2 px-3 py-2 text-sm text-white transition-colors hover:bg-gray-700"
						onclick={() => (showAdminMenu = false)}
					>
						<ClipboardPen size={16} />
						Review
					</a>
				{/if}
				{#if user.hasT2Review}
					<a
						href={resolve('/dashboard/admin/ysws-review')}
						class="flex items-center gap-2 px-3 py-2 text-sm text-white transition-colors hover:bg-gray-700"
						onclick={() => (showAdminMenu = false)}
					>
						<ClipboardPenLine size={16} />
						YSWS Review
					</a>
				{/if}
				{#if user.hasAdmin}
					<a
						href={resolve('/dashboard/admin/admin')}
						class="flex items-center gap-2 px-3 py-2 text-sm text-white transition-colors last:rounded-b-lg hover:bg-gray-700"
						onclick={() => (showAdminMenu = false)}
					>
						<ShieldUser size={16} />
						Admin
					</a>
				{/if}
			</div>
		{/if}
	</div>
</header>
