import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

// Environment
import { environment } from '../../../environments/environment';

// Constants
import {
  BASE_URL,
  getMetaUnitOverviewDescription,
  getMetaUnitOverviewKeywords,
  getMetaUnitOverviewOpenGraphDescription,
  getMetaUnitOverviewOpenGraphTitle,
  getMetaUnitOverviewTitle,
  getMetaUnitOverviewTwitterDescription,
  getMetaUnitOverviewTwitterTitle,
} from '../../shared/constants';

// Services
import { MessageService } from 'primeng/api';
import { ApiService } from '../../shared/services/api.service';
import { FooterService } from '../../shared/services/footer.service';

// Components
import { AiOverviewComponent } from '../../shared/components/ai-overview/ai-overview.component';
import { ReviewCardComponent } from '../../shared/components/review-card/review-card.component';
import { SetuCardComponent } from '../../shared/components/setu-card/setu-card.component';
import { UnitReviewHeaderComponent } from '../../shared/components/unit-review-header/unit-review-header.component';
// Modules
import { GetUnitService } from '@services/api/get-unit.service';
import { UnitData } from 'app/shared/models/v2/unit.model';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SkeletonModule } from 'primeng/skeleton';
import { ToastModule } from 'primeng/toast';
import { forkJoin, map, switchMap, tap } from 'rxjs';
import { Review } from '../../shared/models/review.model';

@Component({
  selector: 'app-unit-overview',
  standalone: true,
  imports: [
    ReviewCardComponent,
    UnitReviewHeaderComponent,
    SetuCardComponent,
    AiOverviewComponent,
    ToastModule,
    ProgressSpinnerModule,
    SkeletonModule,
    ScrollPanelModule,
    CommonModule,
    FormsModule,
  ],
  providers: [MessageService],
  templateUrl: './unit-overview.component.html',
  styleUrl: './unit-overview.component.scss',
})
export class UnitOverviewComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('headerSkeleton') headerSkeleton!: ElementRef;
  @ViewChild('unitOverviewContainer') unitOverviewContainer!: ElementRef;

  // unit: UnitData;
  reviews: Review[] = [];
  reviewsLoading: boolean = true;

  // Environment flags
  enableSetuCards = environment.enableSetuCards;

  // Split view boolean
  isSplitView: boolean = false;
  splitViewMinWidth: number = 1414;

  // Resize handler
  private resizeHandler = () => {
    this.isSplitView = window.innerWidth >= this.splitViewMinWidth;
    this.updateContainerHeight();
  };

  private getUnitService = inject(GetUnitService);
  private apiService = inject(ApiService);
  private messageService = inject(MessageService);
  private meta = inject(Meta);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private titleService = inject(Title);
  private footerService = inject(FooterService);

  private unitCode$ = this.route.paramMap.pipe(
    map((params) => params.get('unitcode'))
  );

  private unitData$ = this.unitCode$.pipe(
    switchMap((code) => {
      if (!code) return [];

      return forkJoin({
        unit: this.getUnitService.getByUnitcode(code),
        reviews: this.apiService.getAllReviewsGET(code),
      }).pipe(
        map(({ unit, reviews }: { unit: UnitData; reviews: Review[] }) => {
          unit.reviews = reviews;
          return unit;
        }),
        tap((unit) => {
          this.updateMetaTags(unit);
          this.resetScrollPosition();
        })
      );
    })
  );

  /**
   * * Runs on initialisation
   *
   * Gets the unitcode from the URL param and uses it to get the unit and reviews.
   */
  ngOnInit(): void {
    // Hide the footer
    this.footerService.hideFooter();

    this.isSplitView = window.innerWidth >= this.splitViewMinWidth;

    // Get unit code from the route parameters
    const unitCode = this.route.snapshot.paramMap.get('unitcode');

    if (unitCode) {
      this.getUnitByUnitcode(unitCode);
      this.getAllReviews(unitCode);
    }
  }

  ngAfterViewInit(): void {
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.resizeHandler);

    this.unitOverviewContainer.nativeElement.style.height = '';

    this.footerService.showFooter();

    this.titleService.setTitle(
      'MonSTAR | Browse and Review Monash University Units'
    );

    // Remove all custom meta tags
    this.meta.removeTag("name='description'");
    this.meta.removeTag("name='keywords'");
    this.meta.removeTag("property='og:title'");
    this.meta.removeTag("property='og:description'");
    this.meta.removeTag("property='og:url'");
    this.meta.removeTag("property='og:type'");
    this.meta.removeTag("name='twitter:card'");
    this.meta.removeTag("name='twitter:title'");
    this.meta.removeTag("name='twitter:description'");
  }

  getAllReviews(unitCode?: string) {
    this.apiService.getAllReviewsGET(unitCode).subscribe({
      next: (reviews: Review[]) => {
        this.reviews = reviews;
        this.sortReviews('most-likes');

        // Update the reviews property in the unit object
        if (this.unit) this.unit.reviews = this.reviews;

        this.reviewsLoading = false;
        this.resetScrollPosition();
      },
      complete: () => {
        this.updateContainerHeight();
      },
    });
  }

  getUnitByUnitcode(unitCode: string) {
    this.getUnitService.getByUnitcode(unitCode).subscribe({
      next: (unit: UnitData) => {
        this.unit = unit;
        console.log(unit);
        this.updateMetaTags();
        this.resetScrollPosition();
      },
    });
  }

  /**
   * * Sorts the reviews array based on the specified criteria
   *
   * @param {string} criteria - The criteria to sort the reviews by.
   *
   * Criteria options
   * - 'recent': Sorts the reviews by most recent first based on `createdAt` property.
   * - 'lowest-rating': Sorts the reviews by the lowest rating (`overallRating`) first.
   * - 'highest-rating': Sorts the reviews by the highest rating (`overallRating`) first.
   * - 'most-likes': Sorts the reviews by the most likes first.
   */
  sortReviews(criteria: string) {
    // ? Debug log: Sorting reviews message
    // console.log('Sorting reviews', criteria);

    // Criterion
    switch (criteria) {
      // Sorting by oldest
      case 'oldest':
        this.reviews.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;

      // Sorting by most recent
      case 'recent':
        this.reviews.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;

      // Sorting by lowest rating
      case 'lowest-rating':
        this.reviews.sort((a, b) => a.overallRating - b.overallRating);
        break;

      // Sorting by highest rating
      case 'highest-rating':
        this.reviews.sort((a, b) => b.overallRating - a.overallRating);
        break;

      // Sorting by most likes
      case 'most-likes':
        this.reviews.sort(
          (a, b) => b.likes - b.dislikes - (a.likes - a.dislikes)
        );
        break;

      // Sorting by most dislikes
      case 'most-dislikes':
        this.reviews.sort(
          (a, b) => a.likes - a.dislikes - (b.likes - b.dislikes)
        );
        break;
    }
  }

  /**
   * This method is called finally after a few event emittors going from:
   * write-review-unit (emits reviewPosted) -> unit-review-header (emits reviewAdded) -> unit-overview
   */
  refreshReviews(toast?: string) {
    if (this.unit && this.unit.unitCode) {
      this.reviewsLoading = true; // Set the loading state to true again.
      this.getAllReviews(this.unit.unitCode); // Get all the reviews again.
      this.getUnitByUnitcode(this.unit.unitCode); // Get the unit again for updated avg ratings.

      if (toast == 'delete') {
        // Show delete toast
        this.messageService.add({
          severity: 'warn',
          summary: 'Review deleted!',
          detail: `Review has been deleted.`,
        });
      } else if (toast == 'edit') {
        // Show edit toast
        this.messageService.add({
          severity: 'success',
          summary: 'Review edited!',
          detail: `Review has been updated.`,
        });
      }
    }
  }

  /**
   *  ! |======================================================================|
   *  ! | UI Manipulators
   *  ! |======================================================================|
   */

  /**
   * * Updates unit overview container height
   *
   * Runs on window resize and component initialisation
   *
   * - If we're in split view we use 100vh
   * - If we have 1 review then we use 100vh minus the height of the navbar and
   * prevent scrolling.
   * - If we have more than 2 reviews, then we use 100% to grow to full height.
   */
  updateContainerHeight() {
    // Start of with 100vh to work with split view
    this.unitOverviewContainer.nativeElement.style.height = '100vh';

    // No change if we're in split view
    if (this.isSplitView) {
      this.unitOverviewContainer.nativeElement.style.height = '';
    } else {
      this.unitOverviewContainer.nativeElement.style.height = '100%';
      this.unitOverviewContainer.nativeElement.style.overflow = '';
    }
  }

  /**
   * * Reset scroll position on all possible containers
   */
  private resetScrollPosition(): void {
    console.log('Resetting scroll position');

    // Reset main window scroll
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;

    // Reset any scroll panels
    const scrollContainers = document.querySelectorAll(
      '.p-scrollpanel-content, .p-scrollpanel-wrapper'
    );
    scrollContainers.forEach((container) => {
      if (container instanceof HTMLElement) {
        container.scrollTop = 0;
      }
    });

    // Try to get the app's main content container
    const appContent = document.querySelector('app-root');
    if (appContent) {
      appContent.scrollTop = 0;
    }
  }

  /**
   *  ! |======================================================================|
   *  ! | META TAGS
   *  ! |======================================================================|
   */

  /**
   * * Updates Meta Tags
   */
  updateMetaTags(unit: UnitData): void {
    const unitReviewsCount: number = unit.reviews.length;
    const unitAverageRating: number = +unit.avgOverallRating.toFixed(1);
    const unitCode: string = unit.unitCode.toUpperCase();
    const unitName: string = unit.name;
    const pageUrl: string = `${BASE_URL}/unit/${unit.unitCode}`;

    // Basic meta tags
    this.titleService.setTitle(getMetaUnitOverviewTitle(unitCode, unitName));
    this.meta.updateTag({
      name: 'description',
      content: getMetaUnitOverviewDescription(
        unitReviewsCount,
        unitCode,
        unitName
      ),
    });
    this.meta.updateTag({
      name: 'keywords',
      content: getMetaUnitOverviewKeywords(unitCode, unitName),
    });

    // Open Graph tags for social sharing
    this.meta.updateTag({
      property: 'og:title',
      content: getMetaUnitOverviewOpenGraphTitle(unitCode, unitName),
    });
    this.meta.updateTag({
      property: 'og:description',
      content: getMetaUnitOverviewOpenGraphDescription(
        unitCode,
        unitAverageRating,
        unitReviewsCount
      ),
    });
    this.meta.updateTag({ property: 'og:url', content: pageUrl });
    this.meta.updateTag({ property: 'og:type', content: 'website' });

    // Twitter Card tags
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
    this.meta.updateTag({
      name: 'twitter:title',
      content: getMetaUnitOverviewTwitterTitle(unitCode),
    });
    this.meta.updateTag({
      name: 'twitter:description',
      content: getMetaUnitOverviewTwitterDescription(
        unitCode,
        unitName,
        unitAverageRating
      ),
    });
  }
}
