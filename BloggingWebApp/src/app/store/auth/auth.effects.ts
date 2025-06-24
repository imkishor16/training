import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private store: Store<AppState>
  ) {}

  signUp$ = createEffect(() => {
    if (!this.actions$) {
      return of();
    }
    return this.actions$.pipe(
      ofType(AuthActions.signUp),
      mergeMap(({ request }) =>
        this.authService.signUp(request).pipe(
          map((response) => {
            this.authService.setToken(response.token);
            return AuthActions.signUpSuccess({ user: response.user });
          }),
          catchError((error) =>
            of(AuthActions.signUpFailure({ error: error.message }))
          )
        )
      )
    );
  });

  signIn$ = createEffect(() => {
    if (!this.actions$) {
      return of();
    }
    return this.actions$.pipe(
      ofType(AuthActions.signIn),
      mergeMap(({ request }) =>
        this.authService.signIn(request).pipe(
          map((response) => {
            this.authService.setToken(response.token);
            return AuthActions.signInSuccess({ user: response.user });
          }),
          catchError((error) =>
            of(AuthActions.signInFailure({ error: error.message }))
          )
        )
      )
    );
  });

  authSuccess$ = createEffect(() => {
    if (!this.actions$) {
      return of();
    }
    return this.actions$.pipe(
      ofType(AuthActions.signInSuccess, AuthActions.signUpSuccess),
      tap(() => this.router.navigate(['/dashboard']))
    );
  }, { dispatch: false });

  logout$ = createEffect(() => {
    if (!this.actions$) {
      return of();
    }
    return this.actions$.pipe(
      ofType(AuthActions.logout),
      tap(() => {
        this.authService.logout();
        this.router.navigate(['/login']);
      })
    );
  }, { dispatch: false });
} 