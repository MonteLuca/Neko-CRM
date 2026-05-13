export type ClientStatus =
  | 'POTENTIAL'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'PENDING_CONTACT'
  | 'DELETED';

export interface Client {
  id: number;
  name: string;
  documentNumber: string;
  email: string;
  phone: string;
  province: string;
  city: string;
  address?: string;
  avatarUrl?: string | null;
  status: ClientStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export type ClientSortOrder = 'createdAt_desc' | 'createdAt_asc';

export type ClientStatusFilter =
  | 'ALL'
  | 'NON_DELETED'
  | ClientStatus;

export interface ClientFilterCriteria {
  name: string;
  email: string;
  document: string;
  status: ClientStatusFilter;
  province: string | null;
  sort: ClientSortOrder;
}

export const DEFAULT_CLIENT_FILTERS: ClientFilterCriteria = {
  name: '',
  email: '',
  document: '',
  status: 'NON_DELETED',
  province: null,
  sort: 'createdAt_desc',
};

export interface DashboardMetrics {
  total: number;
  active: number;
  potential: number;
  pendingContact: number;
  inactive: number;
  deleted: number;
  newThisMonth: number;
}

export interface ClientsByStatusChart {
  status: ClientStatus;
  label: string;
  count: number;
}

export interface ClientsByMonthChart {
  monthKey: string;
  label: string;
  count: number;
}

export interface ClientsByProvinceChart {
  province: string;
  count: number;
}
