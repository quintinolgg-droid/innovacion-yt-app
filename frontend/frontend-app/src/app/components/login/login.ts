import { ChangeDetectorRef, Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, NgModel } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  // 1. Modelo de datos para el formulario
  credentials = {
    emailOrUser: '', // Se mapeará al input de usuario/email
    password: '',
  };
  errorMessage: string | null = null; // Para mostrar errores

  // 2. Inyectar Router
  constructor(
    private authService: AuthService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {}

  // 3. Implementar la lógica de login
  loging(): void {
    // Aquí puedes usar tu objeto 'credentials' directamente,
    // o mapearlo a la estructura que tu backend espera
    const loginData = {
      emailOrUser: this.credentials.emailOrUser,
      password: this.credentials.password,
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        // Suponiendo que el backend devuelve un objeto con un 'token'
        if (response && response.token) {
          this.authService.saveToken(response.token);
          this.errorMessage = null;
          // **Navegación exitosa al componente 'home'**
          this.router.navigate(['home']);
        } else {
          // Si el servidor responde 200 pero sin token (algo inusual)
          this.errorMessage = 'Respuesta del servidor inválida.';
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        // Manejo de errores HTTP (ej: 401 Unauthorized)
        console.error('Error al iniciar sesión:', err);
        // Mostrar un mensaje de error al usuario
        this.errorMessage =
          err.error?.message || 'Error al iniciar sesión. Verifica tus credenciales.';

        this.cd.detectChanges();
      },
      complete: () => {
        console.log('Solicitud de login completada.');
      },
    });
  }
}
