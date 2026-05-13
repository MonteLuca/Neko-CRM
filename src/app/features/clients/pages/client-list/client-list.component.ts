import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { catchError, finalize, of } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { ClientFiltersComponent } from '../../components/client-filters/client-filters.component';
import { ClientTableComponent } from '../../components/client-table/client-table.component';
import {
  Client,
  ClientFilterCriteria,
  DEFAULT_CLIENT_FILTERS,
} from '../../models/client.model';
import { ClientService } from '../../services/client.service';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [
    Card,
    Button,
    ClientFiltersComponent,
    ClientTableComponent,
    EmptyStateComponent,
    LoadingSpinnerComponent,
  ],
  providers: [],
  template: `
    <div class="page">
      <div class="head">
        <div>
          <h1>Clientes</h1>
          <p class="muted">Búsqueda, filtros y paginación sobre la API simulada.</p>
        </div>
        <p-button label="Nuevo cliente" icon="pi pi-plus" (onClick)="router.navigate(['/clients/new'])" />
      </div>

      <p-card styleClass="mb-4">
        <app-client-filters
          [filters]="filters()"
          (filtersChange)="onFiltersChange($event)"
          [provinces]="provinces()"
        />
      </p-card>

      @if (loading()) {
        <app-loading-spinner message="Cargando clientes..." />
      } @else if (loadError()) {
        <p-card>
          <app-empty-state
            icon="pi pi-wifi-slash"
            title="No se pudieron cargar los clientes"
            [description]="loadError()!"
          />
          <div class="retry">
            <p-button label="Reintentar" icon="pi pi-refresh" (onClick)="reload()" />
          </div>
        </p-card>
      } @else if (!allClients().length) {
        <app-empty-state
          title="No hay clientes"
          description="Creá el primero o verificá que JSON Server esté en ejecución."
          actionLabel="Nuevo cliente"
          actionLink="/clients/new"
        />
      } @else if (!filteredClients().length) {
        <app-empty-state
          title="Sin resultados"
          description="Probá ajustar los filtros o limpiarlos para ver más registros."
        />
      } @else {
        <p-card>
          <app-client-table
            [clients]="filteredClients()"
            (view)="onView($event)"
            (edit)="onEdit($event)"
            (deactivate)="onDeactivateRequest($event)"
          />
        </p-card>
      }
    </div>
  `,
  styles: `
    .page {
      max-width: 1200px;
      margin: 0 auto;
    }
    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    h1 {
      margin: 0 0 0.25rem;
      font-size: 1.75rem;
    }
    .muted {
      margin: 0;
      color: var(--p-text-muted-color);
    }
    .mb-4 {
      margin-bottom: 1.5rem;
    }
    .retry {
      display: flex;
      justify-content: center;
      padding-bottom: 1rem;
    }
  `,
})
export class ClientListComponent implements OnInit {
  readonly router = inject(Router);
  private readonly clientsApi = inject(ClientService);
  private readonly notify = inject(NotificationService);
  private readonly confirmation = inject(ConfirmationService);

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly allClients = signal<Client[]>([]);
  readonly filters = signal<ClientFilterCriteria>({ ...DEFAULT_CLIENT_FILTERS });
  readonly provinces = signal<string[]>([]);
  readonly filteredClients = signal<Client[]>([]);

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.clientsApi
      .getClients()
      .pipe(
        catchError(() => {
          this.loadError.set(
            'Comprobá que JSON Server esté activo: npm run mock-api (puerto 3000).',
          );
          return of([] as Client[]);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((list) => {
        this.allClients.set(list);
        const prov = [...new Set(list.map((c) => c.province))].sort((a, b) =>
          a.localeCompare(b),
        );
        this.provinces.set(prov);
        this.applyFilters();
      });
  }

  onFiltersChange(next: ClientFilterCriteria): void {
    this.filters.set(next);
    this.applyFilters();
  }

  onView(client: Client): void {
    void this.router.navigate(['/clients', client.id]);
  }

  onEdit(client: Client): void {
    void this.router.navigate(['/clients', client.id, 'edit']);
  }

  onDeactivateRequest(client: Client): void {
    this.confirmation.confirm({
      header: 'Confirmar baja lógica',
      message: `¿Dar de baja a "${client.name}"? El registro permanecerá con estado "Dado de baja".`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Dar de baja',
      rejectLabel: 'Cancelar',
      accept: () => this.deactivateConfirmed(client),
    });
  }

  private deactivateConfirmed(client: Client): void {
    this.clientsApi.deactivateClient(client.id).subscribe({
      next: () => {
        this.notify.success('Cliente dado de baja correctamente.');
        this.reload();
      },
      error: () => {
        this.notify.error('No se pudo completar la baja. Intentá nuevamente.');
      },
    });
  }

  private applyFilters(): void {
    const filtered = this.clientsApi.filterClients(this.allClients(), this.filters());
    this.filteredClients.set(filtered);
  }
}
