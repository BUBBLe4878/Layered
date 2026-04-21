import {
	BETA_DATE_CUTOFF,
	BETA_MULTIPLIER,
	LAYERS_PER_HOUR,
	CLAY_PER_HOUR,
	PRINT_MINUTES_PER_GRAM
} from './defs';

export function minutesToBenchies(minutes: number) {
	const hours = minutes / 60;

	return hours * CLAY_PER_HOUR;
}

export function minutesToLayers(minutes: number) {
	const hours = minutes / 60;

	return hours * LAYERS_PER_HOUR;
}

export function calculateMinutes(timeSpent: number, printGrams: number) {
	return timeSpent - printGrams * PRINT_MINUTES_PER_GRAM;
}

export function calculateCurrencyPayout(
	minutes: number,
	hasBasePrinter: boolean,
	dateCreated: Date
) {
	return dateCreated.getTime() < BETA_DATE_CUTOFF.getTime()
		? { benchies: null, layers: minutesToLayers(minutes) * BETA_MULTIPLIER }
		: hasBasePrinter
			? { benchies: null, layers: minutesToLayers(minutes) }
			: { benchies: minutesToBenchies(minutes), layers: null };
}

export function calculatePayouts(
	timeSpent: number,
	printGrams: number,
	shopScore: number,
	hasBasePrinter: boolean,
	dateCreated: Date
) {
	const time = calculateMinutes(timeSpent, printGrams);
	const currency = calculateCurrencyPayout(time, hasBasePrinter, dateCreated);

	return { ...currency, shopScore };
}
