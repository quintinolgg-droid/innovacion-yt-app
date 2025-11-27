import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { FavoriteData, VideoService } from '../../services/video.service';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiUtilsService } from '../../services/ui-utils.service';
import { Nav } from '../section/nav/nav';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

declare var bootstrap: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, NgFor, NgIf, FormsModule, Nav],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit, AfterViewInit {
  videoUrlSegura: SafeResourceUrl | undefined;

  videos: FavoriteData[] = [];
  favorites: FavoriteData[] = [];
  isLoadingVideos: boolean = false;
  isLoadingFavorites: boolean = false;
  numberFav: number = 0;

  @ViewChild('modalRef') modalElementRef!: ElementRef;
  showVideo: boolean = false;

  // Guardaremos la instancia del objeto Modal de Bootstrap aquí.
  private modalBootstrapInstance: any;

  constructor(
    private authService: AuthService,
    private router: Router,
    private videoService: VideoService,
    private cd: ChangeDetectorRef,
    protected uiUtilService: UiUtilsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    if (!this.authService.getToken()) {
      this.router.navigate(['']);
      return;
    }

    this.loadVideos();

    this.cd.detectChanges();
  }

  ngAfterViewInit(): void {
    if (this.modalElementRef && typeof bootstrap !== 'undefined') {
      // 1. Creamos la instancia del objeto Modal de Bootstrap
      this.modalBootstrapInstance = new bootstrap.Modal(this.modalElementRef.nativeElement, {
        // Opciones (opcionales)
        keyboard: true, // Permite cerrar con la tecla Esc
      });
    }
  }

  // Método que llamarás desde un botón o alguna lógica.
  abrirModal(): void {
    this.showVideo = false;
    // 2. Llamamos al método show() de la instancia
    if (this.modalBootstrapInstance) {
      this.modalBootstrapInstance.show();
    }
  }

  // Método opcional para cerrar el modal
  cerrarModal(): void {
    if (this.modalBootstrapInstance) {
      this.modalBootstrapInstance.hide();
    }
  }

  generarUrlSegura(idVideo: string): void {
    // Usar DomSanitizer para marcar la URL como segura para un recurso (iframe src)
    this.videoUrlSegura = this.sanitizer.bypassSecurityTrustResourceUrl(idVideo);
    this.abrirModal();
    setTimeout(() => {
      this.showVideo = true;
      this.cd.detectChanges();
    }, 0);
  }

  //Cargar videos desde las APIS
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
   */
  markAsFavorite(videoIdToMark: string | number): void {
    const videoId = String(videoIdToMark);
    this.videoService.markAsFavorite(videoId).subscribe({
      next: (response) => {
        this.uiUtilService.showToast('¡Video agregado a favoritos!', 'success');

        const indexInVideos = this.videos.findIndex((v) => v.videoid === videoId);
        if (indexInVideos !== -1) {
          const videoToMove = this.videos[indexInVideos];

          this.videos.splice(indexInVideos, 1);

          this.favorites.unshift(videoToMove);

          this.numberFav = this.favorites.length;
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        this.uiUtilService.showToast('Error al agregar a favoritos. Intente de nuevo.', 'error');
      },
    });
  }

  /**
   *  Desmarca un video como favorito (favorite = 0).
   */
  unmarkAsFavorite(videoIdToUnmark: string | number): void {
    const videoId = String(videoIdToUnmark);
    this.videoService.unmarkAsFavorite(videoId).subscribe({
      next: (response) => {
        this.uiUtilService.showToast('Video eliminado de favoritos.', 'success');

        const indexInFavorites = this.favorites.findIndex((f) => f.videoid === videoId);
        if (indexInFavorites !== -1) {
          const videoToMove = this.favorites[indexInFavorites];

          this.favorites.splice(indexInFavorites, 1);
          this.numberFav = this.favorites.length;

          this.videos.unshift(videoToMove);
          this.cd.detectChanges();
        }
      },
      error: (err) => {
        this.uiUtilService.showToast('Error al desmarcar el video. Intente de nuevo.', 'error');
      },
    });
  }

  //BUSQUEDAS DE VIDEOS Y FAVORITOS
  searchTermVideos: string = '';
  searchTermFavorites: string = '';

  /**
   * Busca videos disponibles por título usando el servicio.
   */
  searchVideos(): void {
    const query = this.searchTermVideos.trim();

    if (query.length === 0) {
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
        this.isLoadingVideos = false;
        this.videos = [];
      },
    });
  }

  /**
   * Busca favoritos por título usando el servicio.
   */
  searchFavorites(): void {
    const query = this.searchTermFavorites.trim();

    if (query.length === 0) {
      this.loadVideos();
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
        this.isLoadingFavorites = false;
        this.favorites = [];
      },
    });
  }
}
