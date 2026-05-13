import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import {
  ClientFilterCriteria,
  ClientSortOrder,
  ClientStatusFilter,
  DEFAULT_CLIENT_FILTERS,
} from '../../models/client.model';

interface Option<T extends string> {
  label: string;
  value: T;
}

@Component({
  selector: 'app-client-filters',
  standalone: true,
  imports: [FormsModule, Button, InputText, Select],
  template: `
    <div class="filters">
      <section class="filters__block" aria-labelledby="filters-search-title">
        <h3 class="filters__title" id="filters-search-title">Buscar en el listado</h3>
        <div class="filters__grid filters__grid--search">
          <div class="field">
            <label for="f-name">Nombre o razón social</label>
            <input
              type="text"
              pInputText
              fluid
              id="f-name"
              [ngModel]="filters.name"
              (ngModelChange)="patch({ name: $event })"
              placeholder="Texto libre…"
              autocomplete="off"
            />
          </div>
          <div class="field">
            <label for="f-email">Email</label>
            <input
              type="text"
              pInputText
              fluid
              id="f-email"
              [ngModel]="filters.email"
              (ngModelChange)="patch({ email: $event })"
              placeholder="contiene…"
              autocomplete="off"
            />
          </div>
          <div class="field">
            <label for="f-doc">DNI / CUIT</label>
            <input
              type="text"
              pInputText
              fluid
              id="f-doc"
              [ngModel]="filters.document"
              (ngModelChange)="patch({ document: $event })"
              placeholder="Número parcial"
              autocomplete="off"
            />
          </div>
        </div>
      </section>

      <div class="filters__divider" role="presentation"></div>

      <section class="filters__block filters__block--criteria" aria-labelledby="filters-refine-title">
        <div class="filters__head">
          <h3 class="filters__title" id="filters-refine-title">Filtrar y ordenar</h3>
          <p-button
            class="filters__clear"
            label="Limpiar filtros"
            icon="pi pi-filter-slash"
            severity="secondary"
            [outlined]="true"
            size="small"
            (onClick)="clear()"
          />
        </div>
        <div class="filters__grid filters__grid--criteria">
          <div class="field field--grow">
            <label for="f-status">Estado comercial</label>
            <p-select
              inputId="f-status"
              [options]="statusOptions"
              optionLabel="label"
              optionValue="value"
              [ngModel]="filters.status"
              (ngModelChange)="patch({ status: $event })"
              placeholder="Elegí un estado"
              [fluid]="true"
              [showClear]="false"
            />
          </div>
          <div class="field">
            <label for="f-prov">Provincia</label>
            <p-select
              inputId="f-prov"
              [options]="provinceOptionsSel"
              optionLabel="label"
              optionValue="value"
              [ngModel]="filters.province"
              (ngModelChange)="patch({ province: $event })"
              placeholder="Todas"
              [showClear]="true"
              [fluid]="true"
            />
          </div>
          <div class="field field--wide">
            <label for="f-sort">Orden por fecha de alta</label>
            <p-select
              inputId="f-sort"
              [options]="sortOptions"
              optionLabel="label"
              optionValue="value"
              [ngModel]="filters.sort"
              (ngModelChange)="patch({ sort: $event })"
              [fluid]="true"
            />
          </div>
        </div>
      </section>
    </div>
  `,
  styles: `
    .filters {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .filters__block {
      margin: 0;
    }

    .filters__title {
      margin: 0 0 0.75rem;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--p-text-muted-color);
    }

    .filters__divider {
      height: 1px;
      background: color-mix(in srgb, var(--p-content-border-color, #888) 55%, transparent);
      border: 0;
      margin: 0;
    }

    .filters__head {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem 1rem;
      margin-bottom: 0.75rem;
    }

    .filters__head .filters__title {
      margin: 0;
    }

    .filters__clear {
      flex-shrink: 0;
    }

    .filters__grid {
      display: grid;
      gap: 1rem 1.25rem;
      align-items: end;
    }

    .filters__grid--search {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .filters__grid--criteria {
      grid-template-columns: minmax(12rem, 1.35fr) minmax(9rem, 1fr) minmax(14rem, 1.25fr);
    }

    @media (max-width: 960px) {
      .filters__grid--search {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .filters__grid--criteria {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .field--wide {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 560px) {
      .filters__grid--search,
      .filters__grid--criteria {
        grid-template-columns: 1fr;
      }
      .field--wide {
        grid-column: auto;
      }
      .filters__clear {
        width: 100%;
      }
      :host ::ng-deep .filters__clear .p-button {
        width: 100%;
      }
    }

    .field label {
      display: block;
      font-size: 0.8125rem;
      font-weight: 500;
      margin-bottom: 0.4rem;
      color: var(--p-text-color);
      opacity: 0.92;
    }

    .field--grow {
      min-width: 0;
    }

    .field--wide {
      min-width: 0;
    }
  `,
})
export class ClientFiltersComponent {
  @Input({ required: true }) filters!: ClientFilterCriteria;
  @Output() readonly filtersChange = new EventEmitter<ClientFilterCriteria>();

  @Input() provinces: string[] = [];

  readonly statusOptions: Option<ClientStatusFilter>[] = [
    { label: 'Activos (oculta dados de baja)', value: 'NON_DELETED' },
    { label: 'Todos los estados', value: 'ALL' },
    { label: 'Potencial', value: 'POTENTIAL' },
    { label: 'Activo', value: 'ACTIVE' },
    { label: 'Inactivo', value: 'INACTIVE' },
    { label: 'Pendiente de contacto', value: 'PENDING_CONTACT' },
    { label: 'Dado de baja', value: 'DELETED' },
  ];

  readonly sortOptions: Option<ClientSortOrder>[] = [
    { label: 'Más reciente primero', value: 'createdAt_desc' },
    { label: 'Más antiguo primero', value: 'createdAt_asc' },
  ];

  get provinceOptionsSel(): { label: string; value: string }[] {
    return this.provinces.map((p) => ({ label: p, value: p }));
  }

  patch(partial: Partial<ClientFilterCriteria>): void {
    this.filtersChange.emit({ ...this.filters, ...partial });
  }

  clear(): void {
    this.filtersChange.emit({ ...DEFAULT_CLIENT_FILTERS });
  }
}
