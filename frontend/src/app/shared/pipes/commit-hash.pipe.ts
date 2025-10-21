import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'commitHash',
  standalone: true
})
export class CommitHashPipe implements PipeTransform {
  private readonly GITHUB_REPO = 'https://github.com/wiredmonash/monstar';

  constructor(private sanitizer: DomSanitizer) {}

  /**
   * ! Transforms text containing commit hashes (backtick format) into clickable chips
   * * Finds patterns like `abc1234` and converts them to GitHub commit links
   */
  transform(value: string): SafeHtml {
    if (!value) return value;

    // Match backtick-wrapped content (including commit hashes and regular code)
    const commitHashRegex = /`([a-f0-9]{7,40})`/g;
    const codeBlockRegex = /`([^`]+)`/g;

    // First, replace commit hashes with clickable chips
    let transformed = value.replace(commitHashRegex, (match, hash) => {
      return `<a href="${this.GITHUB_REPO}/commit/${hash}" target="_blank" class="commit-chip" rel="noopener noreferrer">${hash}</a>`;
    });

    // Then, replace remaining backtick content with code tags (non-commit hashes)
    transformed = transformed.replace(codeBlockRegex, (match, content) => {
      // Skip if it's already been transformed into a link
      if (match.includes('</a>')) return match;
      return `<code>${content}</code>`;
    });

    return this.sanitizer.bypassSecurityTrustHtml(transformed);
  }
}
