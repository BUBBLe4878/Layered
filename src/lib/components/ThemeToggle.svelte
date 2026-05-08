<script lang="ts">
	import { Moon, Sun } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let isDarkMode = $state(false);
	let isReady = $state(false);

	onMount(() => {
		// Check localStorage for saved preference
		const saved = localStorage.getItem('theme-mode');
		if (saved === 'dark') {
			isDarkMode = true;
			applyTheme(true);
		} else {
			isDarkMode = false;
			applyTheme(false);
		}
		isReady = true;
	});

	function applyTheme(dark: boolean) {
		if (dark) {
			document.body.classList.add('dark-mode');
			localStorage.setItem('theme-mode', 'dark');
		} else {
			document.body.classList.remove('dark-mode');
			localStorage.setItem('theme-mode', 'light');
		}
	}

	function toggleTheme() {
		isDarkMode = !isDarkMode;
		applyTheme(isDarkMode);
	}
</script>

<div class="space-y-4">
	<div>
		<h3 class="text-lg font-bold mb-3">Theme</h3>
		<div class="flex gap-3">
			<!-- Light Mode Button -->
			<button
				on:click={() => !isDarkMode && toggleTheme()}
				class="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-300 font-medium"
				class:border-primary-600={!isDarkMode}
				class:bg-primary-100={!isDarkMode}
				class:text-primary-900={!isDarkMode}
				class:border-gray-300={isDarkMode}
				class:bg-white={isDarkMode}
				class:text-gray-700={isDarkMode}
				class:dark:border-gray-600={isDarkMode}
				class:dark:bg-gray-800={isDarkMode}
				class:dark:text-gray-300={isDarkMode}
			>
				<Sun size={18} />
				<span>Light</span>
			</button>

			<!-- Dark Mode Button -->
			<button
				on:click={() => isDarkMode && toggleTheme()}
				class="flex-1 flex items-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-300 font-medium"
				class:border-primary-600={isDarkMode}
				class:bg-gray-800={isDarkMode}
				class:text-white={isDarkMode}
				class:border-gray-300={!isDarkMode}
				class:bg-gray-100={!isDarkMode}
				class:text-gray-600={!isDarkMode}
			>
				<Moon size={18} />
				<span>Dark</span>
			</button>
		</div>
		<p class="text-xs text-gray-500 mt-2">Currently using {isDarkMode ? 'dark' : 'light'} mode</p>
	</div>
</div>
