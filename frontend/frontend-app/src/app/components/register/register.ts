import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { User } from '../../models/User';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    private cd: ChangeDetectorRef
  ) {}

  recaptchaToken: string | null = null;

  ngOnInit(): void {
    (window as any).onCaptchaResolved = (token: string) => {
      this.recaptchaToken = token;
      console.log('CAPTCHA OK:', token);
    };
  }

  newRegister(): void {
    if (this.confirmarConstrasena !== this.user.password) {
      this.errorMessage = 'Las contraseñas no coinciden';
      this.cd.detectChanges();
      return;
    }

    if (!this.recaptchaToken) {
      this.errorMessage = 'Por favor completa el reCAPTCHA.';
      return;
    }

    const data = {
      ...this.user,
      recaptcha: this.recaptchaToken,
    };

    this.authService.register(this.user).subscribe({
      next: (response) => {
        this.errorMessage = null;
        this.router.navigate(['']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error al registrar.';
        this.cd.detectChanges();
      },
    });
  }
}
