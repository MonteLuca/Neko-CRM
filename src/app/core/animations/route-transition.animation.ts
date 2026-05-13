import { animate, style, transition, trigger } from '@angular/animations';

const ease = 'cubic-bezier(0.25, 0.8, 0.25, 1)';

export const routeTransition = trigger('routeTransition', [
  transition('* <=> *', [
    style({ opacity: 0, transform: 'translateY(10px)' }),
    animate(`360ms ${ease}`, style({ opacity: 1, transform: 'none' })),
  ]),
]);
