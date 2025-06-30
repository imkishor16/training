import { createAction, props } from '@ngrx/store';
import { SignUpRequest, SignInRequest, User } from '../../models/auth.model';

export const signUp = createAction(
  '[Auth] Sign Up',
  props<{ request: SignUpRequest }>()
);

export const signUpSuccess = createAction(
  '[Auth] Sign Up Success',
  props<{ user: User }>()
);

export const signUpFailure = createAction(
  '[Auth] Sign Up Failure',
  props<{ error: string }>()
);

export const signIn = createAction(
  '[Auth] Sign In',
  props<{ request: SignInRequest }>()
);

export const signInSuccess = createAction(
  '[Auth] Sign In Success',
  props<{ user: User }>()
);

export const signInFailure = createAction(
  '[Auth] Sign In Failure',
  props<{ error: string }>()
);

export const logout = createAction('[Auth] Logout'); 