import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { VideoService } from '../../services/video.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  userMail: string | null = null;
  constructor(
    private authService: AuthService,
    private router: Router,
    private videoService: VideoService,
    private authservice: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.router.navigate(['']);
    }

    this.userMail = this.authService.getUser();
  }

  logOut(): void {
    this.authservice.logout();

    this.router.navigate(['']);
  }
}
