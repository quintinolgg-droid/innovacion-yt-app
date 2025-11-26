import { Injectable, NgZone } from '@angular/core';

// Necesitas esta declaración ya que 'grecaptcha' es global
declare const grecaptcha: any;

@Injectable({
  providedIn: 'root',
})
export class RecaptchaService {
  private resolvedToken: string | null = null;

  constructor(private ngZone: NgZone) {}

  public initializeCaptchaCallback(cd: any): void {
    if (typeof window !== 'undefined') {
      (window as any).onCaptchaResolved = (token: string) => {
        this.ngZone.run(() => {
          this.resolvedToken = token;
          console.log('CAPTCHA OK (Servicio):', token);

          if (cd && cd.detectChanges) {
            cd.detectChanges();
          }
        });
      };
    }
  }

  /**
   * Obtiene el token de reCAPTCHA que fue resuelto por el callback.
   * @returns El token o null si no se ha completado.
   */
  public getResolvedToken(): string | null {
    return this.resolvedToken;
  }

  /**
   * Resetea el reCAPTCHA (útil después de un intento fallido de registro).
   */
  public resetCaptcha(): void {
    if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
      grecaptcha.reset();
      this.resolvedToken = null;
    }
  }
}
