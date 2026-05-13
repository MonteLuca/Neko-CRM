import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [Button],
  template: `
    <div class="page">
      <h1>404</h1>
      <p>La página que buscás no existe o fue movida.</p>
      <p-button label="Ir al inicio" (onClick)="router.navigate(['/dashboard'])" />
    </div>
  `,
  styles: `
    .page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 1.5rem;
      text-align: center;
    }
    h1 {
      font-size: 4rem;
      margin: 0;
      color: var(--p-primary-color);
    }
  `,
})
export class NotFoundComponent {
  readonly router = inject(Router);
}
