import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';

// 🛑 Importar los módulos de reCAPTCHA
import { RecaptchaModule, RECAPTCHA_SETTINGS, RecaptchaSettings } from 'ng-recaptcha';

// 🔑 Tu clave del sitio (SITE KEY)
const SITE_KEY = '6LdFhBcsAAAAAPGT5qCyx4novsFCXrMtUBWs-hO4';

export const appConfig: ApplicationConfig = {
  providers: [
    // 1. Providers existentes
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),

    // 2. Proporcionar la CONFIGURACIÓN DE RECAPTCHA
    {
      provide: RECAPTCHA_SETTINGS,
      useValue: {
        siteKey: SITE_KEY,
      } as RecaptchaSettings,
    },

    // 3. Importar el módulo principal de reCAPTCHA (ya que estás usando Standalone)
    RecaptchaModule,
  ],
};
