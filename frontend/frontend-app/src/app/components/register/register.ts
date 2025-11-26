import { ChangeDetectorRef, Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../models/User';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecaptchaService } from '../../services/recaptcha.service';

declare const grecaptcha: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  user: User = new User();
  errorMessage: string | null = null;
  confirmarConstrasena: string = '';
  siteKey = '6LdFhBcsAAAAAPGT5qCyx4novsFCXrMtUBWs-hO4';

  constructor(
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object,
    private recaptchaService: RecaptchaService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.recaptchaService.initializeCaptchaCallback(this.cd);
    }
  }

  newRegister(): void {
    if (this.confirmarConstrasena !== this.user.password) {
      this.errorMessage = 'Las contraseñas no coinciden';
      this.cd.detectChanges();
      return;
    }
    const token = this.recaptchaService.getResolvedToken();

    if (!token) {
      this.errorMessage = 'Por favor completa el reCAPTCHA.';
      return;
    }

    const data = {
      ...this.user,
      recaptcha: token,
    };

    this.authService.register(this.user).subscribe({
      next: (response) => {
        this.errorMessage = null;
        this.router.navigate(['']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al registrar.';
        this.recaptchaService.resetCaptcha();
        this.cd.detectChanges();
      },
    });
  }
}
