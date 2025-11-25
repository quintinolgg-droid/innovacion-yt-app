import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:4000/api/auth';

  constructor(private http: HttpClient) {}

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
    localStorage.setItem('token', token);
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
  }

  isLogged(): boolean {
    return !!this.getToken();
  }
}
