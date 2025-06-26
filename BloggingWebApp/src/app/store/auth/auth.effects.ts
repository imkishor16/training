import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, mergeMap, catchError, tap, exhaustMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';
import * as AuthActions from './auth.actions';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { AppState } from '../app.state';
import { MessageService } from '../../services/message.service';

@Injectable()
export class AuthEffects {
  constructor(
    private actions$: Actions,
    private authService: AuthService,
    private router: Router,
    private store: Store<AppState>,
    private messageService: MessageService
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
      exhaustMap(() => 
        this.authService.logout().pipe(
          tap(() => {
            this.messageService.showSuccessMessage('LOGOUT');
            this.router.navigate(['/auth']);
          }),
          catchError(error => {
            this.messageService.showHttpError(error);
            // Still navigate and clear local state even if API call fails
            this.router.navigate(['/auth']);
            return of(error);
          })
        )
      )
    );
  }, { dispatch: false });
} 