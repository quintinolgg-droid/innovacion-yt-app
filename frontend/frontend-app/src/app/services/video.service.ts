import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Necesitas el AuthService para obtener el token

// Define una interfaz para el video de la lista general (YouTube, etc.)
interface VideoData {
  videoId: string;
  title: string;
  thumbnail: string;
  url: string;
}

// Define una interfaz para el favorito guardado en tu DB (incluye el _id de MongoDB)
interface FavoriteData extends VideoData {
  _id: string; // ID de MongoDB del documento favorito
  user: string; // ID del usuario
}

@Injectable({
  providedIn: 'root',
})
export class VideoService {
  private apiUrl = 'http://localhost:4000/api/favorites';

  constructor(private http: HttpClient, private authService: AuthService) {}

  // --- Función auxiliar para la cabecera con el token ---
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken(); // Asume que este método existe en AuthService
    return new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`, // Envía el token al backend
    });
  }

  // =======================================================
  // Funciones CRUD de Favoritos
  // =======================================================

  /**
   * GET /api/favorites/list
   * Obtiene todos los videos favoritos del usuario actual.
   */
  getFavorites(): Observable<FavoriteData[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<FavoriteData[]>(`${this.apiUrl}/list`, { headers });
  }

  /**
   * POST /api/favorites/add
   * Agrega un video a la lista de favoritos.
   */
  addFavorite(videoData: VideoData): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/add`, videoData, { headers });
  }

  /**
   * DELETE /api/favorites/remove/:id
   * Elimina un favorito usando el ID de MongoDB (el _id del documento Favorite).
   */
  removeFavorite(favoriteId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    // Usa favoriteId, que es el _id del documento en MongoDB
    return this.http.delete(`${this.apiUrl}/remove/${favoriteId}`, { headers });
  }
}
