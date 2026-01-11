// Shared constants used across the application
// These are now managed in the database via ApplicationSettings table
// Import from settings.ts for database-backed values
export {
	HOURLY_RATE,
	MEMBERSHIP_BASE_AMOUNT,
	HOURS_REQUIRED,
	TIME_ZONE,
	getApplicationSettings,
	getTimeZone,
} from './settings';
