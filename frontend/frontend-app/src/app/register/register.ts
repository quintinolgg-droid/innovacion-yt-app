import { ChangeDetectorRef, Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { User } from '../models/User';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecaptchaModule } from 'ng-recaptcha';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLink, RecaptchaModule],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  user: User = new User();
  errorMessage: string | null = null;
  confirmarConstrasena: string = '';

  recaptchaResponse: string | null = null; // Propiedad para el token

  // Método que recibe el token de Google
  resolved(captchaResponse: string | null): void {
    this.recaptchaResponse = captchaResponse;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  newRegister(): void {
    const newUser = this.user;

    if (this.confirmarConstrasena != this.user.password) {
      this.errorMessage = 'Las contraseñas no son similares';
      this.cd.detectChanges();
      return;
    }

    this.errorMessage = null;

    // 🛑 VALIDACIÓN: Asegurar que el captcha esté resuelto
    if (!this.recaptchaResponse) {
      this.errorMessage = 'Por favor, completa el reCAPTCHA.';
      return;
    }

    // Crear el objeto de datos incluyendo el token de reCAPTCHA
    const registrationData = {
      ...this.user, // Contiene firstName, email, password, etc.
      recaptcha: this.recaptchaResponse, // 🔑 ¡El token para el backend!
    };

    this.authService.register(registrationData).subscribe({
      next: (response) => {
        if (response) {
          this.errorMessage = null;
          this.router.navigate(['']);
        } else {
          console.log('Respuesta del servidor invalida');
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        console.log('error al registrar usuario', err);

        this.errorMessage =
          err.error?.message || 'Error al registrar. Verifica los datos e inténtalo de nuevo.';
        this.cd.detectChanges();
      },
      complete: () => {
        console.log('Solicitud de registro completada.');
      },
    });
  }
}
