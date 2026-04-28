export function isMissingWeeklyAwardsSchemaError(error: unknown): boolean {
	if (!(error instanceof Error)) return false;

	return (
		error.message.includes('weekly_award_') ||
		error.message.includes('relation "weekly_award_round" does not exist') ||
		error.message.includes('relation "weekly_award_category" does not exist') ||
		error.message.includes('relation "weekly_award_finalist" does not exist') ||
		error.message.includes('relation "weekly_award_vote" does not exist') ||
		error.message.includes('relation "weekly_award_payout" does not exist')
	);
}