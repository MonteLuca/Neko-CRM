import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/private-layout/private-layout.component').then(
        (m) => m.PrivateLayoutComponent,
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'clients/new',
        loadComponent: () =>
          import('./features/clients/pages/client-form/client-form.component').then(
            (m) => m.ClientFormComponent,
          ),
      },
      {
        path: 'clients/:id/edit',
        loadComponent: () =>
          import('./features/clients/pages/client-form/client-form.component').then(
            (m) => m.ClientFormComponent,
          ),
      },
      {
        path: 'clients/:id',
        loadComponent: () =>
          import('./features/clients/pages/client-detail/client-detail.component').then(
            (m) => m.ClientDetailComponent,
          ),
      },
      {
        path: 'clients',
        loadComponent: () =>
          import('./features/clients/pages/client-list/client-list.component').then(
            (m) => m.ClientListComponent,
          ),
      },
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'dashboard',
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('./shared/pages/not-found/not-found.component').then((m) => m.NotFoundComponent),
  },
];
