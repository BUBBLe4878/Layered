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
		X,
		Layers,
		Zap
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

	type NavKey = 'home' | 'projects' | 'explore' | 'market' | 'clubs' | 'tutorial';

	function navButtonClass(key: NavKey, isActive: boolean, compact = false) {
		const base = compact
			? 'header-nav-button pei-button pei1 relative isolate flex h-10 items-center justify-center gap-1.5 rounded-lg px-3 text-sm border'
			: 'header-nav-button pei-button pei1 relative isolate flex h-10 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm border transition-colors';

		if (!isActive) {
			return `${base} border-primary-400/50 bg-primary-700 hover:bg-primary-600`;
		}

		if (key === 'home') {
			return `${base} border-yellow-200/95 bg-yellow-700 ring-2 ring-yellow-200/70 shadow-[0_0_0_2px_rgba(253,224,71,0.35)]`;
		}

		if (key === 'projects') {
			return `${base} border-blue-200/95 bg-blue-700 ring-2 ring-blue-200/70 shadow-[0_0_0_2px_rgba(147,197,253,0.35)]`;
		}

		if (key === 'explore') {
			return `${base} border-cyan-200/95 bg-cyan-700 ring-2 ring-cyan-200/70 shadow-[0_0_0_2px_rgba(165,243,252,0.35)]`;
		}

		if (key === 'market') {
			return `${base} border-orange-200/95 bg-orange-700 ring-2 ring-orange-200/70 shadow-[0_0_0_2px_rgba(254,215,170,0.35)]`;
		}

		if (key === 'clubs') {
			return `${base} border-purple-200/95 bg-purple-700 ring-2 ring-purple-200/70 shadow-[0_0_0_2px_rgba(233,213,255,0.35)]`;
		}

		return `${base} border-red-200/95 bg-red-700 ring-2 ring-red-200/70 shadow-[0_0_0_2px_rgba(254,202,202,0.35)]`;
	}

	function navIndicatorClass(key: NavKey) {
		if (key === 'home') return 'bg-yellow-200';
		if (key === 'projects') return 'bg-blue-200';
		if (key === 'explore') return 'bg-cyan-200';
		if (key === 'market') return 'bg-orange-200';
		if (key === 'clubs') return 'bg-purple-200';
		return 'bg-red-200';
	}
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
				class={navButtonClass('home', page.url.pathname === '/dashboard')}
			>
				<House size={20} />
				<span>Home</span>
				{#if page.url.pathname === '/dashboard'}
					<span class={`pointer-events-none absolute bottom-1 left-1/2 z-10 h-1 w-10 -translate-x-1/2 rounded-full ${navIndicatorClass('home')}`}></span>
				{/if}
			</a>

			<!-- Projects -->
			<a
				href={resolve('/dashboard/projects')}
				class={navButtonClass('projects', page.url.pathname.startsWith('/dashboard/projects'))}
			>
				<PencilRuler size={20} />
				<span>Projects</span>
				{#if page.url.pathname.startsWith('/dashboard/projects')}
					<span class={`pointer-events-none absolute bottom-1 left-1/2 z-10 h-1 w-10 -translate-x-1/2 rounded-full ${navIndicatorClass('projects')}`}></span>
				{/if}
			</a>

			<!-- Explore -->
			<a
				href={resolve('/dashboard/explore')}
				class={navButtonClass('explore', page.url.pathname.startsWith('/dashboard/explore'))}
			>
				<Compass size={20} />
				<span>Explore</span>
				{#if page.url.pathname.startsWith('/dashboard/explore')}
					<span class={`pointer-events-none absolute bottom-1 left-1/2 z-10 h-1 w-10 -translate-x-1/2 rounded-full ${navIndicatorClass('explore')}`}></span>
				{/if}
			</a>

			<!-- Market -->
			<a
				href={resolve('/dashboard/market')}
				class={navButtonClass('market', page.url.pathname.startsWith('/dashboard/market'))}
			>
				<Store size={20} />
				<span>Market</span>
				{#if page.url.pathname.startsWith('/dashboard/market')}
					<span class={`pointer-events-none absolute bottom-1 left-1/2 z-10 h-1 w-10 -translate-x-1/2 rounded-full ${navIndicatorClass('market')}`}></span>
				{/if}
			</a>

			<!-- Club -->
			<a
				href={resolve('/dashboard/clubs')}
				class={navButtonClass('clubs', page.url.pathname.startsWith('/dashboard/clubs'))}
			>
				<Users size={20} />
				<span>Club</span>
				{#if page.url.pathname.startsWith('/dashboard/clubs')}
					<span class={`pointer-events-none absolute bottom-1 left-1/2 z-10 h-1 w-10 -translate-x-1/2 rounded-full ${navIndicatorClass('clubs')}`}></span>
				{/if}
			</a>

			<!-- Tutorial -->
			<a
				href={resolve('/dashboard/tutorial')}
				class={navButtonClass('tutorial', page.url.pathname.startsWith('/dashboard/tutorial'))}
			>
				<BookOpen size={20} />
				<span>Tutorials</span>
				{#if page.url.pathname.startsWith('/dashboard/tutorial')}
					<span class={`pointer-events-none absolute bottom-1 left-1/2 z-10 h-1 w-10 -translate-x-1/2 rounded-full ${navIndicatorClass('tutorial')}`}></span>
				{/if}
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

		<!-- Right Side - Resources & User Profile -->
		<div class="hidden shrink-0 items-center gap-2 md:flex">
			<!-- Layers (Clay) Display -->
			<div
				class="pei-button pei7 flex h-10 cursor-default items-center gap-2 rounded-lg border-2 border-yellow-600 bg-yellow-700 px-3 py-2 text-sm"
				title="Layers"
			>
				<Layers size={16} class="text-yellow-300" />
				<div class="hidden text-xs sm:block">
					<p class="truncate font-medium text-yellow-100">{Math.floor(user.clay)} Layers</p>
				</div>
			</div>

			<!-- Benchies (Brick) Display -->
			<div
				class="pei-button pei7 flex h-10 cursor-default items-center gap-2 rounded-lg border-2 border-yellow-600 bg-yellow-700 px-3 py-2 text-sm"
				title="Benchies"
			>
				<span class="text-lg">🚢</span>
				<div class="hidden text-xs sm:block">
					<p class="truncate font-medium text-yellow-100">{Math.floor(user.brick)} Benchies</p>
				</div>
			</div>

			<!-- User Profile Button -->
			{#if isOnOwnUserPage}
				<div
					class="pei-button pei7 flex h-10 cursor-default items-center gap-2 rounded-lg border-2 border-primary-700 bg-primary-800 px-3 py-2 text-sm"
				>
					<img src={user.profilePicture} alt="User profile pic" class="h-6 w-6 rounded" />
					<div class="hidden text-xs sm:block">
						<p class="truncate font-medium">{user.name.split(' ')[0]}</p>
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
				<div class="mb-3 flex gap-2">
					<!-- Layers (Clay) Display -->
					<div
						class="pei-button pei7 flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-yellow-600 bg-yellow-700 px-3 py-2 text-xs"
						title="Layers"
					>
						<Layers size={14} class="text-yellow-300" />
						<span class="font-medium text-yellow-100">{Math.floor(user.clay)} Layers</span>
					</div>

					<!-- Benchies (Brick) Display -->
					<div
						class="pei-button pei7 flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-yellow-600 bg-yellow-700 px-3 py-2 text-xs"
						title="Benchies"
					>
						<span class="text-lg">🚢</span>
						<span class="font-medium text-yellow-100">{Math.floor(user.brick)} Benchies</span>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-2">
					<a
						href={resolve('/dashboard')}
						class={navButtonClass('home', page.url.pathname === '/dashboard', true)}
						onclick={() => (showMobileMenu = false)}
					>
						<House size={18} />
						<span>Home</span>
						{#if page.url.pathname === '/dashboard'}
							<span class={`pointer-events-none absolute bottom-1 left-1/2 z-10 h-1 w-10 -translate-x-1/2 rounded-full ${navIndicatorClass('home')}`}></span>
						{/if}
					</a>
					<a
						href={resolve('/dashboard/projects')}
						class={navButtonClass(
							'projects',
							page.url.pathname.startsWith('/dashboard/projects'),
							true
						)}
						onclick={() => (showMobileMenu = false)}
					>
						<PencilRuler size={18} />
						<span>Projects</span>
					</a>
					<a
						href={resolve('/dashboard/explore')}
						class={navButtonClass(
							'explore',
							page.url.pathname.startsWith('/dashboard/explore'),
							true
						)}
						onclick={() => (showMobileMenu = false)}
					>
						<Compass size={18} />
						<span>Explore</span>
						{#if page.url.pathname.startsWith('/dashboard/explore')}
							<span class={`pointer-events-none absolute bottom-1 left-1/2 z-10 h-1 w-10 -translate-x-1/2 rounded-full ${navIndicatorClass('explore')}`}></span>
						{/if}
					</a>
					<a
						href={resolve('/dashboard/market')}
						class={navButtonClass('market', page.url.pathname.startsWith('/dashboard/market'), true)}
						onclick={() => (showMobileMenu = false)}
					>
						<Store size={18} />
						<span>Market</span>
						{#if page.url.pathname.startsWith('/dashboard/market')}
							<span class={`pointer-events-none absolute bottom-1 left-1/2 z-10 h-1 w-10 -translate-x-1/2 rounded-full ${navIndicatorClass('market')}`}></span>
						{/if}
					</a>
					<a
						href={resolve('/dashboard/clubs')}
						class={navButtonClass('clubs', page.url.pathname.startsWith('/dashboard/clubs'), true)}
						onclick={() => (showMobileMenu = false)}
					>
						<Users size={18} />
						<span>Club</span>
						{#if page.url.pathname.startsWith('/dashboard/clubs')}
							<span class={`pointer-events-none absolute bottom-1 left-1/2 z-10 h-1 w-10 -translate-x-1/2 rounded-full ${navIndicatorClass('clubs')}`}></span>
						{/if}
					</a>
					<a
						href={resolve('/dashboard/tutorial')}
						class={navButtonClass(
							'tutorial',
							page.url.pathname.startsWith('/dashboard/tutorial'),
							true
						)}
						onclick={() => (showMobileMenu = false)}
					>
						<BookOpen size={18} />
						<span>Tutorials</span>
						{#if page.url.pathname.startsWith('/dashboard/tutorial')}
							<span class={`pointer-events-none absolute bottom-1 left-1/2 z-10 h-1 w-10 -translate-x-1/2 rounded-full ${navIndicatorClass('tutorial')}`}></span>
						{/if}
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
