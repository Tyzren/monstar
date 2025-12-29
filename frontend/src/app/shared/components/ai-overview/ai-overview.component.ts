import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';

// PrimeNG modules
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

// App specific models
import { SkeletonModule } from 'primeng/skeleton';
import { Subject, takeUntil } from 'rxjs';
import { AiOverview } from '../../models/ai-overview.model';
import { ViewportService, ViewportType } from '../../services/viewport.service';

@Component({
  selector: 'app-ai-overview',
  standalone: true,
  imports: [CommonModule, CardModule, TooltipModule, SkeletonModule],
  templateUrl: './ai-overview.component.html',
  styleUrl: './ai-overview.component.scss',
})
export class AiOverviewComponent implements OnInit, OnDestroy {
  @Input() unit: any = null;

  window = window;

  viewportType: ViewportType = 'desktop';

  /**
   * * Gets AI overview from unit data
   */
  get aiOverview(): AiOverview | null {
    return this.unit?.aiOverview || null;
  }

  private destroy$ = new Subject<void>();

  constructor(private viewportService: ViewportService) {}

  ngOnInit(): void {
    // Subscribe to viewport service
    this.viewportService.viewport$
      .pipe(takeUntil(this.destroy$))
      .subscribe((type) => {
        this.viewportType = type;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * * Formats the generated date for display
   */
  getFormattedDate(format: 'short' | 'default' = 'default'): string {
    if (!this.aiOverview?.generatedAt) return '';

    const date: Date = new Date(this.aiOverview.generatedAt);

    if (format == 'short') {
      const yyyy = date.getFullYear().toString();
      const mm = date.getMonth() + 1;
      const dd = date.getDay();

      let ddStr, mmStr;
      if (dd < 10) {
        ddStr = '0' + dd;
      }
      if (mm < 10) {
        mmStr = '0' + mm;
      }

      return ddStr + '/' + mmStr + '/' + yyyy;
    }

    return date.toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  /**
   * * Gets the icon for the AI model
   */
  getModelIcon(): string {
    if (!this.aiOverview?.model) return '';

    const model = this.aiOverview.model.toLowerCase();
    if (model.includes('gemini')) {
      return 'pi pi-google';
    }

    // Default icon for unknown models
    return 'pi pi-sparkles';
  }
}
