import { Component, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Asegúrate de que la ruta sea correcta

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgIf],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  // Modelo para el formulario (solo necesita el email)
  email: string = '';

  // Estado para mensajes de éxito o error
  message: string | null = null;
  isSuccess: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  requestPasswordReset(): void {
    this.message = null; // Limpiar mensajes anteriores
    this.isSuccess = false;

    // 1. Llamar al servicio para solicitar el restablecimiento
    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        // Asumiendo que el backend devuelve { msg: "Email enviado" }
        this.message =
          'Se ha enviado un enlace de restablecimiento a tu correo. Por favor, revísalo.';
        this.isSuccess = true;
        this.cd.detectChanges();
        // Opcional: Redirigir al login después de un momento
        // setTimeout(() => this.router.navigate(['/']), 5000);
      },
      error: (err) => {
        console.error('Error al solicitar restablecimiento:', err);
        // Mostrar un mensaje de error amigable
        this.message = err.error?.msg || 'Error al procesar la solicitud. Verifica el correo.';
        this.isSuccess = false;
        this.cd.detectChanges();
      },
      complete: () => {
        console.log('Solicitud de restablecimiento completada.');
      },
    });
  }
}
