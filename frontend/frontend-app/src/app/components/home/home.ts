import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FavoriteData, VideoService } from '../../services/video.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, FormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  userMail: string | null = null;
  videos: FavoriteData[] = [];
  favorites: FavoriteData[] = [];
  isLoadingVideos: boolean = false;
  isLoadingFavorites: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private videoService: VideoService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.router.navigate(['']);
      return;
    }

    this.userMail = this.authService.getUser();

    this.loadVideos();

    this.cd.detectChanges();
  }

  logOut(): void {
    this.authService.logout(); // Usamos la inyección correcta
    this.router.navigate(['']);
  }

  loadVideos(): void {
    this.isLoadingVideos = true;
    this.videoService.getVideos().subscribe({
      next: (data) => {
        console.log(data);
        this.videos = data;
        this.isLoadingVideos = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar favoritos:', err);
        this.isLoadingVideos = false;
      },
    });

    this.videoService.getFavorites().subscribe({
      next: (data) => {
        this.favorites = data;
        this.isLoadingFavorites = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar favoritos:', err);
        this.isLoadingFavorites = false;
      },
    });
  }

  /**
   *  Marca un video como favorito (favorite = 1).
   * Lo mueve del array 'videos' al array 'favorites'.
   */
  markAsFavorite(videoIdToMark: string | number): void {
    const videoId = String(videoIdToMark);
    this.videoService.markAsFavorite(videoId).subscribe({
      next: (response) => {
        console.log('Video marcado como favorito:', response);

        // 1. Encontrar y mover el video
        const indexInVideos = this.videos.findIndex((v) => v.videoid === videoId);
        if (indexInVideos !== -1) {
          const videoToMove = this.videos[indexInVideos];

          // 2. Eliminar de la lista de videos disponibles (favorite = 0)
          this.videos.splice(indexInVideos, 1);

          // 3. Agregar a la lista de favoritos (favorite = 1)
          this.favorites.unshift(videoToMove); // Añadir al inicio de favoritos
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error al marcar como favorito:', err);
      },
    });
  }

  /**
   *  Desmarca un video como favorito (favorite = 0).
   * Lo mueve del array 'favorites' al array 'videos'.
   */
  unmarkAsFavorite(videoIdToUnmark: string | number): void {
    const videoId = String(videoIdToUnmark);
    this.videoService.unmarkAsFavorite(videoId).subscribe({
      next: (response) => {
        console.log('Video desmarcado como favorito:', response);

        // 1. Encontrar y mover el video
        const indexInFavorites = this.favorites.findIndex((f) => f.videoid === videoId);
        if (indexInFavorites !== -1) {
          const videoToMove = this.favorites[indexInFavorites];

          // 2. Eliminar de la lista de favoritos (favorite = 1)
          this.favorites.splice(indexInFavorites, 1);

          // 3. Agregar a la lista de videos disponibles (favorite = 0)
          this.videos.unshift(videoToMove); // Añadir al inicio de videos
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        console.error('Error al desmarcar como favorito:', err);
      },
    });
  }

  //BUSQUEDAS DE VIDEOS Y FAVORITOS
  searchTermVideos: string = '';
  searchTermFavorites: string = '';

  /**
   * Busca videos disponibles por título usando el servicio.
   * Actualiza this.videos con los resultados.
   */
  searchVideos(): void {
    const query = this.searchTermVideos.trim();

    if (query.length === 0) {
      // Si la búsqueda está vacía, recarga la lista completa
      this.loadVideos();
      return;
    }

    this.isLoadingVideos = true;
    this.videoService.searchVideos(query).subscribe({
      next: (data) => {
        this.videos = [...data];
        this.isLoadingVideos = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error al buscar videos:', err);
        this.isLoadingVideos = false; // Opcional: Mostrar un array vacío en caso de error de búsqueda
        this.videos = [];
      },
    });
  }
  /**
   * Busca favoritos por título usando el servicio.
   * Actualiza this.favorites con los resultados.
   */

  searchFavorites(): void {
    const query = this.searchTermFavorites.trim();

    if (query.length === 0) {
      // Si la búsqueda está vacía, recarga la lista completa
      this.loadVideos(); // loadVideos carga tanto videos como favoritos
      return;
    }

    this.isLoadingFavorites = true;
    this.videoService.searchFavorites(query).subscribe({
      next: (data) => {
        this.favorites = [...data];
        this.isLoadingFavorites = false;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error al buscar favoritos:', err);
        this.isLoadingFavorites = false; // Opcional: Mostrar un array vacío en caso de error de búsqueda
        this.favorites = [];
      },
    });
  }
}
