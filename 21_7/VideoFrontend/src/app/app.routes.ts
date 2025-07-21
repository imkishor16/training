import { Routes } from '@angular/router';
import { VideoListComponent } from './video-list.component';
import { VideoDetailComponent } from "./video-detail.component"
import { VideoUploadComponent } from "./video-upload.component"

export const routes: Routes = [
  { path: '', component: VideoListComponent },
  { path: 'videos/:id', component: VideoDetailComponent },
  { path: 'upload', component: VideoUploadComponent },
];
