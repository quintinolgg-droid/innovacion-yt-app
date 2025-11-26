import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service'; // Necesitas el AuthService para obtener el token

// Define una interfaz para el video de la lista general (YouTube, etc.)
export interface VideoData {
  videoid: string;
  title: string;
  thumbnail: string;
  url: string;
}

// Define una interfaz para el favorito guardado en tu DB (incluye el _id de MongoDB)
export interface FavoriteData extends VideoData {
  id: string; // ID de MongoDB del documento favorito
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
   * GET /api/favorites/listall
   * Obtiene todos los videos
   */
  getVideos(): Observable<FavoriteData[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<FavoriteData[]>(`${this.apiUrl}/listall`, { headers });
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
    // favoriteId ahora es el ID numérico de la fila de PostgreSQL
    return this.http.delete(`${this.apiUrl}/remove/${favoriteId}`, { headers });
  }

  /**
   * PUT /api/favorites/mark
   * Marca un video existente en la DB como FAVORITO (favorite = 1).
   * Solo necesita el videoId para identificar el registro junto con el user_id del token.
   */
  markAsFavorite(videoId: string): Observable<any> {
    const headers = this.getAuthHeaders(); // El cuerpo de la petición solo necesita el videoId
    return this.http.put(`${this.apiUrl}/mark`, { videoId }, { headers });
  }
  /**
   * PUT /api/favorites/unmark
   * Marca un video existente en la DB como NO FAVORITO (favorite = 0).
   */

  unmarkAsFavorite(videoId: string): Observable<any> {
    const headers = this.getAuthHeaders(); // El cuerpo de la petición solo necesita el videoId
    return this.http.put(`${this.apiUrl}/unmark`, { videoId }, { headers });
  }
}
