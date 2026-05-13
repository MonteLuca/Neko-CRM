import { Component, Input, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [Button],
  template: `
    <div class="empty">
      @if (icon) {
        <i [class]="icon + ' empty__icon'"></i>
      }
      <h2 class="empty__title">{{ title }}</h2>
      <p class="empty__desc">{{ description }}</p>
      @if (actionLabel && actionLink) {
        <p-button
          [label]="actionLabel"
          styleClass="mt-2"
          (onClick)="router.navigateByUrl(actionLink!)"
        />
      }
    </div>
  `,
  styles: `
    .empty {
      text-align: center;
      padding: 3rem 1.5rem;
      max-width: 28rem;
      margin: 0 auto;
    }
    .empty__icon {
      font-size: 3rem;
      color: var(--p-text-muted-color);
      margin-bottom: 1rem;
      display: block;
    }
    .empty__title {
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
      font-weight: 600;
    }
    .empty__desc {
      margin: 0;
      color: var(--p-text-muted-color);
      line-height: 1.5;
    }
  `,
})
export class EmptyStateComponent {
  readonly router = inject(Router);

  @Input() icon = 'pi pi-inbox';
  @Input({ required: true }) title!: string;
  @Input({ required: true }) description!: string;
  @Input() actionLabel?: string;
  @Input() actionLink?: string;
}
