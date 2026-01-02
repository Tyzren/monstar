import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { CommonModule, SlicePipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { ModifyReviewService } from '@services/api/modify-review.service';
import { UserService } from '@services/api/user.service';
import {
  IReview,
  IReviewAuthorPopulated,
} from 'app/shared/models/v2/review.model';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { ConfirmPopup, ConfirmPopupModule } from 'primeng/confirmpopup';
import { MenuModule } from 'primeng/menu';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { combineLatest, firstValueFrom, map, ReplaySubject, Subscription } from 'rxjs';
import { Review } from '../../models/review.model';
import { HighlightUnitPipe } from '../../pipes/highlight-unit.pipe';
import { AuthService } from '../../services/auth.service';
import { ViewportService, ViewportType } from '../../services/viewport.service';
import { WriteReviewUnitComponent } from '../write-review-unit/write-review-unit.component';
import { ReportReviewComponent } from './report-review/report-review.component';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [
    SlicePipe,
    AvatarModule,
    CommonModule,
    ProgressSpinnerModule,
    ConfirmPopupModule,
    ButtonModule,
    MenuModule,
    TooltipModule,
    ReportReviewComponent,
    BadgeModule,
    WriteReviewUnitComponent,
    HighlightUnitPipe,
  ],
  providers: [ConfirmationService],
  templateUrl: './review-card.component.html',
  styleUrl: './review-card.component.scss',
  animations: [
    // Fade in out animation for delete button
    trigger('fadeInOut', [
      state(
        'hidden',
        style({
          opacity: 0,
        })
      ),
      state(
        'visible',
        style({
          opacity: 1,
        })
      ),
      transition('hidden <=> visible', animate('300ms ease-in-out')),
    ]),
  ],
})
export class ReviewCardComponent implements OnInit, OnDestroy {
  private _reportReviewDialog!: ReportReviewComponent;

  Math = Math;
  console = console;

  private review$ = new ReplaySubject<IReviewAuthorPopulated>(1);
  private _review!: IReviewAuthorPopulated;
  @Input({ required: true })
  set review(value: IReviewAuthorPopulated) {
    this._review = value;
    this.review$.next(value);
  }
  get review() {
    return this._review;
  }

  @Output() reviewDeleted = new EventEmitter<string>();

  @ViewChild(ConfirmPopup) confirmPopup!: ConfirmPopup;

  @ViewChild(ReportReviewComponent)
  set reportReviewDialog(content: ReportReviewComponent) {
    if (content) {
      this._reportReviewDialog = content;
    }
  }
  get reportReviewDialog(): ReportReviewComponent {
    return this._reportReviewDialog;
  }

  // Child component: write review unit dialog
  @ViewChild(WriteReviewUnitComponent)
  writeReviewDialog!: WriteReviewUnitComponent;

  dropdownMenuItems: MenuItem[] | undefined;

  // Expand state
  expanded: boolean = false;

  liked: boolean = false;
  hoveringLike: boolean = false;
  likes: number = 0;
  // Disliking
  disliked: boolean = false;
  hoveringDislike: boolean = false;
  dislikes: number = 0;

  // Delete button visibility state
  deleteButtonState: 'visible' | 'hidden' = 'hidden';

  defaultProfileImg =
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSWwfGUCDwrZZK12xVpCOqngxSpn0BDpq6ewQ&s';

  private viewportSubscription: Subscription = new Subscription();

  // Viewport type
  viewportType: ViewportType = 'desktop';

  // The unit that is being edited
  unit: any = null;

  // Review that is being edited
  reviewEdit: Review = new Review();

  startEditReview(review: any) {
    this.reviewEdit = new Review({
      _id: review._id,
      title: review.title,
      semester: review.semester,
      grade: review.grade,
      year: review.year,
      overallRating: review.overallRating,
      relevancyRating: review.relevancyRating,
      facultyRating: review.facultyRating,
      contentRating: review.contentRating,
      description: review.description,
    });

    this.unit = review.unit;

    if (this.writeReviewDialog) {
      this.writeReviewDialog.openDialog();
    }
  }

  private authService = inject(AuthService);
  private userService = inject(UserService);
  private modifyReviewService = inject(ModifyReviewService);
  private confirmationService = inject(ConfirmationService);
  private viewportService = inject(ViewportService);

  readonly userState$ = combineLatest([
    this.userService.currentUser$,
    this.review$,
  ]).pipe(
    map(([user, review]) => {
      if (!user) return null;
      if (!review) return null;
      return {
        liked: user?.likedReviews.includes(review._id) ?? false,
        disliked: user?.dislikedReviews.includes(review._id) ?? false,
        isAuthor:
          user?._id ===
          (typeof review.author === 'object'
            ? review.author._id
            : review.author),
        profileImg: review.author.profileImg,
        username: review.author.username,
        email: review.author.email,
      };
    })
  );

  ngOnInit(): void {
    this.likes = this.review.likes;
    this.dislikes = this.review.dislikes;

    this.viewportSubscription = this.viewportService.viewport$.subscribe(
      (type) => {
        this.viewportType = type;
      }
    );

    this.dropdownMenuItems = [
      {
        label: 'Edit',
        icon: 'pi pi-pencil',
        command: () => {
          this.startEditReview(this.review);
        },
      },
      {
        label: 'Delete',
        icon: 'pi pi-trash',
        command: () => {
          this.deleteReview();
        },
      },
    ];
  }

  ngOnDestroy(): void {
    this.viewportSubscription.unsubscribe();
  }

  /* ----------------------------- Review deletion ---------------------------- */

  /**
   * * Choices on confirmation popup (either delete or cancel)
   */
  accept() {
    this.confirmPopup.accept();
  }
  reject() {
    this.confirmPopup.reject();
  }

  /**
   * * Subscribes to the confirmation service on deletion
   */
  confirmDeletion(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure?',
      accept: () => {
        this.deleteReview();
      },
      reject: () => {},
    });
  }

  deleteReview() {
    this.reviewDeleted.emit(this.review._id);
  }

  /* -------------------------- Liking and disliking -------------------------- */

  toggleReaction(reactionType: 'like' | 'dislike') {
    const reviewId = this.review._id;
    const rollback = this.userService.toggleReaction(reviewId, reactionType);
    const userId = this.userService.getId();
    if (!userId) {
      console.error('User id was not retrieved');
      return;
    }

    this.modifyReviewService
      .toggleReaction(reviewId, userId, reactionType)
      .subscribe({
        next: (review: IReview) => {
          this.review.likes = review.likes;
          this.review.dislikes = review.dislikes;
        },
        error: () => {
          if (rollback) rollback();
        },
      });
  }

  /* ----------------------------- Helper methods ----------------------------- */

  toggleExpand() {
    this.expanded = !this.expanded;
  }

  async showReportDialog() {
    const state = await firstValueFrom(this.userState$);

    if (state && this.reportReviewDialog) {
      this.reportReviewDialog.openDialog();
    }
  }
}
