import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Toast } from 'primeng/toast';
import { routeTransition } from './core/animations/route-transition.animation';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, Toast],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [routeTransition],
})
export class AppComponent {
  title = 'Neko CRM';

  private readonly router = inject(Router);
  readonly rootFadeTick = signal(0);

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.rootFadeTick.update((n) => n + 1);
      });
  }
}
