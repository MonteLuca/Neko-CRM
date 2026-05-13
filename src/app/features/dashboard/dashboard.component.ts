import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { UIChart } from 'primeng/chart';
import { catchError, finalize, of } from 'rxjs';
import { ClientService } from '../clients/services/client.service';
import {
  Client,
  ClientStatus,
  ClientsByMonthChart,
  ClientsByProvinceChart,
  ClientsByStatusChart,
  DashboardMetrics,
} from '../clients/models/client.model';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import { Message } from 'primeng/message';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Card, Button, UIChart, LoadingSpinnerComponent, Message, DatePipe, RouterLink],
  template: `
    <div class="page">
      <h1>Dashboard</h1>
      <p class="lead">Resumen de clientes según datos de la API simulada.</p>

      <div class="actions">
        <p-button
          label="Ver listado de clientes"
          icon="pi pi-list"
          severity="secondary"
          [outlined]="true"
          (onClick)="router.navigate(['/clients'])"
        />
      </div>

      @if (loading()) {
        <app-loading-spinner message="Cargando métricas..." />
      } @else if (error()) {
        <p-message severity="error" [text]="error()!" styleClass="w-full" />
      } @else {
        <div class="cards">
          <p-card styleClass="metric">
            <div class="metric__row">
              <span class="metric__label">Total clientes</span>
              <span class="metric__value">{{ metrics()!.total }}</span>
            </div>
          </p-card>
          <p-card styleClass="metric metric--ok">
            <div class="metric__row">
              <span class="metric__label">Activos</span>
              <span class="metric__value">{{ metrics()!.active }}</span>
            </div>
          </p-card>
          <p-card styleClass="metric metric--warn">
            <div class="metric__row">
              <span class="metric__label">Potenciales</span>
              <span class="metric__value">{{ metrics()!.potential }}</span>
            </div>
          </p-card>
          <p-card styleClass="metric metric--pend">
            <div class="metric__row">
              <span class="metric__label">Pendientes de contacto</span>
              <span class="metric__value">{{ metrics()!.pendingContact }}</span>
            </div>
          </p-card>
          <p-card styleClass="metric metric--muted">
            <div class="metric__row">
              <span class="metric__label">Inactivos</span>
              <span class="metric__value">{{ metrics()!.inactive }}</span>
            </div>
          </p-card>
          <p-card styleClass="metric metric--danger">
            <div class="metric__row">
              <span class="metric__label">Dados de baja</span>
              <span class="metric__value">{{ metrics()!.deleted }}</span>
            </div>
          </p-card>
          <p-card styleClass="metric metric--accent">
            <div class="metric__row">
              <span class="metric__label">Nuevos este mes</span>
              <span class="metric__value">{{ metrics()!.newThisMonth }}</span>
            </div>
          </p-card>
        </div>

        <div class="charts-area">
          <p-card header="Clientes por estado — barras" styleClass="chart-panel chart-panel--wide">
            <div class="bar-chart-host">
              <p-chart
                type="bar"
                [data]="barChartData()"
                [options]="barChartOptions"
                [responsive]="true"
                height="280"
              />
            </div>
          </p-card>

          <div class="charts-grid">
            <p-card header="Últimas altas" styleClass="chart-panel">
              <p class="recent-lead">Clientes dados de alta más recientemente (excluye dados de baja).</p>
              <ul class="recent-list">
                @for (c of recentClients(); track c.id) {
                  <li class="recent-item">
                    <div class="recent-main">
                      <a [routerLink]="['/clients', c.id]" class="recent-name">{{ c.name }}</a>
                      <span class="recent-loc">{{ c.province }} · {{ c.city }}</span>
                    </div>
                    <div class="recent-side">
                      <span class="recent-badge" [class]="'recent-badge--' + c.status">{{ recentStatusLabel(c.status) }}</span>
                      <time class="recent-date" [attr.datetime]="c.createdAt">{{ c.createdAt | date: 'short' }}</time>
                    </div>
                  </li>
                }
              </ul>
              @if (!recentClients().length) {
                <p class="recent-empty">No hay registros para mostrar.</p>
              }
            </p-card>

            <p-card header="Altas por mes" styleClass="chart-panel">
              <div class="bar-list">
                @for (row of byMonth(); track row.monthKey) {
                  <div class="bar-row">
                    <span class="bar-label">{{ row.label }}</span>
                    <div class="bar-track">
                      <div
                        class="bar-fill bar-fill--alt"
                        [style.width.%]="barPercent(row.count, maxMonth())"
                      ></div>
                    </div>
                    <span class="bar-count">{{ row.count }}</span>
                  </div>
                }
              </div>
            </p-card>

            <p-card header="Por provincia" styleClass="chart-panel">
              <div class="bar-list">
                @for (row of byProvince(); track row.province) {
                  <div class="bar-row">
                    <span class="bar-label">{{ row.province }}</span>
                    <div class="bar-track">
                      <div
                        class="bar-fill bar-fill--prov"
                        [style.width.%]="barPercent(row.count, maxProv())"
                      ></div>
                    </div>
                    <span class="bar-count">{{ row.count }}</span>
                  </div>
                }
              </div>
            </p-card>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .page {
      max-width: 1100px;
      margin: 0 auto;
    }
    h1 {
      margin: 0 0 0.35rem;
      font-size: 1.75rem;
    }
    .lead {
      margin: 0 0 1rem;
      color: var(--p-text-muted-color);
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(10.5rem, 1fr));
      gap: 0.85rem;
      margin-bottom: 1.75rem;
    }
    :host ::ng-deep .metric .p-card-body {
      padding: 1rem 1.1rem;
    }
    .metric__row {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem 1rem;
      width: 100%;
    }
    .metric__label {
      flex: 1;
      min-width: 0;
      font-size: 0.78rem;
      color: var(--p-text-muted-color);
      line-height: 1.25;
    }
    .metric__value {
      flex-shrink: 0;
      font-size: 1.65rem;
      font-weight: 700;
      line-height: 1;
      color: var(--p-primary-color);
      text-align: right;
    }
    :host ::ng-deep .metric--ok .metric__value {
      color: var(--p-green-500);
    }
    :host ::ng-deep .metric--warn .metric__value,
    :host ::ng-deep .metric--pend .metric__value {
      color: var(--p-orange-500);
    }
    :host ::ng-deep .metric--muted .metric__value {
      color: var(--p-surface-500);
    }
    :host ::ng-deep .metric--danger .metric__value {
      color: var(--p-red-500);
    }
    :host ::ng-deep .metric--accent .metric__value {
      color: var(--p-purple-500);
    }
    .charts-area {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
      gap: 1rem;
      align-items: start;
    }
    :host ::ng-deep .charts-grid .p-card.chart-panel {
      align-self: start;
      width: 100%;
      min-height: 0;
      height: auto;
      background: #f1f5f9;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
    }
    :host ::ng-deep .chart-panel .p-card-body {
      flex: 0 1 auto;
      flex-grow: 0;
      background: #f1f5f9;
      color: #0f172a;
    }
    :host ::ng-deep .chart-panel .p-card-header,
    :host ::ng-deep .chart-panel .p-card-title {
      background: #e2e8f0;
      color: #0f172a;
      border-color: #cbd5e1;
    }
    :host ::ng-deep .chart-panel .p-card-footer {
      display: none;
    }
    :host ::ng-deep .chart-panel.chart-panel--wide.p-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
    }
    :host ::ng-deep .chart-panel.chart-panel--wide .p-card-body {
      background: #f8fafc;
      flex-grow: 0;
    }
    .bar-chart-host {
      position: relative;
      min-height: 280px;
    }
    .bar-list {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .bar-row {
      display: grid;
      grid-template-columns: minmax(8.5rem, 11rem) 1fr 2rem;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
    }
    .bar-label {
      color: #475569;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      min-width: 0;
    }
    .bar-track {
      height: 0.55rem;
      border-radius: 999px;
      background: #e2e8f0;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      border-radius: inherit;
      background: var(--p-primary-color);
      min-width: 2px;
      transition: width 0.35s ease;
    }
    .bar-fill--alt {
      background: var(--p-purple-500);
    }
    .bar-fill--prov {
      background: var(--p-teal-500);
    }
    .bar-count {
      text-align: right;
      font-weight: 600;
    }
    .recent-lead {
      margin: 0 0 0.85rem;
      font-size: 0.8rem;
      color: #64748b;
      line-height: 1.35;
    }
    .recent-list {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .recent-item {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.5rem 1rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .recent-item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .recent-main {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
      min-width: 0;
      flex: 1;
    }
    .recent-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: #0f172a;
      text-decoration: none;
    }
    .recent-name:hover {
      color: var(--p-primary-color);
      text-decoration: underline;
    }
    .recent-loc {
      font-size: 0.78rem;
      color: #64748b;
    }
    .recent-side {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
      flex-shrink: 0;
    }
    .recent-badge {
      font-size: 0.68rem;
      font-weight: 600;
      padding: 0.12rem 0.45rem;
      border-radius: 999px;
      background: #e2e8f0;
      color: #475569;
    }
    .recent-badge--ACTIVE {
      background: rgba(22, 163, 74, 0.15);
      color: #15803d;
    }
    .recent-badge--POTENTIAL {
      background: rgba(234, 88, 12, 0.12);
      color: #c2410c;
    }
    .recent-badge--PENDING_CONTACT {
      background: rgba(245, 158, 11, 0.15);
      color: #b45309;
    }
    .recent-badge--INACTIVE {
      background: rgba(100, 116, 139, 0.18);
      color: #475569;
    }
    .recent-date {
      font-size: 0.72rem;
      color: #94a3b8;
      font-variant-numeric: tabular-nums;
    }
    .recent-empty {
      margin: 0;
      font-size: 0.85rem;
      color: #64748b;
    }
    .w-full {
      width: 100%;
    }
  `,
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ClientService);
  readonly router = inject(Router);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly metrics = signal<DashboardMetrics | null>(null);
  readonly byStatus = signal<ClientsByStatusChart[]>([]);
  readonly byMonth = signal<ClientsByMonthChart[]>([]);
  readonly byProvince = signal<ClientsByProvinceChart[]>([]);
  readonly maxMonth = signal(1);
  readonly maxProv = signal(1);

  readonly recentClients = signal<
    Pick<Client, 'id' | 'name' | 'province' | 'city' | 'status' | 'createdAt'>[]
  >([]);

  readonly barChartData = signal<{
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
      borderRadius: number;
      borderWidth: number;
    }[];
  }>({ labels: [], datasets: [] });

  readonly barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { parsed?: { y?: number } }) =>
            ` ${ctx.parsed?.y ?? 0} ${ctx.parsed?.y === 1 ? 'cliente' : 'clientes'}`,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: '#475569', maxRotation: 42, minRotation: 0, font: { size: 11 } },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#64748b',
          precision: 0,
        },
        grid: { color: 'rgba(148, 163, 184, 0.35)' },
      },
    },
  };

  ngOnInit(): void {
    this.api
      .getClients()
      .pipe(
        catchError(() => {
          this.error.set('No se pudieron obtener los clientes. ¿Está corriendo JSON Server?');
          return of([]);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((clients) => {
        if (this.error()) {
          return;
        }
        if (!clients.length) {
          this.error.set('No hay datos de clientes para mostrar.');
          return;
        }
        const m = this.api.getDashboardMetrics(clients);
        this.metrics.set(m);
        const st = this.api.getClientsByStatusChart(clients);
        const mo = this.api.getClientsByMonthChart(clients);
        const pr = this.api.getClientsByProvinceChart(clients);
        this.byStatus.set(st);
        this.byMonth.set(mo);
        this.byProvince.set(pr);
        this.maxMonth.set(Math.max(1, ...mo.map((x) => x.count)));
        this.maxProv.set(Math.max(1, ...pr.map((x) => x.count)));
        this.updateBarChart(st);
        this.recentClients.set(this.buildRecentClients(clients));
      });
  }

  private buildRecentClients(clients: Client[]): Pick<
    Client,
    'id' | 'name' | 'province' | 'city' | 'status' | 'createdAt'
  >[] {
    return [...clients]
      .filter((c) => c.status !== 'DELETED')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 6)
      .map((c) => ({
        id: c.id,
        name: c.name,
        province: c.province,
        city: c.city,
        status: c.status,
        createdAt: c.createdAt,
      }));
  }

  recentStatusLabel(status: ClientStatus): string {
    const map: Record<ClientStatus, string> = {
      ACTIVE: 'Activo',
      POTENTIAL: 'Potencial',
      INACTIVE: 'Inactivo',
      PENDING_CONTACT: 'Pendiente',
      DELETED: 'Baja',
    };
    return map[status] ?? status;
  }

  private updateBarChart(rows: ClientsByStatusChart[]): void {
    this.barChartData.set({
      labels: rows.map((r) => r.label),
      datasets: [
        {
          label: 'Clientes',
          data: rows.map((r) => r.count),
          backgroundColor: rows.map((r) => this.barColorForStatus(r.status)),
          borderRadius: 6,
          borderWidth: 0,
        },
      ],
    });
  }

  private barColorForStatus(status: ClientStatus): string {
    const map: Record<ClientStatus, string> = {
      ACTIVE: 'rgba(22, 163, 74, 0.9)',
      POTENTIAL: 'rgba(234, 88, 12, 0.9)',
      INACTIVE: 'rgba(100, 116, 139, 0.9)',
      PENDING_CONTACT: 'rgba(245, 158, 11, 0.9)',
      DELETED: 'rgba(239, 68, 68, 0.9)',
    };
    return map[status] ?? 'rgba(51, 65, 85, 0.9)';
  }

  barPercent(value: number, max: number): number {
    return Math.round((value / max) * 100);
  }
}
