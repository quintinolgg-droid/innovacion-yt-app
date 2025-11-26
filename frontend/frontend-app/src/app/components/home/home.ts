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
  numberFav: number = 0;

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
        this.numberFav = data.length;
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
        this.showToast('¡Video agregado a favoritos!', 'success');

        // 1. Encontrar y mover el video
        const indexInVideos = this.videos.findIndex((v) => v.videoid === videoId);
        if (indexInVideos !== -1) {
          const videoToMove = this.videos[indexInVideos];

          // 2. Eliminar de la lista de videos disponibles (favorite = 0)
          this.videos.splice(indexInVideos, 1);

          // 3. Agregar a la lista de favoritos (favorite = 1)
          this.favorites.unshift(videoToMove); // Añadir al inicio de favoritos

          this.numberFav = this.favorites.length;
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        this.showToast('Error al agregar a favoritos. Intente de nuevo.', 'error');
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
        this.showToast('Video eliminado de favoritos.', 'success');

        // 1. Encontrar y mover el video
        const indexInFavorites = this.favorites.findIndex((f) => f.videoid === videoId);
        if (indexInFavorites !== -1) {
          const videoToMove = this.favorites[indexInFavorites];

          // 2. Eliminar de la lista de favoritos (favorite = 1)
          this.favorites.splice(indexInFavorites, 1);
          this.numberFav = this.favorites.length;

          // 3. Agregar a la lista de videos disponibles (favorite = 0)
          this.videos.unshift(videoToMove); // Añadir al inicio de videos
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        this.showToast('Error al desmarcar el video. Intente de nuevo.', 'error');
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
        this.numberFav = data.length;
        this.cd.detectChanges();
      },
      error: (err) => {
        console.error('Error al buscar favoritos:', err);
        this.isLoadingFavorites = false; // Opcional: Mostrar un array vacío en caso de error de búsqueda
        this.favorites = [];
      },
    });
  }

  /**
   * Muestra una notificación Toast de Bootstrap.
   * @param message Mensaje a mostrar.
   * @param type 'success' o 'error'.
   */
  showToast(message: string, type: 'success' | 'error'): void {
    const toastId = type === 'success' ? 'liveToastSuccess' : 'liveToastError';
    const messageElementId = type === 'success' ? 'toast-success-message' : 'toast-error-message';

    // 1. Actualizar el texto del mensaje
    const messageElement = document.getElementById(messageElementId);
    if (messageElement) {
      messageElement.textContent = message;
    }

    // 2. Encontrar el elemento Toast de Bootstrap
    const toastElement = document.getElementById(toastId);

    // 3. Mostrar el Toast usando la API global de Bootstrap
    if (toastElement) {
      // Usamos el objeto global 'bootstrap' para crear y mostrar el Toast.
      // (window as any) evita errores de TypeScript si 'bootstrap' no está tipado globalmente.
      const bsToast = new (window as any).bootstrap.Toast(toastElement);
      bsToast.show();
    }
  }

  copyLink(url: string): void {
    // 1. Verificar si el navegador soporta la API de portapapeles
    if (navigator.clipboard) {
      // 2. Usar la API moderna para escribir texto
      navigator.clipboard
        .writeText(url)
        .then(() => {
          // Notificación de éxito
          this.showToast('¡Enlace copiado al portapapeles!', 'success');
        })
        .catch((err) => {
          // En caso de error (p. ej., permisos denegados)
          console.error('Error al intentar copiar el enlace:', err);
          this.showToast('No se pudo copiar el enlace. Intenta manualmente.', 'error');
        });
    } else {
      // 3. Fallback para navegadores antiguos
      this.fallbackCopyTextToClipboard(url);
    }
  }

  //Para navegadores muy antiguos
  fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;

    // Hacer el campo invisible
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    try {
      document.execCommand('copy');
      this.showToast('¡Enlace copiado al portapapeles!', 'success');
    } catch (err) {
      this.showToast('No se pudo copiar el enlace. Navegador no compatible.', 'error');
    }

    document.body.removeChild(textArea);
  }
}
