import { Component, Input, computed, signal } from '@angular/core';
import { Tag } from 'primeng/tag';
import { ClientStatus } from '../../models/client.model';

const LABELS: Record<ClientStatus, string> = {
  ACTIVE: 'Activo',
  POTENTIAL: 'Potencial',
  INACTIVE: 'Inactivo',
  PENDING_CONTACT: 'Pendiente de contacto',
  DELETED: 'Dado de baja',
};

const SEVERITY: Record<ClientStatus, 'success' | 'warn' | 'danger' | 'secondary' | 'info'> = {
  ACTIVE: 'success',
  POTENTIAL: 'warn',
  PENDING_CONTACT: 'warn',
  INACTIVE: 'secondary',
  DELETED: 'danger',
};

@Component({
  selector: 'app-client-status-badge',
  standalone: true,
  imports: [Tag],
  template: ` <p-tag [value]="label()" [severity]="severity()" /> `,
})
export class ClientStatusBadgeComponent {
  private readonly statusSignal = signal<ClientStatus>('ACTIVE');

  @Input({ required: true }) set status(value: ClientStatus) {
    this.statusSignal.set(value);
  }

  readonly label = computed(() => LABELS[this.statusSignal()]);
  readonly severity = computed(() => SEVERITY[this.statusSignal()]);
}
