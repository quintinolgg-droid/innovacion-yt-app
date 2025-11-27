import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  { path: '', renderMode: RenderMode.Server },
  { path: 'home', renderMode: RenderMode.Server },
  { path: 'register', renderMode: RenderMode.Server },
  { path: 'forgot-password', renderMode: RenderMode.Server },
  {
    path: 'reset-password/:token',
    renderMode: RenderMode.Server,
  },
];
