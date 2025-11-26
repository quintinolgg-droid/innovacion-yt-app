import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UiUtilsService {
  // Pegar aquí el método showToast:
  showToast(message: string, type: 'success' | 'error'): void {
    const toastId = type === 'success' ? 'liveToastSuccess' : 'liveToastError';
    const messageElementId = type === 'success' ? 'toast-success-message' : 'toast-error-message';

    const messageElement = document.getElementById(messageElementId);
    if (messageElement) {
      messageElement.textContent = message;
    }

    const toastElement = document.getElementById(toastId);
    if (toastElement) {
      // Se asume que bootstrap está disponible globalmente
      const bsToast = new (window as any).bootstrap.Toast(toastElement);
      bsToast.show();
    }
  }

  // Pegar aquí el método copyLink y fallbackCopyTextToClipboard:
  copyLink(url: string): void {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          this.showToast('¡Enlace copiado al portapapeles!', 'success');
        })
        .catch((err) => {
          console.error('Error al intentar copiar el enlace:', err);
          this.showToast('No se pudo copiar el enlace. Intenta manualmente.', 'error');
        });
    } else {
      this.fallbackCopyTextToClipboard(url);
    }
  }

  fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
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
