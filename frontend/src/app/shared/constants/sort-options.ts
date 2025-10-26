/**
 * Sort options for unit filtering
 * These constants ensure consistency across the application
 */

export enum SortOptions {
  ALPHABETIC = 'Alphabetic',
  MOST_REVIEWS = 'Most Reviews',
  HIGHEST_OVERALL = 'Highest Overall',
  LOWEST_OVERALL = 'Lowest Overall',
}

/**
 * Array of all sort option values for use in dropdowns
 */
export const SORT_OPTIONS_LIST: string[] = Object.values(SortOptions);
