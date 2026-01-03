import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, Input, OnInit } from '@angular/core';

// PrimeNG modules
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';

// App specific models
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AiOverview,
  IUnitDeeplyPopulated,
} from 'app/shared/models/v2/unit.schema';
import { SkeletonModule } from 'primeng/skeleton';
import { ViewportService, ViewportType } from '../../services/viewport.service';

@Component({
  selector: 'app-ai-overview',
  standalone: true,
  imports: [CommonModule, CardModule, TooltipModule, SkeletonModule],
  templateUrl: './ai-overview.component.html',
  styleUrl: './ai-overview.component.scss',
})
export class AiOverviewComponent implements OnInit {
  window = window;
  viewportType: ViewportType = 'desktop';

  @Input() unit: IUnitDeeplyPopulated | undefined;

  get aiOverview(): AiOverview | null {
    return this.unit?.aiOverview || null;
  }

  private destroyRef = inject(DestroyRef);
  private viewportService = inject(ViewportService);

  ngOnInit(): void {
    this.viewportService.viewport$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((type) => {
        this.viewportType = type;
      });
  }

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

  getModelIcon(): string {
    if (!this.aiOverview?.model) return '';

    const model = this.aiOverview.model.toLowerCase();
    if (model.includes('gemini')) {
      return 'pi pi-google';
    }

    return 'pi pi-sparkles';
  }
}
