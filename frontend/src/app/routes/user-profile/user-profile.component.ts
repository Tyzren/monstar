import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IUser } from '@models/user.schema';
import { UserService } from '@services/api/user.service';
import { DEFAULT_PROFILE_IMG } from 'app/shared/constants/constants';
import {
  catchError,
  combineLatest,
  exhaustMap,
  map,
  Observable,
  of,
  shareReplay,
  tap,
} from 'rxjs';

interface State {
  username: string | null;
  user: IUser | null;
  profileImg: string;
  isCurrentUser: boolean;
}

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
})
export class UserProfileComponent {
  username: string | undefined;
  private route = inject(ActivatedRoute);

  private userService = inject(UserService);

  state$: Observable<State> = combineLatest([
    this.route.paramMap,
    this.userService.currentUser$,
  ]).pipe(
    tap(([params, currUser]) =>
      console.log(
        '[1] combineLatest emit:',
        params.get('username'),
        currUser?.username
      )
    ),
    exhaustMap(([params, currUser]) => {
      const username = params.get('username');
      if (!username) {
        return of({ user: null, currUser });
      }

      const isSameUser = currUser && currUser.username === username;
      console.log('[2] isSameUser:', isSameUser);

      const userSource$ = isSameUser
        ? of(currUser)
        : this.userService.getByUsername(username).pipe(
            tap((user) => console.log('[3] API response:', user)),
            catchError((err) => {
              console.error('[3] API error:', err);
              return of(null);
            })
          );

      return userSource$.pipe(map((user) => ({ user, currUser })));
    }),
    tap(({ user }) =>
      console.log('[4] Final user:', user?.username, user?.profileImg)
    ),
    map(({ user, currUser }) => ({
      username: user?.username ?? null,
      user: user ?? null,
      profileImg: user?.profileImg ?? DEFAULT_PROFILE_IMG,
      isCurrentUser:
        !!user && !!currUser && user.username === currUser.username,
    })),
    shareReplay(1)
  );
}
