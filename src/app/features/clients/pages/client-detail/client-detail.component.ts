import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Divider } from 'primeng/divider';
import { catchError, finalize, of } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { ClientStatusBadgeComponent } from '../../components/client-status-badge/client-status-badge.component';
import { Client } from '../../models/client.model';
import { ClientService } from '../../services/client.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [
    Card,
    Avatar,
    Button,
    Divider,
    DatePipe,
    ClientStatusBadgeComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="page">
      @if (loading()) {
        <app-loading-spinner message="Cargando cliente..." />
      } @else if (error()) {
        <app-empty-state
          icon="pi pi-search-minus"
          title="Cliente no encontrado"
          [description]="error()!"
          actionLabel="Volver al listado"
          actionLink="/clients"
        />
      } @else if (client()) {
        <div class="head">
          <div class="head-title">
            @if (client()!.avatarUrl) {
              <img class="head-avatar" [src]="client()!.avatarUrl!" [alt]="'Foto de ' + client()!.name" />
            } @else {
              <p-avatar [label]="detailInitials(client()!)" shape="circle" size="large" styleClass="head-avatar-fallback" />
            }
            <div>
              <h1>{{ client()!.name }}</h1>
              <p class="muted">Detalle del registro comercial</p>
            </div>
          </div>
          <div class="head-actions">
            <p-button
              label="Volver"
              icon="pi pi-arrow-left"
              severity="secondary"
              (onClick)="router.navigate(['/clients'])"
            />
            @if (client()!.status !== 'DELETED') {
              <p-button
                label="Editar"
                icon="pi pi-pencil"
                (onClick)="router.navigate(['/clients', client()!.id, 'edit'])"
              />
              <p-button
                label="Dar de baja"
                icon="pi pi-user-minus"
                severity="danger"
                (onClick)="confirmDeactivate()"
              />
            }
          </div>
        </div>

        <p-card>
          <div class="grid">
            <div>
              <span class="lbl">Documento</span>
              <p class="val">{{ client()!.documentNumber }}</p>
            </div>
            <div>
              <span class="lbl">Email</span>
              <p class="val">{{ client()!.email }}</p>
            </div>
            <div>
              <span class="lbl">Teléfono</span>
              <p class="val">{{ client()!.phone }}</p>
            </div>
            <div>
              <span class="lbl">Provincia / Ciudad</span>
              <p class="val">{{ client()!.province }} — {{ client()!.city }}</p>
            </div>
            @if (client()!.address) {
              <div class="span-2">
                <span class="lbl">Dirección</span>
                <p class="val">{{ client()!.address }}</p>
              </div>
            }
            <div>
              <span class="lbl">Estado</span>
              <p class="val">
                <app-client-status-badge [status]="client()!.status" />
              </p>
            </div>
            <div>
              <span class="lbl">Fecha de alta</span>
              <p class="val">{{ client()!.createdAt | date: 'medium' }}</p>
            </div>
            <div>
              <span class="lbl">Última modificación</span>
              <p class="val">{{ client()!.updatedAt | date: 'medium' }}</p>
            </div>
          </div>
          <p-divider />
          <div>
            <span class="lbl">Observaciones</span>
            <p class="val notes">{{ client()!.notes || '—' }}</p>
          </div>
        </p-card>
      }
    </div>
  `,
  styles: `
    .page {
      max-width: 800px;
      margin: 0 auto;
    }
    .head {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.25rem;
      align-items: flex-start;
    }
    .head-title {
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: 0;
    }
    .head-avatar {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
      border: 2px solid #e2e8f0;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.08);
    }
    :host ::ng-deep .head-avatar-fallback.p-avatar {
      width: 3.5rem;
      height: 3.5rem;
      font-size: 1.25rem;
      font-weight: 600;
      flex-shrink: 0;
    }
    h1 {
      margin: 0 0 0.25rem;
      font-size: 1.65rem;
    }
    .muted {
      margin: 0;
      color: var(--p-text-muted-color);
    }
    .head-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem 1.5rem;
    }
    @media (max-width: 600px) {
      .grid {
        grid-template-columns: 1fr;
      }
    }
    .span-2 {
      grid-column: span 2;
    }
    @media (max-width: 600px) {
      .span-2 {
        grid-column: span 1;
      }
    }
    .lbl {
      font-size: 0.8rem;
      color: var(--p-text-muted-color);
      display: block;
      margin-bottom: 0.2rem;
    }
    .val {
      margin: 0;
      font-weight: 500;
    }
    .notes {
      white-space: pre-wrap;
      font-weight: 400;
    }
  `,
})
export class ClientDetailComponent implements OnInit {
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ClientService);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly client = signal<Client | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isFinite(id)) {
      this.loading.set(false);
      this.error.set('El identificador no es válido.');
      return;
    }
    this.api
      .getClientById(id)
      .pipe(
        catchError(() => {
          this.error.set('No se pudo cargar el cliente. Verificá la API o el ID.');
          return of(null);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((c) => {
        if (c) {
          this.client.set(c);
        } else if (!this.error()) {
          this.error.set('No existe un cliente con ese identificador.');
        }
      });
  }

  detailInitials(c: Client): string {
    const name = c.name?.trim();
    if (!name) {
      return '?';
    }
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    const w = parts[0];
    if (w.length >= 2) {
      return w.slice(0, 2).toUpperCase();
    }
    return `${w[0]}${w[0]}`.toUpperCase();
  }

  confirmDeactivate(): void {
    const c = this.client();
    if (!c) {
      return;
    }
    this.confirmation.confirm({
      header: 'Confirmar baja lógica',
      message: `¿Dar de baja a "${c.name}"?`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Dar de baja',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.api.deactivateClient(c.id).subscribe({
          next: (updated) => {
            this.client.set(updated);
            this.notify.success('Cliente dado de baja correctamente.');
          },
          error: () => this.notify.error('No se pudo completar la baja.'),
        });
      },
    });
  }
}
