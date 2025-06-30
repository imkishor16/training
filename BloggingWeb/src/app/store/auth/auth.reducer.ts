import { createReducer, on } from '@ngrx/store';
import { User } from '../../models/auth.model';
import * as AuthActions from './auth.actions';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const initialState: AuthState = {
  user: null,
  loading: false,
  error: null
};

export const authReducer = createReducer(
  initialState,
  on(AuthActions.signUp, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.signUpSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null
  })),
  on(AuthActions.signUpFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(AuthActions.signIn, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(AuthActions.signInSuccess, (state, { user }) => ({
    ...state,
    user,
    loading: false,
    error: null
  })),
  on(AuthActions.signInFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  on(AuthActions.logout, () => initialState)
); 