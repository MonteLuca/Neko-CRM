import { DatePipe } from '@angular/common';
import { Component, Input, output } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { Client } from '../../models/client.model';
import { ClientStatusBadgeComponent } from '../client-status-badge/client-status-badge.component';

@Component({
  selector: 'app-client-table',
  standalone: true,
  imports: [TableModule, Button, DatePipe, ClientStatusBadgeComponent],
  template: `
    <p-table
      [value]="clients"
      [paginator]="true"
      [rows]="10"
      [rowsPerPageOptions]="[10, 25, 50]"
      [showCurrentPageReport]="true"
      currentPageReportTemplate="Mostrando {first} a {last} de {totalRecords} clientes"
      [tableStyle]="{ 'min-width': '52rem' }"
      styleClass="p-datatable-sm"
    >
      <ng-template pTemplate="header">
        <tr>
          <th>Nombre</th>
          <th>Documento</th>
          <th>Email</th>
          <th>Teléfono</th>
          <th>Provincia</th>
          <th>Ciudad</th>
          <th>Estado</th>
          <th>Fecha de alta</th>
          <th style="width: 11rem">Acciones</th>
        </tr>
      </ng-template>
      <ng-template pTemplate="body" let-client>
        <tr>
          <td>{{ client.name }}</td>
          <td>{{ client.documentNumber }}</td>
          <td>{{ client.email }}</td>
          <td>{{ client.phone }}</td>
          <td>{{ client.province }}</td>
          <td>{{ client.city }}</td>
          <td>
            <app-client-status-badge [status]="client.status" />
          </td>
          <td>{{ client.createdAt | date: 'shortDate' }}</td>
          <td>
            <div class="actions">
              <p-button
                icon="pi pi-eye"
                [rounded]="true"
                [text]="true"
                severity="secondary"
                (onClick)="view.emit(client)"
                ariaLabel="Ver detalle"
              />
              <p-button
                icon="pi pi-pencil"
                [rounded]="true"
                [text]="true"
                [disabled]="client.status === 'DELETED'"
                (onClick)="edit.emit(client)"
                ariaLabel="Editar"
              />
              <p-button
                icon="pi pi-user-minus"
                [rounded]="true"
                [text]="true"
                severity="danger"
                [disabled]="client.status === 'DELETED'"
                (onClick)="deactivate.emit(client)"
                ariaLabel="Dar de baja"
              />
            </div>
          </td>
        </tr>
      </ng-template>
      <ng-template pTemplate="emptymessage">
        <tr>
          <td colspan="9" class="empty-cell">Sin filas para mostrar</td>
        </tr>
      </ng-template>
    </p-table>
  `,
  styles: `
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.15rem;
    }
    .empty-cell {
      text-align: center;
      padding: 2rem !important;
      color: var(--p-text-muted-color);
    }
  `,
})
export class ClientTableComponent {
  @Input({ required: true }) clients: Client[] = [];

  readonly view = output<Client>();
  readonly edit = output<Client>();
  readonly deactivate = output<Client>();
}
