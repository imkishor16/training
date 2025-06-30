import { Routes } from '@angular/router';
import { AuthComponent } from './pages/auth/auth.component';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { PostsListComponent } from './components/posts-list/posts-list.component';
import { PostComponent } from './components/post/post.component';
import { PostCreateComponent } from './components/post-create/post-create.component';
import { PostEditComponent } from './components/post-edit/post-edit.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'auth', component: AuthComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'posts', component: PostsListComponent },
  { path: 'posts/create', component: PostCreateComponent },
  { path: 'posts/edit/:id', component: PostEditComponent },
  { path: 'post/:id', component: PostComponent },
  { path: 'dashboard', component: HomeComponent } // Using HomeComponent as dashboard for now
];
