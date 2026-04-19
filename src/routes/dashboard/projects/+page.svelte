<script lang="ts">
	import { Lock, ExternalLink, Link, Download, Search, X } from '@lucide/svelte';
	import relativeDate from 'tiny-relative-date';

	export let data: PageData;

	const { projects, s3PublicUrl } = data;

	// ── Filter definitions ──────────────────────────────────────────
	const FILTERS = [
		{ key: 'all', label: 'All' },
		{ key: 'building', label: 'Building' },
		{ key: 'submitted', label: 'Submitted' },
		{ key: 't1_approved', label: 'Approved / Queue' },
		{ key: 'printing', label: 'Being Printed' },
		{ key: 'printed', label: 'Printed' },
		{ key: 'finalized', label: 'Finalized' }
	] as const;

	type FilterKey = (typeof FILTERS)[number]['key'];

	// ── State ───────────────────────────────────────────────────────
	let searchQuery = '';
	let activeFilter: FilterKey = 'all';
	let selectedProjectId: number | null = null;

	// ── Derived filtered list ───────────────────────────────────────
	$: filteredProjects = projects.filter((p) => {
		const matchesFilter = activeFilter === 'all' || p.status === activeFilter;
		const q = searchQuery.toLowerCase().trim();
		const matchesSearch =
			q === '' ||
			p.name.toLowerCase().includes(q) ||
			(p.description ?? '').toLowerCase().includes(q);
		return matchesFilter && matchesSearch;
	});

	// ── Auto-select first project when filtered ─────────────────────
	$: if (
		filteredProjects.length > 0 &&
		(!selectedProjectId || !filteredProjects.find((p) => p.id === selectedProjectId))
	) {
		selectedProjectId = filteredProjects[0].id;
	}

	// ── Get selected project ────────────────────────────────────────
	$: selectedProject = projects.find((p) => p.id === selectedProjectId);

	// ── Get last devlog for selected project ────────────────────────
	$: lastDevlog =
		data.devlogs
			?.filter((d) => d.projectId === selectedProjectId)
			?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ??
		null;

	// ── Get last devlog for any project ─────────────────────────────
	$: getLastDevlogForProject = (projectId: number) => {
		return (
			data.devlogs
				?.filter((d) => d.projectId === projectId)
				?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ??
			null
		);
	};

	// ── Helpers ─────────────────────────────────────────────────────
	const isLocked = (project: (typeof projects)[0]) =>
		['printed', 'finalized', 'printing', 'submitted', 't1_approved'].includes(project.status);

	function formatStatus(status: string) {
		return (
			{
				building: 'Building',
				submitted: 'Submitted',
				t1_approved: 'On print queue',
				printing: 'Being printed',
				printed: 'Printed',
				finalized: 'Finalized'
			}[status] ?? status
		);
	}

	function formatTime(minutes: number | string) {
		const m = Number(minutes);
		const h = Math.floor(m / 60);
		const rem = m % 60;
		if (h === 0) return `${rem}min`;
		if (rem === 0) return `${h}h`;
		return `${h}h ${rem}min`;
	}

	function getStatusColor(status: string) {
		const colors: Record<string, string> = {
			building: 'bg-orange-500',
			submitted: 'bg-orange-600',
			t1_approved: 'bg-cyan-500',
			printing: 'bg-orange-500',
			printed: 'bg-primary-600',
			finalized: 'bg-primary-500'
		};
		return colors[status] || 'bg-gray-500';
	}
</script>

<div class="flex h-full flex-col gap-4">
	<!-- ── Header ──────────────────────────────────────────────────── -->
	<div class="flex items-center justify-between">
		<div>
			<h1 class="mt-5 mb-2 font-hero text-3xl font-medium">Projects</h1>
			<h2 class="text-md font-medium text-[#72685e]">
				{data.totalHours}h total ∙ {data.finalHours}h finalized
			</h2>
		</div>
		<a
			href="/dashboard/projects/create"
			class="offset button md -mt-14 block bg-primary-800 text-center hover:bg-primary-700 hover:ring-2 hover:ring-primary-50 lg:inline-block"
		>
			Create project
		</a>
	</div>

	<!-- ── Main Layout: Sidebar + Detail ──────────────────────────── -->
	<div class="flex min-h-0 flex-1 gap-4">
		<!-- ── LEFT SIDEBAR: Project List ──────────────────────────── -->
		<div class="flex w-80 flex-col gap-3 pb-4">
			<!-- Search bar -->
			<div class="relative flex items-center">
				<Search size={15} class="pointer-events-none absolute left-3 text-primary-700" />
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search projects..."
					autocomplete="off"
					spellcheck="false"
					class="themed-input w-full py-2.5 pr-9 pl-9 text-sm"
				/>
				{#if searchQuery}
					<button
						on:click={() => (searchQuery = '')}
						aria-label="Clear search"
						class="absolute right-2 flex items-center justify-center rounded-md p-1 text-primary-700 transition-colors hover:bg-primary-100"
					>
						<X size={13} />
					</button>
				{/if}
			</div>

			<!-- Filter chips -->
			<div class="flex flex-wrap gap-2">
				{#each FILTERS as filter (filter.key)}
					<button
						on:click={() => (activeFilter = filter.key)}
						class="
							rounded-lg border-2 px-2 py-1 text-xs font-semibold transition-colors
							{activeFilter === filter.key
							? 'border-primary-600 bg-primary-700 text-primary-50'
							: 'border-primary-200 bg-primary-50 text-primary-700 hover:border-primary-400 hover:bg-primary-100'}
						"
					>
						{filter.label}
					</button>
				{/each}
			</div>

			<!-- Project count -->
			<p class="text-xs font-medium text-[#72685e]">
				{filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
			</p>

			<!-- Project List -->
			<div class="flex flex-1 flex-col gap-2 overflow-y-auto">
				{#if filteredProjects.length > 0}
					{#each filteredProjects as project (project.id)}
						<button
							on:click={() => (selectedProjectId = project.id)}
							class="
								themed-box text-shadow relative overflow-hidden p-3 text-left transition-all hover:shadow-md
								{selectedProjectId === project.id ? 'shadow-lg ring-2 ring-primary-500' : 'hover:bg-primary-50'}
							"
						>
							{#if getLastDevlogForProject(project.id)}
								<img
									src={getLastDevlogForProject(project.id).image}
									alt="preview"
									class="absolute inset-0 -z-1 h-full w-full object-cover opacity-20"
								/>
							{/if}

							<!-- Status badge -->
							<div class="relative z-1 mb-1 flex items-start justify-between gap-2">
								<h3 class="flex-1 truncate text-sm font-semibold">{project.name}</h3>
								{#if isLocked(project)}
									<Lock size={16} class="mt-0.5 flex-shrink-0" />
								{/if}
							</div>

							<!-- Status + Time -->
							<div class="relative z-1 mb-2 flex items-center gap-2">
								<span
									class={`rounded px-2 py-1 text-xs font-semibold text-white ${getStatusColor(project.status)}`}
								>
									{formatStatus(project.status)}
								</span>
								<span class="text-xs text-[#72685e]">{formatTime(project.timeSpent ?? 0)}</span>
							</div>

							<!-- Description preview -->
							<p class="relative z-1 line-clamp-2 text-xs text-[#72685e]">
								{project.description ?? 'No description'}
							</p>
						</button>
					{/each}
				{:else}
					<div class="themed-box flex flex-col items-center justify-center gap-2 py-8 text-center">
						<Search size={20} class="text-primary-700" />
						<p class="text-xs font-semibold">No projects found</p>
					</div>
				{/if}
			</div>
		</div>

		<!-- ── RIGHT PANEL: Project Details ──────────────────────── -->
		<div class="flex-1 overflow-y-auto pb-4">
			{#if selectedProject}
				<div class="themed-box flex h-full flex-col gap-4 p-5">
					<!-- Header -->
					<div>
						<div class="mb-2 flex items-start justify-between gap-4">
							<h1 class="font-hero text-2xl font-semibold">{selectedProject.name}</h1>
							{#if isLocked(selectedProject)}
								<Lock size={24} title="This project is locked" />
							{/if}
						</div>
						<div class="flex items-center gap-2">
							<span
								class={`rounded px-3 py-1 text-sm font-semibold text-white ${getStatusColor(selectedProject.status)}`}
							>
								{formatStatus(selectedProject.status)}
							</span>
							<span class="text-sm text-[#72685e]"
								>{formatTime(selectedProject.timeSpent ?? 0)} total</span
							>
						</div>
					</div>

					<!-- Image Preview -->
					{#if lastDevlog}
						<div class="overflow-hidden rounded-lg border-3 border-primary-200">
							<img
								src={lastDevlog.image}
								alt="Latest devlog preview"
								class="h-48 w-full object-cover"
							/>
							<div class="bg-primary-50 p-2 text-xs text-[#72685e]">
								Latest: {relativeDate(lastDevlog.createdAt)}
							</div>
						</div>
					{/if}

					<!-- Description -->
					<div>
						<h3 class="mb-1 text-sm font-semibold">About</h3>
						<p class="text-sm text-gray-700">
							{selectedProject.description ?? 'No description provided'}
						</p>
					</div>

					<!-- Links -->
					<div>
						<h3 class="mb-2 text-sm font-semibold">Links</h3>
						<div class="flex flex-col gap-2">
							{#if selectedProject.url}
								<a class="button sm primary" href={selectedProject.url} target="_blank">
									<ExternalLink size={18} /> Printables page
								</a>
							{/if}
							{#if selectedProject.editorFileType === 'upload' && selectedProject.uploadedFileUrl}
								<a
									class="button sm primary"
									href="{s3PublicUrl}/{selectedProject.uploadedFileUrl}"
									target="_blank"
								>
									<Download size={18} /> Project file
								</a>
							{:else if selectedProject.editorFileType === 'url' && selectedProject.editorUrl}
								<a class="button sm primary" href={selectedProject.editorUrl} target="_blank">
									<Link size={18} /> Project link
								</a>
							{/if}
							<a class="button sm primary" href="/dashboard/projects/{selectedProject.id}">
								View devlogs
							</a>
						</div>
					</div>

					<!-- Metadata -->
					<div class="border-t border-primary-200 pt-4">
						<div class="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p class="mb-1 font-medium text-[#72685e]">Created</p>
								<p class="font-semibold">
									<abbr title={selectedProject.createdAt.toUTCString()}>
										{relativeDate(selectedProject.createdAt)}
									</abbr>
								</p>
							</div>
							<div>
								<p class="mb-1 font-medium text-[#72685e]">Time spent</p>
								<p class="font-semibold">{formatTime(selectedProject.timeSpent ?? 0)}</p>
							</div>
						</div>
					</div>
				</div>
			{:else}
				<div class="themed-box flex h-full flex-col items-center justify-center gap-4 p-5">
					<Search size={32} class="text-primary-700" />
					<p class="text-lg font-semibold">Select a project to view details</p>
				</div>
			{/if}
		</div>
	</div>
</div>
