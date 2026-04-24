<script lang="ts">
	import OrpheusFlag from '../lib/components/OrpheusFlag.svelte';

	import Button from '$lib/components/Button.svelte';
	import Accordion from '$lib/components/Accordion.svelte';
	import Rules from './Rules.svelte';
	import Shop from './Shop.svelte';
	import Footer from './Footer.svelte';

	import model from '$lib/assets/Construct Logo.3mf?url';
	import modelImage from '$lib/assets/model.png';
	import keyringModel from '$lib/assets/keyring.3mf?url';
	import sticker1Image from '$lib/assets/sticker1.png';
	import sticker2Image from '$lib/assets/sticker2.png';

	let { data } = $props();

	import * as THREE from 'three';
	import { ThreeMFLoader, OrbitControls } from 'three/examples/jsm/Addons.js';
	import { onMount } from 'svelte';
	import Head from '$lib/components/Head.svelte';
	import Spinny3DPreview from '$lib/components/Spinny3DPreview.svelte';

	let degree = Math.PI / 180;
	let showStickersSection = $state(false);
	let keyringInitialized = false;

	const scene = new THREE.Scene();

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		const ref = urlParams.get('ref');

		if (ref) {
			document.cookie = 'ref=' + ref + '; path=/';
		}

		if (!model) {
			return;
		}

		let canvas = document.querySelector(`#canvas`);

		if (!canvas) {
			return;
		}

		const renderer = new THREE.WebGLRenderer({
			canvas,
			antialias: true,
			alpha: true
		});

		renderer.setClearColor(0xffffff, 0);
		renderer.setPixelRatio(window.devicePixelRatio);

		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		// There's no reason to set the aspect here because we're going
		// to set it every frame anyway so we'll set it to 2 since 2
		// is the the aspect for the canvas default size (300w/150h = 2)
		const camera = new THREE.PerspectiveCamera(40, 2, 1, 1000);
		camera.rotation.x = -45 * degree;

		// Add controls, targetting the same DOM element
		let controls = new OrbitControls(camera, renderer.domElement);
		controls.target.set(0, 0, 0);
		controls.rotateSpeed = 0.6;
		controls.enablePan = false;
		controls.dampingFactor = 0.1;
		controls.enableDamping = true;
		controls.autoRotate = false;
		controls.autoRotateSpeed = 2;
		controls.update();

		// Lighting
		const hemisphere = new THREE.HemisphereLight(0xffffff, 0xffffff, 4);
		scene.add(hemisphere);

		const directional = new THREE.DirectionalLight(0xffffff, 1);
		directional.castShadow = true;
		directional.shadow.mapSize.width = 2048;
		directional.shadow.mapSize.height = 2048;
		scene.add(directional);

		const directional2 = new THREE.DirectionalLight(0xffffff, 1);
		directional2.castShadow = true;
		directional2.shadow.mapSize.width = 2048;
		directional2.shadow.mapSize.height = 2048;
		scene.add(directional2);

		function resizeCanvasToDisplaySize() {
			const canvas = renderer.domElement;
			const width = canvas.clientWidth;
			const height = canvas.clientHeight;
			if (canvas.width !== width || canvas.height !== height) {
				// you must pass false here or three.js sadly fights the browser
				renderer.setSize(width, height, false);
				renderer.setPixelRatio(window.devicePixelRatio);
				camera.aspect = width / height;
				camera.updateProjectionMatrix();
			}
		}

		// var meshMaterial = new THREE.MeshStandardMaterial({
		// 	transparent: true,
		// 	opacity: 1,
		// 	color: 0xb2a090,
		// 	roughness: 0.5,
		// 	flatShading: false,
		// 	side: THREE.DoubleSide
		// });

		function parseObject(object: THREE.Group<THREE.Object3DEventMap>) {
			object = object as THREE.Group<THREE.Object3DEventMap> & { children: THREE.Mesh[] };

			object.rotation.x = THREE.MathUtils.degToRad(-90);
			// object.rotation.z = THREE.MathUtils.degToRad(-25);

			const aabb = new THREE.Box3().setFromObject(object);
			const center = aabb.getCenter(new THREE.Vector3());

			object.position.x += object.position.x - center.x;
			object.position.y += object.position.y - center.y;
			object.position.z += object.position.z - center.z;

			controls.reset();

			var box = new THREE.Box3().setFromObject(object);
			const size = new THREE.Vector3();
			box.getSize(size);
			const largestDimension = Math.max(size.x, size.y, size.z);

			camera.position.z = largestDimension * 0.3;
			camera.position.y = largestDimension * 1.38;

			directional.position.set(largestDimension * 2, largestDimension * 2, largestDimension * 2);
			directional2.position.set(-largestDimension * 2, largestDimension * 2, -largestDimension * 2);

			camera.near = largestDimension * 0.001;
			camera.far = largestDimension * 10;
			camera.updateProjectionMatrix();

			const edgeLines: { lines: THREE.LineSegments; mesh: THREE.Mesh }[] = [];

			object.traverse(function (child) {
				child.castShadow = true;
				child.receiveShadow = true;

				const mesh = child as THREE.Mesh;

				// const material = mesh.material;

				// if (Array.isArray(material)) {
				// 	material.forEach((mat) => {
				// 		mat.transparent = true;
				// 		mat.side = THREE.DoubleSide;
				// 		mat.opacity = 0.9;
				// 		mat.needsUpdate = true;
				// 	});
				// } else if (material instanceof THREE.Material) {
				// 	material.transparent = true;
				// 	material.side = THREE.DoubleSide;
				// 	material.opacity = 0.9;
				// 	material.needsUpdate = true;
				// }

				// if (Array.isArray(mesh.material)) {
				// 	mesh.material = meshMaterial;
				// } else if (mesh.material instanceof THREE.Material) {
				// 	mesh.material = meshMaterial;
				// }

				const edges = new THREE.EdgesGeometry(mesh.geometry);
				const lines = new THREE.LineSegments(
					edges,
					new THREE.LineBasicMaterial({
						color: 0xf3dcc6,
						linewidth: 1,
						polygonOffset: true,
						polygonOffsetFactor: -1,
						polygonOffsetUnits: -1
					})
				);

				lines.position.copy(mesh.position);
				lines.rotation.copy(mesh.rotation);

				edgeLines.push({ lines, mesh });
			});

			// Have to do it this way to avoid infinite recursion
			edgeLines.forEach(({ lines, mesh }) => {
				mesh.add(lines);
			});

			scene.add(object);
		}

		var loader = new ThreeMFLoader();

		loader.load(
			model,
			parseObject,
			(xhr) => {
				// TODO: loading slider
				console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
			},
			(error) => {
				console.log(error);
			}
		);

		const animate = function () {
			requestAnimationFrame(animate);
			controls.update();
			renderer.render(scene, camera);
			resizeCanvasToDisplaySize();
		};
		animate();
	});
</script>

<Head title="" />

{#if !showStickersSection}
	<button
		class="button md primary absolute top-4 right-4 z-50 animate-[bounce_2s_infinite]"
		onclick={() => {
			keyringInitialized = false;
			showStickersSection = !showStickersSection;
		}}
	>
		Free stickers + keyring!
	</button>
{/if}

{#if showStickersSection}
	<div
		class="fixed inset-0 z-1000 flex items-center justify-center bg-black/70 p-4"
		role="dialog"
		aria-modal="true"
		tabindex="0"
		onclick={(e) => {
			if (e.target === e.currentTarget) {
				showStickersSection = false;
			}
		}}
		onkeydown={(e) => e.key === 'Escape' && (showStickersSection = false)}
	>
		<div
			class="relative max-h-[95vh] w-full max-w-5xl overflow-y-auto rounded-lg border-3 border-primary-900 bg-primary-950 p-8 shadow-2xl"
			role="document"
			tabindex="-1"
		>
			<button
				class="button md primary absolute top-4 right-4 z-10"
				onclick={() => (showStickersSection = false)}
				aria-label="Close dialog"
			>
				Close
			</button>

			<div class="mx-auto max-w-4xl">
				<div class="mb-8 text-center">
					<h2 class="mb-2 text-2xl font-bold sm:text-3xl">Free swag with your first submission</h2>
					<p class="text-lg font-medium text-primary-300">
						Ship a project, get exclusive Layered goodies
					</p>
				</div>

				<div class="grid gap-6 sm:grid-cols-2">
					<div class="themed-box p-6">
						<div
							class="mb-4 flex h-56 items-center justify-center gap-3 overflow-hidden rounded-lg border-2 border-primary-900 bg-primary-900"
						>
							<img
								src={sticker1Image}
								alt="Layered sticker 1"
								class="h-40 w-40 animate-[spin_20s_linear_infinite] object-contain"
								style="animation-direction: normal;"
							/>
							<img
								src={sticker2Image}
								alt="Layered sticker 2"
								class="h-40 w-40 animate-[spin_20s_linear_infinite] object-contain"
								style="animation-direction: reverse;"
							/>
						</div>
						<div class="text-center">
							<h3 class="mb-2 text-xl font-bold">Sticker Pack</h3>
							<p class="text-sm text-primary-300">yay stickers!!!</p>
						</div>
					</div>

					<div class="themed-box p-6">
						<div
							class="mb-4 flex h-56 items-center justify-center overflow-hidden rounded-lg border-2 border-primary-900 bg-primary-900"
						>
							<Spinny3DPreview
								identifier="keyring"
								modelUrl={keyringModel}
								sizeCutoff={8 * 1024 * 1024}
								respectLocalStorage={false}
							/>
						</div>
						<div class="text-center">
							<h3 class="mb-2 text-xl font-bold">Layered Keychain</h3>
							<p class="text-sm text-primary-300">
								even more yay keyring
								<img
									src="https://emoji.slack-edge.com/T09V59WQY1E/yayayayayay/203666b7424ee7a7.gif"
									alt="yay"
									class="inline h-6"
								/>
							</p>
						</div>
					</div>
				</div>

				<div class="themed-box mt-6 p-6 text-center">
					<p class="font-medium">Ship your first project and we'll mail these to you!</p>
				</div>
			</div>
		</div>
	</div>
{/if}

<OrpheusFlag />

<div class="flex w-full flex-col items-center justify-center px-10 lg:flex-row">
	<div class="mt-30">
		<div class="relative z-1 flex flex-row">
			<a
				class="mb-1 flex h-7 shrink flex-row items-center gap-2 pr-2 transition-opacity hover:opacity-50"
				href="https://hackclub.com"
			>
				<img src="https://assets.hackclub.com/icon-rounded.svg" alt="Hack Club logo" class="h-7" />
				<p class="text-lg font-semibold">
					<span class="font-bold text-hc-red-500">Hack Club</span> presents...
				</p>
			</a>
		</div>
		<div class="hidden sm:block">
			<div
				class="group z-0 flex flex-col overflow-clip transition-all hover:h-130 sm:h-25 sm:w-150 md:h-30 md:w-160 lg:h-35 lg:w-200"
			>
				<canvas
					class="h-200 w-full transition-transform sm:translate-y-[-255px] sm:group-hover:-translate-y-15 md:translate-y-[-255px] md:group-hover:-translate-y-15 lg:translate-y-[-330px] lg:group-hover:-translate-y-35"
					width="200"
					height="200"
					id={`canvas`}
				></canvas>
			</div>
			<p class="relative z-1 mt-2 w-full animate-pulse text-center text-sm">interact with me!</p>
		</div>
		<img src={modelImage} alt="Layered model logo" class="mt-3 mb-6 sm:hidden" />
		<div class="relative z-1 w-full text-center">
			<p class="my-3 text-xl font-medium">Spend 40 hours doing CAD projects, get a 3D printer!</p>
			{#if data.loggedIn}
				<Button text="Go to dashboard" href="/dashboard" />
			{:else}
				<Button text="Login with Hack Club" href="/auth/idv" />
			{/if}
			<p class="text-md my-3">Ages 13-18, ending April 19th!</p>
		</div>
	</div>
</div>

<div class="mt-24 flex flex-col items-center justify-center px-10">
	<h1 class="mb-3 text-center text-3xl font-bold sm:text-4xl">What is this?</h1>
	<div class="w-full max-w-2xl">
		<p class="mt-3 max-w-2xl">
			<strong>Want a 3D printer?</strong> Spend 40 hours doing CAD projects, get a free 3D printer of
			your choice! Every approved hour earns Layers.
		</p>
	</div>
</div>

<!-- <Shop /> -->

<Rules idvDomain={data.idvDomain} />

<div class="mt-20 flex flex-col items-center justify-center px-10">
	<h1 class="mb-3 text-center text-2xl font-bold sm:text-4xl">Frequently asked questions</h1>
	<div class="w-full max-w-2xl">
		<!-- What is Layered? -->
		<Accordion text="What is Layered?">
			<p>
				Layered is a YSWS where you design CAD projects and earn rewards—up to receiving and upgrading
				your own 3D printer. Start by creating a project at layered.hackclub.com.
			</p>
		</Accordion>

		<!-- When does Layered end? -->
		<Accordion text="When does Layered end?">
			<p>The program ends on April 19th. Submit your project before the deadline.</p>
		</Accordion>

		<!-- How do prizes work? -->
		<Accordion text="How do prizes work?">
			<p>
				You earn 1 Layer per hour of logged and approved work. Layers are the primary currency and can
				be used to redeem a 3D printer (starting at 40 Layers).
			</p>
			<p class="mt-3">After redeeming a printer, you unlock:</p>
			<ul class="ml-5 mt-2 list-disc space-y-1">
				<li>Printer upgrades</li>
				<li>Items in the PrintShop</li>
				<li>Advanced rewards</li>
			</ul>
			<p class="mt-3">If you don't want a printer, you will continue earning Layers and can get stuff from the shop.</p>
		</Accordion>

		<!-- Printer Upgrades -->
		<Accordion text="Can I upgrade my printer?">
			<p>Yes! You can upgrade your printer over time using Benchies. Example path:</p>
			<ul class="ml-5 mt-2 list-disc space-y-1">
				<li>Base printer (e.g., A1 Mini) → 400 Layers</li>
				<li>Add AMS Lite → 5000 Layers</li>
				<li>Upgrade to A1 → +3400 Layers</li>
			</ul>
			<p class="mt-3">Multiple brands and upgrade paths are available.</p>
		</Accordion>

		<!-- How many projects can I make? -->
		<Accordion text="How many projects can I make?">
			<p>Unlimited, as long as:</p>
			<ul class="ml-5 mt-2 list-disc space-y-1">
				<li>Each project meets the 2-hour minimum</li>
				<li>Each follows the rules</li>
			</ul>
			<p class="mt-3">
				Longer projects earn more experience, which reduces prices in the PrintShop. You may also extend
				a finished project by creating a new version based on it (v2, v3, etc.), but copying projects
				1:1 is not allowed.
			</p>
		</Accordion>

		<!-- How do I track my time? -->
		<Accordion text="How do I track my time?">
			<p>Each project includes a journal where you can:</p>
			<ul class="ml-5 mt-2 list-disc space-y-1">
				<li>Log your time and describe your progress</li>
				<li>Entries are capped at 1.5 hours</li>
				<li>You can only log time since your last entry</li>
			</ul>
			<p class="mt-3">
				Alternatively, use lapse.hackclub.com which automatically tracks time, descriptions, and images.
				This bypasses journal limits and is preferred.
			</p>
		</Accordion>

		<!-- Streak System -->
		<Accordion text="What's the streak system?">
			<p>
				Daily work builds a streak. Longer streaks may provide bonuses or multipliers. Missing a day
				resets your streak.
			</p>
		</Accordion>

		<!-- First Project Reward -->
		<Accordion text="Is there a reward for my first project?">
			<p>Yes! After you successfully ship your first project, you receive a Layered keychain + stickers.</p>
		</Accordion>

		<!-- Weekly Awards & Leaderboard -->
		<Accordion text="Are there weekly awards?">
			<p>
				Each week, staff select top projects across categories and the community votes on finalists.
				Winners receive bonus Layers/Benchies.
			</p>
			<p class="mt-3">A leaderboard tracks:</p>
			<ul class="ml-5 mt-2 list-disc space-y-1">
				<li>Total Layers earned</li>
				<li>Experience</li>
				<li>Project count</li>
			</ul>
		</Accordion>

		<!-- What can I make? -->
		<Accordion text="What can I make?">
			<p>
				Projects must have a clear purpose and be primarily 3D-printable. We want to see you learning
				something new on each project.
			</p>
			<p class="mt-3 font-semibold">Allowed:</p>
			<ul class="ml-5 list-disc space-y-1">
				<li>Functional toys</li>
				<li>Scale models (cars, planes, tanks)</li>
				<li>Wind-powered devices</li>
			</ul>
			<p class="mt-3 font-semibold">Not recommended:</p>
			<ul class="ml-5 list-disc space-y-1">
				<li>Dummy boards (ESP32, Raspberry Pi)</li>
				<li>Cases (phones, Raspberry Pi, etc.)</li>
			</ul>
			<p class="mt-3 font-semibold">Not allowed:</p>
			<ul class="ml-5 list-disc space-y-1">
				<li>Weapons of any kind</li>
				<li>Dummy phones</li>
				<li>Projects requiring non-printed components (except standard nuts/bolts up to M6)</li>
				<li>Custom PCB cases</li>
				<li>Drones</li>
			</ul>
			<p class="mt-3">If unsure, ask in #layered-help</p>
		</Accordion>

		<!-- What is experience? -->
		<Accordion text="What is experience?">
			<p>
				Experience rewards higher-effort projects and reduces prices in the PrintShop. It also unlocks
				access to special items and systems.
			</p>
			<p class="mt-3">Rules:</p>
			<ul class="ml-5 mt-2 list-disc space-y-1">
				<li>Cumulative (never resets)</li>
				<li>Max: 60 per hour</li>
				<li>Longer projects earn more total experience</li>
			</ul>
		</Accordion>

		<!-- The Underground Market -->
		<Accordion text="What is the Underground Market?">
			<p>
				High-experience users may gain access to a hidden shop with exclusive printer upgrades,
				limited-edition parts or mods, discounted high-tier items, and experimental rewards.
			</p>
			<p class="mt-3">Possible mechanics include rotating inventory, invite-only or experience threshold access, and hidden deals that appear randomly.</p>
		</Accordion>

		<!-- Are group projects allowed? -->
		<Accordion text="Are group projects allowed?">
			<p>No. All projects must be individual.</p>
		</Accordion>

		<!-- Are remixes allowed? -->
		<Accordion text="Are remixes allowed?">
			<p>
				No direct remixes. You may create your own version as long as it is not copied step-by-step from
				a tutorial.
			</p>
		</Accordion>

		<!-- Can I continue an existing project? -->
		<Accordion text="Can I continue an existing project?">
			<p>No. Each project must be new.</p>
		</Accordion>

		<!-- Do I have to build my project? -->
		<Accordion text="Do I have to build my project?">
			<p>Yes. A project must be physically produced to count. This can happen by:</p>
			<ul class="ml-5 mt-2 list-disc space-y-1">
				<li>Someone posting a make of your design</li>
				<li>You printing it yourself</li>
				<li>Us printing it for you (default)</li>
			</ul>
			<p class="mt-3">Printing costs are deducted from your earnings based on filament usage at 2 cents per gram, with no real money charged.</p>
		</Accordion>

		<!-- What happens if I cheat? -->
		<Accordion text="What happens if I cheat?">
			<p>
				Fraud results in removal from this and future programs, plus loss of all currency and projects.
				Appeals must be made via DM to the team.
			</p>
		</Accordion>

		<!-- What software is supported? -->
		<Accordion text="What software is supported?">
			<p>The following CAD software is supported:</p>
			<ul class="ml-5 mt-2 list-disc space-y-1">
				<li>Fusion 360</li>
				<li>Onshape</li>
				<li>Shapr3D</li>
				<li>SolidWorks</li>
				<li>FreeCAD</li>
				<li>OpenSCAD</li>
				<li>Blender</li>
				<li>SolveSpace</li>
			</ul>
			<p class="mt-3">No other CAD software is supported.</p>
		</Accordion>

		<!-- I'm new to CAD -->
		<Accordion text="I'm new to CAD—does that matter?">
			<p>
				Beginners are welcome! Note that only active work counts toward hours. Time spent watching
				tutorials or researching does not count.
			</p>
		</Accordion>

		<!-- Who runs this? -->
		<Accordion text="Who runs this?">
			<p class="space-y-2">
				<span class="block"><strong>@Dr_Fishface</strong> - Founder of Layered (art and stuff)</span>
				<span class="block"><strong>@StephenFromColorado</strong> - Co-founder (Website, Backend)</span>
				<span class="block"><strong>@HackerMan</strong> - Logistics, website, reviews</span>
				<span class="block"><strong>@arc</strong> - Help with various tasks</span>
				<span class="block"><strong>@Anirudh</strong> - Support</span>
				<span class="block"><strong>@Anay</strong> - Moral support, reviews, fraud checks</span>
			</p>
		</Accordion>

		<!-- Rejections & Feedback -->
		<Accordion text="What if my project is rejected?">
			<p>If your project is rejected, you will receive:</p>
			<ul class="ml-5 mt-2 list-disc space-y-1">
				<li>A specific reason for rejection</li>
				<li>The reviewer's name</li>
				<li>The ability to DM them with questions</li>
			</ul>
			<p class="mt-3">
				You can fix and resubmit your project. You can also get feedback early in #layered-help before
				submitting.
			</p>
		</Accordion>

		<!-- Troubleshooting -->
		<Accordion text="File format not supported on Printables">
			<p>Upload files under Model Files and include both .STEP and .STL formats.</p>
		</Accordion>

		<Accordion text="Project file too large">
			<p>Upload to Google Drive (or similar) and provide a link in your submission.</p>
		</Accordion>

		<!-- Is this free? -->
		<Accordion text="Is this free?">
			<p>
				Yes! This program is entirely funded by <a href="https://hackclub.com" class="underline">
					Hack Club
				</a>, a US-based 501(c)(3) charity helping teens learn how to design and code, with sponsors
				such as <a href="https://github.com" class="underline">GitHub</a>.
			</p>
		</Accordion>

		<!-- Requirements to participate -->
		<Accordion text="What are the requirements to participate?">
			<p>
				You must be between the ages 13-18 and have verified your identity on our <a
					href={`https://${data.idvDomain}`}
					class="underline"
				>
					identity platform
				</a>.
			</p>
		</Accordion>
	</div>
</div>

<div class="mt-15 mb-30 flex flex-col items-center justify-center gap-5 px-10">
	<h1 class="text-center text-3xl font-bold sm:text-4xl">Ready?</h1>
	<div class="w-full max-w-2xl text-center">
		{#if data.loggedIn}
			<Button text="Go to dashboard" href="/dashboard" />
		{:else}
			<Button text="Login with Hack Club" href="/auth/idv" />
		{/if}
	</div>
</div>

<Footer />
