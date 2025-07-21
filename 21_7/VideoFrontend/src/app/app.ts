import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { VideoListComponent } from './video-list.component';
import { VideoDetailComponent } from './video-detail.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, HttpClientModule, VideoListComponent, VideoDetailComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  title = 'Video Library';
}
