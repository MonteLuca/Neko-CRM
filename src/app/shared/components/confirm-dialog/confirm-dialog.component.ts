import { Component } from '@angular/core';
import { ConfirmDialog } from 'primeng/confirmdialog';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [ConfirmDialog],
  template: `
    <p-confirmDialog
      [style]="{ width: 'min(100vw - 2rem, 28rem)' }"
      [breakpoints]="{ '960px': '90vw' }"
    />
  `,
})
export class ConfirmDialogComponent {}
