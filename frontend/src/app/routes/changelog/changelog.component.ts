import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ChangelogData,
  ChangelogYear,
  ChangelogEntry,
} from '../../shared/models/changelog';
import { CommitHashPipe } from '../../shared/pipes/commit-hash.pipe';
import * as changelogJson from '../../../../public/changelog.json';

@Component({
  selector: 'app-changelog',
  standalone: true,
  imports: [CommonModule, CommitHashPipe],
  templateUrl: './changelog.component.html',
  styleUrl: './changelog.component.scss',
})
export class ChangelogComponent implements OnInit {
  changelogData: ChangelogData = changelogJson as ChangelogData;
  loading: boolean = false;
  error: string = '';

  constructor() {}

  ngOnInit(): void {
    // Data is already loaded from static import
  }

  /**
   * ! Placeholder for retry if needed (not used with static import)
   */
  loadChangelog(): void {
    // No-op since we're using static import
  }

  /**
   * ! Gets month name from month number
   */
  getMonthName(monthNum: number): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return months[monthNum - 1];
  }

  /**
   * ! Formats month header (e.g., "October 2025" or "April – May 2025")
   */
  getMonthHeader(entry: ChangelogEntry, year: number): string {
    if (entry.monthStart && entry.monthEnd) {
      return `${this.getMonthName(entry.monthStart)} – ${this.getMonthName(entry.monthEnd)} ${year}`;
    } else if (entry.month) {
      return `${this.getMonthName(entry.month)} ${year}`;
    }
    return '';
  }

  /**
   * ! Checks if content is categorized (object) or simple array
   */
  isCategorized(content: any): boolean {
    return !Array.isArray(content);
  }

  /**
   * ! Gets categories from categorized content
   */
  getCategories(content: any): string[] {
    return Object.keys(content);
  }

  /**
   * ! Gets items for a category or returns content array
   */
  getItems(content: any, category?: string): string[] {
    if (category) {
      return content[category];
    }
    return content;
  }

  trackByYear(index: number, year: ChangelogYear): number {
    return year.year;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
