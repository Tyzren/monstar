import { IOrgLogo } from '@models/orgLogo.schema';
import { IJob } from '@models/job.schema';

/**
 * Computes the Dice coefficient between two strings.
 * Returns a value between 0 (no similarity) and 1 (identical).
 */
export function compareTwoStrings(a: string, b: string): number {
  const first = a.toLowerCase().trim();
  const second = b.toLowerCase().trim();

  if (first === second) return 1;
  if (first.length < 2 || second.length < 2) return 0;

  const bigramsA = new Map<string, number>();
  for (let i = 0; i < first.length - 1; i++) {
    const bigram = first.substring(i, i + 2);
    bigramsA.set(bigram, (bigramsA.get(bigram) || 0) + 1);
  }

  let intersectionSize = 0;
  for (let i = 0; i < second.length - 1; i++) {
    const bigram = second.substring(i, i + 2);
    const count = bigramsA.get(bigram) || 0;
    if (count > 0) {
      bigramsA.set(bigram, count - 1);
      intersectionSize++;
    }
  }

  return (2.0 * intersectionSize) / (first.length - 1 + (second.length - 1));
}

/**
 * Builds a Map from normalised organisation name to logoUrl.
 * Uses exact match first, then fuzzy fallback above the threshold.
 */
export function buildOrgLogoMap(
  jobs: IJob[],
  logos: IOrgLogo[],
  threshold = 0.7
): Map<string, string> {
  const logoMap = new Map<string, string>();

  // Index logos by normalised name
  const logoIndex = new Map<string, string>();
  for (const logo of logos) {
    logoIndex.set(logo.organisation, logo.logoUrl);
  }

  // Get unique org names from jobs
  const orgNames = new Set(jobs.map((j) => j.organisation));

  for (const orgName of orgNames) {
    const normalised = orgName.toLowerCase().trim();

    // Exact match
    if (logoIndex.has(normalised)) {
      logoMap.set(normalised, logoIndex.get(normalised)!);
      continue;
    }

    // Fuzzy fallback
    let bestScore = 0;
    let bestUrl = '';
    for (const [logoOrg, url] of logoIndex) {
      const score = compareTwoStrings(normalised, logoOrg);
      if (score > bestScore) {
        bestScore = score;
        bestUrl = url;
      }
    }

    if (bestScore >= threshold) {
      logoMap.set(normalised, bestUrl);
    }
  }

  return logoMap;
}
