import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'posts',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/posts/posts-list.component').then(m => m.PostsListComponent)
      },
      {
        path: 'new',
        loadComponent: () => import('./pages/create-post/create-post.component').then(m => m.CreatePostComponent)
      },
      {
        path: ':id',
        loadComponent: () => import('./components/post-detail/post-detail.component').then(m => m.PostComponent)
      }
    ]
  },
  {
    path: 'auth',
    loadComponent: () => import('./pages/auth/auth.component').then(m => m.AuthComponent),
    children: [
      {
        path: 'sign-in',
        loadComponent: () => import('./components/sign-in/sign-in.component').then(m => m.SignInComponent)
      },
      {
        path: 'sign-up',
        loadComponent: () => import('./components/sign-up/sign-up.component').then(m => m.SignUpComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: 'dashboard'
  }
];
