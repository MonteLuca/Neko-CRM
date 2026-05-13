import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Client,
  ClientFilterCriteria,
  ClientStatus,
  ClientsByMonthChart,
  ClientsByProvinceChart,
  ClientsByStatusChart,
  DashboardMetrics,
} from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private readonly base = `${environment.apiUrl}`;

  constructor(private readonly http: HttpClient) {}

  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.base}/clients`);
  }

  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.base}/clients/${id}`);
  }

  createClient(client: Omit<Client, 'id'>): Observable<Client> {
    return this.http.post<Client>(`${this.base}/clients`, client);
  }

  updateClient(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.base}/clients/${id}`, client);
  }

  deactivateClient(id: number): Observable<Client> {
    const now = new Date().toISOString();
    return this.http.patch<Client>(`${this.base}/clients/${id}`, {
      status: 'DELETED',
      deletedAt: now,
      updatedAt: now,
    });
  }

  filterClients(clients: Client[], criteria: ClientFilterCriteria): Client[] {
    const name = criteria.name.trim().toLowerCase();
    const email = criteria.email.trim().toLowerCase();
    const document = criteria.document.trim().toLowerCase();

    let result = clients.filter((c) => {
      if (name && !c.name.toLowerCase().includes(name)) {
        return false;
      }
      if (email && !c.email.toLowerCase().includes(email)) {
        return false;
      }
      if (document && !c.documentNumber.toLowerCase().includes(document)) {
        return false;
      }
      if (criteria.province && c.province !== criteria.province) {
        return false;
      }
      if (criteria.status === 'NON_DELETED' && c.status === 'DELETED') {
        return false;
      }
      if (criteria.status !== 'ALL' && criteria.status !== 'NON_DELETED') {
        if (c.status !== criteria.status) {
          return false;
        }
      }
      return true;
    });

    result = [...result].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return criteria.sort === 'createdAt_asc' ? da - db : db - da;
    });

    return result;
  }

  getDashboardMetrics(clients: Client[]): DashboardMetrics {
    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    return {
      total: clients.length,
      active: clients.filter((c) => c.status === 'ACTIVE').length,
      potential: clients.filter((c) => c.status === 'POTENTIAL').length,
      pendingContact: clients.filter((c) => c.status === 'PENDING_CONTACT').length,
      inactive: clients.filter((c) => c.status === 'INACTIVE').length,
      deleted: clients.filter((c) => c.status === 'DELETED').length,
      newThisMonth: clients.filter((c) => {
        const d = new Date(c.createdAt);
        return d.getMonth() === month && d.getFullYear() === year;
      }).length,
    };
  }

  getClientsByStatusChart(clients: Client[]): ClientsByStatusChart[] {
    const labels: Record<ClientStatus, string> = {
      ACTIVE: 'Activo',
      POTENTIAL: 'Potencial',
      INACTIVE: 'Inactivo',
      PENDING_CONTACT: 'Pendiente de contacto',
      DELETED: 'Dado de baja',
    };
    const counts = new Map<ClientStatus, number>();
    for (const c of clients) {
      counts.set(c.status, (counts.get(c.status) ?? 0) + 1);
    }
    return [...counts.entries()].map(([status, count]) => ({
      status,
      label: labels[status],
      count,
    }));
  }

  getClientsByMonthChart(clients: Client[]): ClientsByMonthChart[] {
    const mapMonth = new Map<string, number>();
    for (const c of clients) {
      const d = new Date(c.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      mapMonth.set(key, (mapMonth.get(key) ?? 0) + 1);
    }
    const sorted = [...mapMonth.entries()].sort(([a], [b]) => a.localeCompare(b));
    return sorted.map(([monthKey, count]) => ({
      monthKey,
      label: this.formatMonthKey(monthKey),
      count,
    }));
  }

  getClientsByProvinceChart(clients: Client[]): ClientsByProvinceChart[] {
    const mapProv = new Map<string, number>();
    for (const c of clients) {
      mapProv.set(c.province, (mapProv.get(c.province) ?? 0) + 1);
    }
    return [...mapProv.entries()]
      .map(([province, count]) => ({ province, count }))
      .sort((a, b) => b.count - a.count);
  }

  private formatMonthKey(monthKey: string): string {
    const [y, m] = monthKey.split('-');
    const date = new Date(Number(y), Number(m) - 1, 1);
    return date.toLocaleDateString('es-AR', { month: 'short', year: 'numeric' });
  }
}
