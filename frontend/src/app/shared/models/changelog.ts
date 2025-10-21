export interface ChangelogEntry {
  month?: number;
  monthStart?: number;
  monthEnd?: number;
  content: { [category: string]: string[] } | string[];
}

export interface ChangelogYear {
  year: number;
  entries: ChangelogEntry[];
}

export interface ChangelogData {
  records: ChangelogYear[];
}
