import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { response } from 'express';

@Component({
  selector: 'app-reset-password',
  imports: [CommonModule, FormsModule],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  token: string = '';
  newPass: string = '';
  confNewPass: string = '';
  errorMessage: string | null = null;
  congratsMessage: string | null = null;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private cd: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    // Lee el token de la URL
    this.activatedRoute.params.subscribe((params) => {
      this.token = params['token'];
      console.log('Token de restablecimiento:', this.token);
    });
  }

  changePass(): void {
    if (this.newPass != this.confNewPass) {
      this.errorMessage = 'Las contraseñas no coinciden';
      this.cd.detectChanges();
      return;
    }

    this.authService.resetPassword(this.token, this.newPass).subscribe({
      next: (response) => {
        this.errorMessage = null;

        this.zone.run(() => {
          this.errorMessage = null;
          this.congratsMessage = 'Cambio de contraseña exitoso';
        });
        this.cd.detectChanges();

        setTimeout(() => {
          this.router.navigate(['']);
        }, 2000);
      },
      error: (err) => {
        this.congratsMessage = null;
        console.log(err);
        this.errorMessage = 'Error en el servidor';
        this.cd.detectChanges();
      },
      complete: () => {
        console.log('Solicitud de cambio de contraseña');
      },
    });
  }
}
