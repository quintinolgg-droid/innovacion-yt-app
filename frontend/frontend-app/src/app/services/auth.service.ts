import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:4000/api/auth';
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    // 🔑 Inyectar PLATFORM_ID para determinar el entorno
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // 🔑 Determinar el entorno en el constructor
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  forgotPassword(email: string): Observable<any> {
    const url = `${this.apiUrl}/forgot-password`; // <- Necesitas crear esta ruta en Express
    return this.http.post(url, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    // El backend espera una petición POST a /api/auth/reset-password/:token
    const url = `${this.apiUrl}/reset-password/${token}`;
    return this.http.put(url, { newPassword });
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  saveToken(token: string) {
    if (this.isBrowser) {
      // 🔑 Condición
      localStorage.setItem('token', token);
    }
  }

  getToken() {
    if (this.isBrowser) {
      // 🔑 Condición
      return localStorage.getItem('token');
    }
    return null; // Devuelve null si no está en el navegador
  }

  isLogged(): boolean {
    // 🔑 Condición y lógica de verificación
    if (this.isBrowser) {
      return !!this.getToken();
    }
    return false; // Nunca estará logueado en el servidor
  }

  setUser(emailOrUser: string): void {
    if (this.isBrowser) {
      // 🔑 Condición
      localStorage.setItem('userName', emailOrUser);
    }
  }

  getUser(): string | null {
    if (this.isBrowser) {
      // 🔑 Condición
      return localStorage.getItem('userName');
    }
    return null; // Devuelve null si no está en el navegador
  }

  logout() {
    if (this.isBrowser) {
      // 🔑 Condición
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
    }
  }
}
