import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  constructor(private readonly messages: MessageService) {}

  success(message: string, title = 'Éxito'): void {
    this.messages.add({ severity: 'success', summary: title, detail: message, life: 4000 });
  }

  error(message: string, title = 'Error'): void {
    this.messages.add({ severity: 'error', summary: title, detail: message, life: 6000 });
  }

  warning(message: string, title = 'Atención'): void {
    this.messages.add({ severity: 'warn', summary: title, detail: message, life: 5000 });
  }
}
