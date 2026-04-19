<script lang="ts">
	import {
		House,
		PencilRuler,
		Compass,
		LogOut,
		ClipboardPen,
		ClipboardPenLine,
		Store,
		ShieldUser,
		Box,
		Users,
		ChevronDown
	} from '@lucide/svelte';
	import { page } from '$app/state';
	import logo from '$lib/assets/logo.png';
	
	let { user } = $props();
	
	let isOnOwnUserPage = $derived(
		page.url.pathname === `/dashboard/users/${user.id}` ||
			page.url.pathname === `/dashboard/users/${user.id}/`
	);
	
	let showAdminMenu = $state(false);
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
</script>

<!-- Top Header Navigation -->
<header class="border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50 relative">
	<div class="flex items-center justify-between gap-4 px-4 py-3">
		
		<!-- Logo -->
		<div class="flex-shrink-0 pr-8 border-r border-gray-700 mr-2">
			<a href="/" class="flex items-center" style="aspect-ratio: {logoAspectRatio};">
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
		<nav class="flex items-center gap-2 overflow-x-auto flex-1">
			<!-- Home -->
			<a 
				href="/dashboard" 
				class="pei-button pei1 flex h-10 items-center rounded-lg justify-center gap-1.5 px-3 py-2 text-sm bg-primary-600 hover:bg-primary-700 transition-colors"
				class:bg-primary-700={page.url.pathname === '/dashboard'}
			>
				<House size={20} />
				<span class="hidden md:inline">Home</span>
			</a>

			<!-- Projects -->
			<a 
				href="/dashboard/projects" 
				class="pei-button pei1 flex h-10 items-center rounded-lg justify-center gap-1.5 px-3 py-2 text-sm bg-primary-700 hover:bg-primary-600 transition-colors"
				class:bg-primary-600={page.url.pathname.startsWith('/dashboard/projects')}
			>
				<PencilRuler size={20} />
				<span class="hidden md:inline">Projects</span>
			</a>

			<!-- Explore -->
			<a 
				href="/dashboard/explore" 
				class="pei-button pei1 flex h-10 items-center rounded-lg justify-center gap-1.5 px-3 py-2 text-sm bg-primary-700 hover:bg-primary-600 transition-colors"
				class:bg-primary-600={page.url.pathname.startsWith('/dashboard/explore')}
			>
				<Compass size={20} />
				<span class="hidden md:inline">Explore</span>
			</a>

			<!-- Market -->
			<a 
				href="/dashboard/market" 
				class="pei-button pei1 flex h-10 items-center rounded-lg justify-center gap-1.5 px-3 py-2 text-sm bg-primary-700 hover:bg-primary-600 transition-colors"
				class:bg-primary-600={page.url.pathname.startsWith('/dashboard/market')}
			>
				<Store size={20} />
				<span class="hidden md:inline">Market</span>
			</a>

			<!-- Club -->
			<a 
				href="/dashboard/clubs" 
				class="pei-button pei1 flex h-10 items-center rounded-lg justify-center gap-1.5 px-3 py-2 text-sm bg-primary-700 hover:bg-primary-600 transition-colors"
				class:bg-primary-600={page.url.pathname.startsWith('/dashboard/clubs')}
			>
				<Users size={20} />
				<span class="hidden md:inline">Club</span>
			</a>

			<!-- Admin Button -->
			{#if user.isPrinter || user.hasT1Review || user.hasT2Review || user.hasAdmin}
				<button 
					bind:this={adminButtonElement}
					onclick={() => (showAdminMenu = !showAdminMenu)}
					class="pei-button pei1 flex h-10 items-center rounded-lg justify-center gap-1.5 px-3 py-2 text-sm bg-primary-800 hover:bg-primary-700 border-2 border-dotted border-white transition-colors"
				>
					<span class="hidden md:inline">Admin</span>
					<ChevronDown size={16} />
				</button>
			{/if}
		</nav>

		<!-- Right Side - User Profile & Logout -->
		<div class="flex items-center gap-2 flex-shrink-0">
			<!-- User Profile Button -->
			<a 
				href={isOnOwnUserPage ? null : `/dashboard/users/${user.id}`}
				class="pei-button pei7 flex h-10 items-center gap-2 px-3 py-2 rounded-lg text-sm border-2 transition-colors {isOnOwnUserPage ? 'border-primary-700 bg-primary-800 cursor-default' : 'border-primary-800 bg-primary-900 hover:bg-primary-800'}"
			>
				<img src={user.profilePicture} alt="User profile pic" class="w-6 h-6 rounded" />
				<div class="hidden sm:block text-xs">
					<p class="font-medium truncate">{user.name.split(' ')[0]}</p>
					<p class="text-gray-400">{Math.floor(user.brick)} brick</p>
				</div>
			</a>

			<!-- Logout Button -->
			<a 
				href="/auth/logout" 
				class="pei-button pei1 flex h-10 items-center rounded-lg justify-center gap-1.5 px-3 py-2 text-sm bg-primary-600 hover:bg-primary-700 transition-colors"
			>
				<LogOut size={20} />
				<span class="hidden md:inline">Logout</span>
			</a>
		</div>

		<!-- Admin Dropdown Menu - Outside nav to avoid overflow clipping -->
		{#if showAdminMenu && (user.isPrinter || user.hasT1Review || user.hasT2Review || user.hasAdmin)}
			<div 
				class="absolute top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-[60]"
				style="left: {dropdownPosition.left};"
			>
				{#if user.isPrinter}
					<a 
						href="/dashboard/admin/print" 
						class="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 first:rounded-t-lg text-sm transition-colors text-white"
						onclick={() => (showAdminMenu = false)}
					>
						<Box size={16} />
						Print
					</a>
				{/if}
				{#if user.hasT1Review}
					<a 
						href="/dashboard/admin/review" 
						class="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 text-sm transition-colors text-white"
						onclick={() => (showAdminMenu = false)}
					>
						<ClipboardPen size={16} />
						Review
					</a>
				{/if}
				{#if user.hasT2Review}
					<a 
						href="/dashboard/admin/ysws-review" 
						class="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 text-sm transition-colors text-white"
						onclick={() => (showAdminMenu = false)}
					>
						<ClipboardPenLine size={16} />
						YSWS Review
					</a>
				{/if}
				{#if user.hasAdmin}
					<a 
						href="/dashboard/admin/admin" 
						class="flex items-center gap-2 px-3 py-2 hover:bg-gray-700 last:rounded-b-lg text-sm transition-colors text-white"
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
