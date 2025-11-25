import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { VideoService } from '../../services/video.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  constructor(
    private authService: AuthService,
    private router: Router,
    private videoService: VideoService
  ) {}
}
