import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReviewCardComponent } from '@components/review-card/review-card.component';
import { GetReviewService } from '@services/api/get-review.service';
import { UserService } from '@services/api/user.service';
import { DEFAULT_PROFILE_IMG } from 'app/shared/constants/constants';
import { SkeletonModule } from 'primeng/skeleton';
import {
  catchError,
  combineLatest,
  exhaustMap,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
} from 'rxjs';
import { ProfilePanelComponent } from './profile-panel/profile-panel.component';
import { State } from './user-profile.state';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [AsyncPipe, ProfilePanelComponent, ReviewCardComponent, SkeletonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  private userService = inject(UserService);
  private getReviewService = inject(GetReviewService);

  state$: Observable<State> = combineLatest([
    this.route.paramMap,
    this.userService.currentUser$,
  ]).pipe(
    exhaustMap(([params, currUser]) => {
      const username = params.get('username');
      if (!username) {
        return of({ user: null, currUser, reviews: [] });
      }

      const isSameUser = currUser && currUser.username === username;

      const userSource$ = isSameUser
        ? of(currUser)
        : this.userService.getByUsername(username).pipe(
            catchError(() => of(null))
          );

      return userSource$.pipe(
        switchMap((user) => {
          if (!user) return of({ user: null, currUser, reviews: [] });

          return this.getReviewService.getReviewsByUser(user._id).pipe(
            map((reviews) => ({
              user,
              currUser,
              // Map user as author to make it a IReviewAuthorPopulated type
              reviews: reviews.map((r) => ({ ...r, author: user })),
            })),
            catchError(() => of({ user, currUser, reviews: [] }))
          );
        })
      );
    }),
    map(({ user, currUser, reviews }) => ({
      username: user?.username ?? null,
      user: user ?? null,
      profileImg: user?.profileImg ?? DEFAULT_PROFILE_IMG,
      isCurrentUser:
        !!user && !!currUser && user.username === currUser.username,
      reviews: reviews.sort((a, b) => {
        // Sorting reviews by their unitcode digit
        const levelA = parseInt(a.unit.unitCode[3]);
        const levelB = parseInt(b.unit.unitCode[3]);
        return levelA - levelB || a.unit.unitCode.localeCompare(b.unit.unitCode);
      }),
    })),
    shareReplay(1)
  );

  logout() {
    this.userService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
