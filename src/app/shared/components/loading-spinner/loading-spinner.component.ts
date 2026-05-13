import { Component, Input } from '@angular/core';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [ProgressSpinner],
  template: `
    <div class="wrap" [class.wrap--overlay]="overlay">
      <p-progressSpinner strokeWidth="4" animationDuration=".8s" [style]="{ width: size, height: size }" />
      @if (message) {
        <p class="msg">{{ message }}</p>
      }
    </div>
  `,
  styles: `
    .wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      padding: 2rem;
    }
    .wrap--overlay {
      min-height: 40vh;
    }
    .msg {
      margin: 0;
      color: var(--p-text-muted-color);
      font-size: 0.9rem;
    }
  `,
})
export class LoadingSpinnerComponent {
  @Input() message = '';
  @Input() overlay = true;
  @Input() size = '3rem';
}
