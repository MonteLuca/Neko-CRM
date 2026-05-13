import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { InputText } from 'primeng/inputtext';
import { Message } from 'primeng/message';
import { Select } from 'primeng/select';
import { Textarea } from 'primeng/textarea';
import { catchError, finalize, of } from 'rxjs';
import { NotificationService } from '../../../../core/services/notification.service';
import { GeorefArgentinaService } from '../../../../core/services/georef-argentina.service';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { Client, ClientStatus } from '../../models/client.model';
import { ClientService } from '../../services/client.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    Card,
    Button,
    Avatar,
    InputText,
    Select,
    Textarea,
    Message,
    LoadingSpinnerComponent,
  ],
  template: `
    <div class="page">
      <h1>{{ isEdit() ? 'Editar cliente' : 'Nuevo cliente' }}</h1>

      @if (loadError()) {
        <p-message severity="error" [text]="loadError()!" styleClass="w-full" />
      }

      @if (blockedDeleted()) {
        <p-message
          severity="warn"
          text="Este cliente está dado de baja y no puede editarse desde esta pantalla."
          styleClass="w-full mb-3"
        />
      }

      @if (loading()) {
        <app-loading-spinner message="Cargando datos del cliente..." />
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-shell">
            <aside class="profile-aside" aria-label="Vista previa del cliente">
              <div class="photo-card">
                <div class="photo-matte">
                  <div class="photo-frame">
                    @if (avatarDataUrl()) {
                      <img
                        class="photo-img"
                        [src]="avatarDataUrl()!"
                        alt="Foto del cliente"
                      />
                    } @else {
                      <p-avatar
                        [label]="clientInitials()"
                        shape="circle"
                        size="xlarge"
                        styleClass="preview-avatar"
                      />
                    }
                  </div>
                </div>
                <p class="preview-name">{{ form.controls.name.value || 'Sin nombre' }}</p>
                <p class="preview-doc">{{ form.controls.documentNumber.value || '—' }}</p>
                <div class="photo-actions">
                  <input
                    #photoInput
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    class="visually-hidden"
                    (change)="onPhotoSelected($event)"
                  />
                  <p-button
                    type="button"
                    label="Elegir foto"
                    icon="pi pi-image"
                    severity="secondary"
                    [outlined]="true"
                    [disabled]="blockedDeleted()"
                    (onClick)="photoInput.click()"
                  />
                  @if (avatarDataUrl()) {
                    <p-button
                      type="button"
                      label="Quitar"
                      icon="pi pi-times"
                      severity="secondary"
                      [text]="true"
                      [disabled]="blockedDeleted()"
                      (onClick)="clearPhoto(photoInput)"
                    />
                  }
                </div>
                <p class="photo-hint">JPG, PNG, WebP o GIF. Máx. {{ maxPhotoKb }} KB.</p>
              </div>
            </aside>

            <p-card styleClass="client-form-card">
              <div class="grid">
                <div class="field col-12 md:col-6">
                  <label for="name">Nombre / razón social *</label>
                  <input id="name" type="text" pInputText fluid formControlName="name" />
                  @if (form.controls.name.touched && form.controls.name.errors?.['required']) {
                    <small class="err">El nombre es obligatorio</small>
                  }
                </div>
                <div class="field col-12 md:col-6">
                  <label for="doc">DNI / CUIT *</label>
                  <input id="doc" type="text" pInputText fluid formControlName="documentNumber" />
                  @if (form.controls.documentNumber.touched && form.controls.documentNumber.errors?.['minlength']) {
                    <small class="err">Mínimo 7 caracteres</small>
                  }
                </div>
                <div class="field col-12 md:col-6">
                  <label for="email">Email *</label>
                  <input id="email" type="email" pInputText fluid formControlName="email" />
                  @if (form.controls.email.touched && form.controls.email.errors?.['required']) {
                    <small class="err">El email es obligatorio</small>
                  }
                  @if (form.controls.email.touched && form.controls.email.errors?.['email']) {
                    <small class="err">Formato de email inválido</small>
                  }
                </div>
                <div class="field col-12 md:col-6">
                  <label for="phone">Teléfono *</label>
                  <input id="phone" type="text" pInputText fluid formControlName="phone" />
                  @if (form.controls.phone.touched && form.controls.phone.errors?.['required']) {
                    <small class="err">El teléfono es obligatorio</small>
                  }
                </div>
                <div class="field col-12 md:col-6">
                  <label for="prov">Provincia *</label>
                  <p-select
                    inputId="prov"
                    formControlName="province"
                    [options]="provinceOptions()"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Elegí provincia"
                    [fluid]="true"
                    [showClear]="true"
                    [loading]="provincesLoading()"
                    (onChange)="onProvinceUserChange()"
                  />
                  <p class="field-hint">Localidades según la API pública GeoRef (datos.gob.ar).</p>
                  @if (form.controls.province.touched && form.controls.province.errors?.['required']) {
                    <small class="err">La provincia es obligatoria</small>
                  }
                </div>
                <div class="field col-12 md:col-6">
                  <label for="city">Ciudad *</label>
                  <p-select
                    inputId="city"
                    formControlName="city"
                    [options]="cityOptions()"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Elegí localidad"
                    [fluid]="true"
                    [filter]="true"
                    filterPlaceholder="Buscar…"
                    [loading]="citiesLoading()"
                  />
                  @if (form.controls.city.touched && form.controls.city.errors?.['required']) {
                    <small class="err">La ciudad es obligatoria</small>
                  }
                </div>
                <div class="field col-12">
                  <label for="addr">Dirección</label>
                  <input id="addr" type="text" pInputText fluid formControlName="address" />
                </div>
                <div class="field col-12 md:col-6">
                  <label for="st">Estado *</label>
                  <p-select
                    inputId="st"
                    formControlName="status"
                    [options]="statusOptions()"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Seleccionar"
                    [fluid]="true"
                  />
                  @if (form.controls.status.touched && form.controls.status.errors?.['required']) {
                    <small class="err">El estado es obligatorio</small>
                  }
                </div>
                <div class="field col-12">
                  <label for="notes">Observaciones (máx. 500)</label>
                  <textarea
                    id="notes"
                    pTextarea
                    fluid
                    rows="4"
                    formControlName="notes"
                    maxlength="500"
                  ></textarea>
                  @if (form.controls.notes.touched && form.controls.notes.errors?.['maxlength']) {
                    <small class="err">Máximo 500 caracteres</small>
                  }
                </div>
              </div>
              <div class="actions">
                <p-button
                  type="button"
                  label="Cancelar"
                  severity="secondary"
                  (onClick)="
                    router.navigate(isEdit() && clientId() != null ? ['/clients', clientId()!] : ['/clients'])
                  "
                />
                <p-button
                  type="submit"
                  [label]="isEdit() ? 'Guardar cambios' : 'Crear cliente'"
                  [loading]="saving()"
                  [disabled]="form.invalid || blockedDeleted()"
                />
              </div>
            </p-card>
          </div>
        </form>
      }
    </div>
  `,
  styles: `
    .page {
      max-width: 1040px;
      margin: 0 auto;
    }
    h1 {
      margin: 0 0 1.25rem;
      font-size: 1.6rem;
      color: #0f172a;
    }
    .form-shell {
      display: grid;
      gap: 1.5rem;
      align-items: start;
    }
    @media (min-width: 880px) {
      .form-shell {
        grid-template-columns: 17rem 1fr;
      }
    }
    .profile-aside {
      justify-self: center;
      width: 100%;
      max-width: 19rem;
    }
    @media (min-width: 880px) {
      .profile-aside {
        justify-self: stretch;
        max-width: none;
        position: sticky;
        top: 0.75rem;
      }
    }
    .photo-card {
      background: #fff;
      border-radius: 14px;
      padding: 1.1rem 1rem 1rem;
      box-shadow:
        0 1px 0 rgba(15, 23, 42, 0.06),
        0 12px 40px rgba(15, 23, 42, 0.08);
      border: 1px solid #e2e8f0;
    }
    .photo-matte {
      background: linear-gradient(165deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: 10px;
      padding: 0.55rem;
      margin-bottom: 0.85rem;
    }
    .photo-frame {
      aspect-ratio: 4 / 5;
      max-height: 220px;
      margin: 0 auto;
      border-radius: 6px;
      overflow: hidden;
      background: #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.06);
    }
    .photo-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    :host ::ng-deep .preview-avatar.p-avatar {
      width: 7.5rem;
      height: 7.5rem;
      font-size: 1.75rem;
      font-weight: 600;
    }
    .preview-name {
      margin: 0 0 0.2rem;
      font-size: 1.05rem;
      font-weight: 700;
      color: #0f172a;
      line-height: 1.25;
      word-break: break-word;
    }
    .preview-doc {
      margin: 0 0 0.85rem;
      font-size: 0.8rem;
      color: #64748b;
      font-variant-numeric: tabular-nums;
    }
    .photo-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      justify-content: center;
      margin-bottom: 0.35rem;
    }
    .photo-hint {
      margin: 0;
      font-size: 0.72rem;
      color: #94a3b8;
      text-align: center;
      line-height: 1.35;
    }
    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    :host ::ng-deep .client-form-card {
      border: 1px solid #e2e8f0;
      border-radius: 14px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);
    }
    :host ::ng-deep .client-form-card .p-card-body {
      background: #fff;
      color: #0f172a;
    }
    :host ::ng-deep .client-form-card .p-card-content {
      padding-top: 0.25rem;
    }
    :host ::ng-deep .client-form-card .p-inputtext,
    :host ::ng-deep .client-form-card .p-textarea,
    :host ::ng-deep .client-form-card .p-select {
      --p-inputtext-background: #fff;
      --p-textarea-background: #fff;
      --p-select-background: #fff;
      --p-inputtext-border-color: #cbd5e1;
      --p-textarea-border-color: #cbd5e1;
      --p-select-border-color: #cbd5e1;
      --p-inputtext-color: #0f172a;
      --p-textarea-color: #0f172a;
      --p-select-color: #0f172a;
    }
    :host ::ng-deep .client-form-card .p-select {
      background: #fff;
      border-color: #cbd5e1;
      box-shadow: none;
    }
    :host ::ng-deep .client-form-card .p-select .p-select-label {
      color: #0f172a;
    }
    :host ::ng-deep .client-form-card .p-select .p-select-label.p-placeholder {
      color: #64748b;
    }
    :host ::ng-deep .client-form-card .p-select .p-select-dropdown {
      color: #475569;
    }
    :host ::ng-deep .client-form-card .p-select.p-disabled {
      opacity: 1;
      cursor: default;
      background: #eef2f6;
      border-color: #cbd5e1;
    }
    :host ::ng-deep .client-form-card .p-select.p-disabled .p-select-label,
    :host ::ng-deep .client-form-card .p-select.p-disabled .p-select-label.p-placeholder {
      color: #64748b;
    }
    :host ::ng-deep .client-form-card .p-select.p-disabled .p-select-dropdown {
      color: #94a3b8;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(12, 1fr);
      gap: 1rem 1.25rem;
    }
    .col-12 {
      grid-column: span 12;
    }
    @media (min-width: 768px) {
      .md\\:col-6 {
        grid-column: span 6;
      }
    }
    .field label {
      display: block;
      font-size: 0.85rem;
      margin-bottom: 0.35rem;
      color: #475569;
    }
    .field-hint {
      margin: 0.3rem 0 0;
      font-size: 0.72rem;
      color: #94a3b8;
      line-height: 1.35;
    }
    .err {
      color: var(--p-red-500);
      display: block;
      margin-top: 0.25rem;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-top: 1.5rem;
      justify-content: flex-end;
    }
    .mb-3 {
      margin-bottom: 1rem;
    }
    .w-full {
      width: 100%;
    }
  `,
})
export class ClientFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly api = inject(ClientService);
  private readonly notify = inject(NotificationService);
  private readonly georef = inject(GeorefArgentinaService);

  private skipProvinceSelectHandler = false;

  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly loadError = signal<string | null>(null);
  readonly isEdit = signal(false);
  readonly clientId = signal<number | null>(null);
  readonly blockedDeleted = signal(false);
  private existing: Client | null = null;

  readonly statusOptions = signal<{ label: string; value: ClientStatus }[]>([]);

  readonly maxPhotoKb = 220;

  readonly avatarDataUrl = signal<string | null>(null);

  readonly provinceOptions = signal<{ label: string; value: string }[]>([]);
  readonly cityOptions = signal<{ label: string; value: string }[]>([]);
  readonly provincesLoading = signal(false);
  readonly citiesLoading = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    documentNumber: ['', [Validators.required, Validators.minLength(7)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    province: ['', Validators.required],
    city: ['', Validators.required],
    address: [''],
    status: ['POTENTIAL' as ClientStatus, Validators.required],
    notes: ['', Validators.maxLength(500)],
  });

  ngOnInit(): void {
    this.loadProvinceOptions();

    const url = this.router.url;
    if (url.includes('/clients/new')) {
      this.isEdit.set(false);
      this.statusOptions.set(this.optionsForCreate());
      this.syncCitySelectDisabled();
      return;
    }
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam && url.includes('/edit')) {
      const id = Number(idParam);
      if (!Number.isFinite(id)) {
        this.loadError.set('Identificador inválido.');
        return;
      }
      this.isEdit.set(true);
      this.clientId.set(id);
      this.statusOptions.set(this.optionsForEdit());
      this.loadClient(id);
    }
  }

  submit(): void {
    if (this.form.invalid || this.blockedDeleted()) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.saving.set(true);
    if (this.isEdit() && this.clientId() != null && this.existing) {
      const updated: Client = {
        ...this.existing,
        ...v,
        notes: v.notes || undefined,
        address: v.address || undefined,
        avatarUrl: this.avatarDataUrl(),
        updatedAt: new Date().toISOString(),
      };
      this.api.updateClient(this.clientId()!, updated).subscribe({
        next: (c) => {
          this.notify.success('Cliente actualizado correctamente.');
          void this.router.navigate(['/clients', c.id]);
        },
        error: () => {
          this.notify.error('No se pudo guardar el cliente.');
          this.saving.set(false);
        },
        complete: () => this.saving.set(false),
      });
    } else {
      const now = new Date().toISOString();
      const photo = this.avatarDataUrl();
      const body: Omit<Client, 'id'> = {
        name: v.name,
        documentNumber: v.documentNumber,
        email: v.email,
        phone: v.phone,
        province: v.province,
        city: v.city,
        address: v.address || undefined,
        status: v.status,
        notes: v.notes || undefined,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        ...(photo ? { avatarUrl: photo } : {}),
      };
      this.api.createClient(body).subscribe({
        next: (c) => {
          this.notify.success('Cliente creado correctamente.');
          void this.router.navigate(['/clients', c.id]);
        },
        error: () => {
          this.notify.error('No se pudo crear el cliente.');
          this.saving.set(false);
        },
        complete: () => this.saving.set(false),
      });
    }
  }

  private loadClient(id: number): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.api
      .getClientById(id)
      .pipe(
        catchError(() => {
          this.loadError.set('No se encontró el cliente o hubo un error de red.');
          return of(null);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((c) => {
        if (!c) {
          return;
        }
        this.existing = c;
        if (c.status === 'DELETED') {
          this.blockedDeleted.set(true);
          this.form.disable();
        }
        this.form.patchValue({
          name: c.name,
          documentNumber: c.documentNumber,
          email: c.email,
          phone: c.phone,
          province: c.province,
          city: c.city,
          address: c.address ?? '',
          status: c.status,
          notes: c.notes ?? '',
        });
        this.ensureProvinceOption(c.province);
        this.avatarDataUrl.set(c.avatarUrl ?? null);

        this.skipProvinceSelectHandler = true;
        this.loadCityOptionsForProvince(c.province, c.city, true);
      });
  }

  onProvinceUserChange(): void {
    if (this.skipProvinceSelectHandler) {
      return;
    }
    this.form.patchValue({ city: '' }, { emitEvent: false });
    const p = this.form.getRawValue().province?.trim();
    if (p) {
      this.loadCityOptionsForProvince(p);
    } else {
      this.cityOptions.set([]);
      this.syncCitySelectDisabled();
    }
  }

  private loadProvinceOptions(): void {
    this.provincesLoading.set(true);
    this.georef
      .getProvincias()
      .pipe(finalize(() => this.provincesLoading.set(false)))
      .subscribe((names) => {
        this.provinceOptions.set(names.map((n) => ({ label: n, value: n })));
      });
  }

  private ensureProvinceOption(name: string | null | undefined): void {
    const n = name?.trim();
    if (!n) {
      return;
    }
    this.provinceOptions.update((opts) => {
      if (opts.some((o) => o.value === n)) {
        return opts;
      }
      return [...opts, { label: n, value: n }].sort((a, b) =>
        a.label.localeCompare(b.label, 'es-AR'),
      );
    });
  }

  private loadCityOptionsForProvince(
    province: string | null | undefined,
    savedCity?: string | null,
    releaseSkipAfter = false,
  ): void {
    const prov = province?.trim();
    if (!prov) {
      this.cityOptions.set([]);
      this.syncCitySelectDisabled();
      if (releaseSkipAfter) {
        this.skipProvinceSelectHandler = false;
      }
      return;
    }
    this.citiesLoading.set(true);
    this.syncCitySelectDisabled();
    this.georef
      .getLocalidades(prov)
      .pipe(
        finalize(() => {
          this.citiesLoading.set(false);
          this.syncCitySelectDisabled();
        }),
      )
      .subscribe((names) => {
        const opts = names.map((n) => ({ label: n, value: n }));
        const sc = savedCity?.trim();
        if (sc && !names.includes(sc)) {
          opts.unshift({ label: `${sc} (valor actual)`, value: sc });
        }
        if (names.length === 0 && prov.length > 0 && !sc) {
          this.notify.warning(
            'No se pudieron obtener localidades para esa provincia. Revisá tu conexión o reintentá más tarde.',
          );
        }
        this.cityOptions.set(opts);
        if (releaseSkipAfter) {
          this.skipProvinceSelectHandler = false;
        }
        this.syncCitySelectDisabled();
      });
  }

  private syncCitySelectDisabled(): void {
    if (this.blockedDeleted() || this.form.disabled) {
      return;
    }
    const city = this.form.controls.city;
    const prov = this.form.getRawValue().province?.trim() ?? '';
    if (!prov || this.citiesLoading()) {
      city.disable({ emitEvent: false });
    } else {
      city.enable({ emitEvent: false });
    }
  }

  clientInitials(): string {
    const name = this.form.getRawValue().name?.trim();
    if (!name) {
      return '?';
    }
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      const a = parts[0][0];
      const b = parts[1][0];
      return `${a}${b}`.toUpperCase();
    }
    const w = parts[0];
    if (w.length >= 2) {
      return w.slice(0, 2).toUpperCase();
    }
    return `${w[0]}${w[0]}`.toUpperCase();
  }

  onPhotoSelected(ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file || !file.type.startsWith('image/')) {
      input.value = '';
      return;
    }
    const maxBytes = this.maxPhotoKb * 1024;
    if (file.size > maxBytes) {
      this.notify.warning(
        `La imagen supera los ${this.maxPhotoKb} KB. Probá con otra más liviana o comprimila.`,
      );
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const r = reader.result;
      if (typeof r === 'string') {
        this.avatarDataUrl.set(r);
      }
      input.value = '';
    };
    reader.onerror = () => {
      this.notify.error('No se pudo leer la imagen.');
      input.value = '';
    };
    reader.readAsDataURL(file);
  }

  clearPhoto(input: HTMLInputElement): void {
    this.avatarDataUrl.set(null);
    input.value = '';
  }

  private optionsForCreate(): { label: string; value: ClientStatus }[] {
    return [
      { label: 'Potencial', value: 'POTENTIAL' },
      { label: 'Activo', value: 'ACTIVE' },
      { label: 'Inactivo', value: 'INACTIVE' },
      { label: 'Pendiente de contacto', value: 'PENDING_CONTACT' },
    ];
  }

  private optionsForEdit(): { label: string; value: ClientStatus }[] {
    return [...this.optionsForCreate(), { label: 'Dado de baja', value: 'DELETED' }];
  }
}
