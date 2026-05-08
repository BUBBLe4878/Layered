import { writable } from 'svelte/store';

export const tutorialStore = writable({
	isOpen: false,
	currentStep: 0,
	hasViewedBefore: false
});

export const steps = [
	{
		title: 'Welcome to Layered',
		description: 'Where makers design, print, and earn rewards.',
		target: null,
		action: 'Click "Next" to begin'
	},
	{
		title: 'Create a Project',
		description: 'Start by creating a new project to organize your design work.',
		target: '[data-tutorial="create-project"]',
		action: 'Look for the "Create Project" button in your dashboard'
	},
	{
		title: 'Upload Your Design',
		description: 'Submit your CAD file (STL, STEP, OBJ, etc.) to your project.',
		target: '[data-tutorial="upload-file"]',
		action: 'Upload your file from your computer'
	},
	{
		title: 'Write a Devlog',
		description: 'Document your design process with photos and notes.',
		target: '[data-tutorial="devlog"]',
		action: 'Add a devlog entry to show your progress'
	},
	{
		title: 'Submit for Review',
		description: 'When ready, submit your design for our team to review and print.',
		target: '[data-tutorial="submit"]',
		action: 'Submit your project when you\'re confident'
	},
	{
		title: 'Get Printed & Earn',
		description: 'Once approved, we\'ll 3D print and ship your design. You earn your reward!',
		target: null,
		action: 'Visit the Marketplace to see what you can unlock'
	}
];

export function openTutorial() {
	tutorialStore.update(state => ({
		...state,
		isOpen: true,
		currentStep: 0
	}));
}

export function closeTutorial() {
	tutorialStore.update(state => ({
		...state,
		isOpen: false
	}));
}

export function nextStep() {
	tutorialStore.update(state => {
		const newStep = state.currentStep + 1;
		if (newStep >= steps.length) {
			return {
				...state,
				isOpen: false,
				hasViewedBefore: true,
				currentStep: newStep
			};
		}
		return {
			...state,
			currentStep: newStep
		};
	});
}

export function skipTutorial() {
	tutorialStore.update(state => ({
		...state,
		isOpen: false,
		hasViewedBefore: true
	}));

	if (typeof window !== 'undefined') {
		localStorage.setItem('tutorialViewed', 'true');
	}
}

export function completeTutorial() {
	tutorialStore.update(state => ({
		...state,
		isOpen: false,
		hasViewedBefore: true
	}));

	if (typeof window !== 'undefined') {
		localStorage.setItem('tutorialViewed', 'true');
	}
}

/**
 * Check if user has viewed tutorial before
 * Returns true if they have, false if it's their first time
 */
export function hasUserViewedTutorial(): boolean {
	if (typeof window === 'undefined') return false;
	return localStorage.getItem('tutorialViewed') === 'true';
}

/**
 * Initialize tutorial state on app load
 * Does NOT auto-open - will open from dashboard instead
 */
export function initializeTutorial() {
	if (typeof window === 'undefined') return;

	const hasViewed = hasUserViewedTutorial();
	tutorialStore.update(state => ({
		...state,
		hasViewedBefore: hasViewed,
		isOpen: false
	}));
}

/**
 * Auto-open tutorial on dashboard for first-time users
 */
export function autoOpenDashboardTutorial() {
	if (typeof window === 'undefined') return;

	const hasViewed = hasUserViewedTutorial();
	if (!hasViewed) {
		openTutorial();
	}
}
