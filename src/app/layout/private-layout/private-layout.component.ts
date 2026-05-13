import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PrimeTemplate } from 'primeng/api';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Drawer } from 'primeng/drawer';
import { Toolbar } from 'primeng/toolbar';
import { routeTransition } from '../../core/animations/route-transition.animation';
import { User } from '../../core/models/user.model';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-private-layout',
  standalone: true,
  animations: [routeTransition],
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    PrimeTemplate,
    Toolbar,
    Avatar,
    Button,
    Drawer,
    ConfirmDialogComponent,
  ],
  template: `
    <div class="layout">
      <p-toolbar styleClass="topbar">
        <ng-template pTemplate="start">
          <p-button
            class="menu-btn"
            icon="pi pi-bars"
            [text]="true"
            [rounded]="true"
            (onClick)="toggleMenu()"
            [attr.aria-expanded]="menuOpen"
            ariaLabel="Menú de navegación"
          />
          <a routerLink="/dashboard" class="brand">Neko CRM</a>
          <nav class="nav-desktop" aria-label="Secciones principales">
            <a
              routerLink="/dashboard"
              routerLinkActive="active"
              [routerLinkActiveOptions]="{ exact: true }"
              >Inicio</a
            >
            <a routerLink="/clients" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }"
              >Clientes</a
            >
          </nav>
        </ng-template>
        <ng-template pTemplate="end">
          @if (auth.getCurrentUser(); as u) {
            <div class="user-card" aria-label="Usuario actual">
              <p-avatar
                [label]="userInitials(u)"
                shape="circle"
                styleClass="user-avatar-chip"
              />
              <div class="user-card-text">
                <span class="user-card-name">{{ u.name }}</span>
                <span class="user-card-email">{{ u.email }}</span>
              </div>
            </div>
          }
          <p-button
            class="cta-new"
            label="Nuevo cliente"
            icon="pi pi-user-plus"
            (onClick)="router.navigate(['/clients/new'])"
          />
          <p-button
            label="Cerrar sesión"
            icon="pi pi-sign-out"
            severity="secondary"
            (onClick)="auth.logout()"
          />
        </ng-template>
      </p-toolbar>

      <main class="main">
        <div class="outlet-shell" [@routeTransition]="routeFadeTick()">
          <router-outlet />
        </div>
      </main>

      <p-drawer
        [(visible)]="menuOpen"
        position="left"
        [modal]="false"
        header="Menú"
        [baseZIndex]="25000"
        styleClass="nav-drawer"
        (onHide)="menuOpen = false"
      >
        <div class="nav-drawer-actions">
          <p-button
            label="Nuevo cliente"
            icon="pi pi-user-plus"
            [fluid]="true"
            (onClick)="router.navigate(['/clients/new']); menuOpen = false"
          />
          <nav class="nav-mobile" aria-label="Secciones principales">
          <a
            routerLink="/dashboard"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="menuOpen = false"
            >Inicio</a
          >
          <a
            routerLink="/clients"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="menuOpen = false"
            >Clientes</a
          >
        </nav>
        </div>
      </p-drawer>

      <app-confirm-dialog />
    </div>
  `,
  styles: `
    .layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background: var(--p-surface-50, #fafafa);
    }
    :host ::ng-deep .topbar {
      border-radius: 0;
      border-left: none;
      border-right: none;
      border-top: none;
      background: var(--p-surface-0, #fff);
      box-shadow: 0 1px 0 color-mix(in srgb, var(--p-content-border-color, #ccc) 65%, transparent);
      min-height: 3.25rem;
      position: relative;
      z-index: 2;
    }
    :host ::ng-deep .topbar .p-toolbar-start {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    :host ::ng-deep .topbar .p-toolbar-end {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      justify-content: flex-end;
    }
    :host ::ng-deep .topbar .p-toolbar-end .cta-new {
      display: none;
    }
    @media (min-width: 768px) {
      :host ::ng-deep .topbar .p-toolbar-end .cta-new {
        display: inline-flex;
      }
    }
    .brand {
      font-weight: 700;
      color: var(--p-primary-color);
      text-decoration: none;
      margin-right: 0.5rem;
    }
    .nav-desktop {
      display: none;
      gap: 0.15rem;
      align-items: stretch;
      margin-left: 0.35rem;
      padding-left: 0.85rem;
      border-left: 1px solid color-mix(in srgb, var(--p-content-border-color, #e2e8f0) 80%, transparent);
    }
    @media (min-width: 768px) {
      .nav-desktop {
        display: flex;
      }
      .menu-btn {
        display: none !important;
      }
    }
    :host ::ng-deep .topbar .nav-desktop a {
      padding: 0.4rem 0.7rem;
      border-radius: 999px;
      text-decoration: none;
      color: #64748b;
      font-size: 0.875rem;
      font-weight: 500;
      line-height: 1.2;
      border: 1px solid transparent;
      background: transparent;
      transition:
        color 0.15s ease,
        background 0.15s ease,
        border-color 0.15s ease;
    }
    :host ::ng-deep .topbar .nav-desktop a:hover {
      color: #0f172a;
      background: #e2e8f0;
    }
    :host ::ng-deep .topbar .nav-desktop a.active {
      color: #0f766e;
      background: rgba(15, 118, 110, 0.12);
      border-color: rgba(15, 118, 110, 0.35);
      font-weight: 600;
    }
    :host ::ng-deep .topbar .nav-desktop a.active:hover {
      color: #115e59;
      background: rgba(15, 118, 110, 0.18);
      border-color: rgba(15, 118, 110, 0.45);
    }
    :host ::ng-deep .nav-drawer .nav-drawer-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding-top: 0.35rem;
    }
    .nav-mobile {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    :host ::ng-deep .nav-drawer .nav-mobile a {
      display: block;
      padding: 0.7rem 0.65rem;
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 500;
      line-height: 1.25;
      color: #f1f5f9;
      border-radius: var(--p-border-radius-md, 8px);
      border: 1px solid transparent;
      transition:
        color 0.15s ease,
        background 0.15s ease,
        border-color 0.15s ease;
    }
    :host ::ng-deep .nav-drawer .nav-mobile a:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }
    :host ::ng-deep .nav-drawer .nav-mobile a.active {
      color: #5eead4;
      font-weight: 600;
      background: rgba(45, 212, 191, 0.14);
      border-color: rgba(45, 212, 191, 0.45);
    }
    :host ::ng-deep .nav-drawer .nav-mobile a.active:hover {
      color: #99f6e4;
      background: rgba(45, 212, 191, 0.22);
      border-color: rgba(45, 212, 191, 0.55);
    }
    .user-card {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.3rem 0.65rem 0.3rem 0.35rem;
      border-radius: 12px;
      border: 1px solid color-mix(in srgb, var(--p-content-border-color, #e2e8f0) 90%, transparent);
      background: var(--p-surface-50, #f8fafc);
      max-width: min(16rem, 42vw);
    }
    :host ::ng-deep .user-avatar-chip.p-avatar {
      width: 2.35rem;
      height: 2.35rem;
      font-size: 0.8rem;
      font-weight: 600;
      flex-shrink: 0;
    }
    .user-card-text {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      text-align: left;
      gap: 0.08rem;
      min-width: 0;
    }
    .user-card-name {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--p-text-color, #0f172a);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
      line-height: 1.2;
    }
    .user-card-email {
      font-size: 0.72rem;
      color: #475569;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 100%;
      line-height: 1.2;
    }
    .main {
      flex: 1;
      padding: 1.25rem 1rem 2rem;
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      box-sizing: border-box;
      position: relative;
    }
    .outlet-shell {
      display: block;
      position: relative;
      min-height: 0;
    }
    :host ::ng-deep .nav-drawer.p-drawer {
      z-index: 25000;
    }
    :host ::ng-deep .nav-drawer.p-drawer .p-drawer-header {
      color: #f8fafc;
      border-bottom-color: rgba(255, 255, 255, 0.12);
    }
  `,
})
export class PrivateLayoutComponent {
  readonly auth = inject(AuthService);
  readonly router = inject(Router);
  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  readonly routeFadeTick = signal(0);

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.routeFadeTick.update((n) => n + 1);
      });
  }

  userInitials(u: User): string {
    const name = u.name?.trim();
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
}
