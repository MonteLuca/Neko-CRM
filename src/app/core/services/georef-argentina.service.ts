import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

const GEOREF_BASE = 'https://apis.datos.gob.ar/georef/api';

const PROVINCIAS_FALLBACK: readonly string[] = [
  'Buenos Aires',
  'Catamarca',
  'Chaco',
  'Chubut',
  'Ciudad Autónoma de Buenos Aires',
  'Córdoba',
  'Corrientes',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego, Antártida e Islas del Atlántico Sur',
  'Tucumán',
] as const;

interface GeorefProvinciasResponse {
  provincias?: { id: string; nombre: string }[];
}

interface GeorefLocalidadesResponse {
  localidades?: { id: string; nombre: string }[];
}

@Injectable({ providedIn: 'root' })
export class GeorefArgentinaService {
  private readonly http = inject(HttpClient);

  getProvincias(): Observable<string[]> {
    return this.http.get<GeorefProvinciasResponse>(`${GEOREF_BASE}/provincias?max=30`).pipe(
      map((r) => {
        const raw = r.provincias ?? [];
        const names = raw.map((p) => p.nombre).filter(Boolean);
        return [...new Set(names)].sort((a, b) => a.localeCompare(b, 'es-AR'));
      }),
      catchError(() => of([...PROVINCIAS_FALLBACK])),
    );
  }

  getLocalidades(provinciaNombre: string): Observable<string[]> {
    const q = encodeURIComponent(provinciaNombre.trim());
    const url = `${GEOREF_BASE}/localidades?provincia=${q}&max=5000&campos=id,nombre`;
    return this.http.get<GeorefLocalidadesResponse>(url).pipe(
      map((r) => {
        const raw = r.localidades ?? [];
        const names = raw.map((l) => l.nombre).filter(Boolean);
        return [...new Set(names)].sort((a, b) => a.localeCompare(b, 'es-AR'));
      }),
      catchError(() => of([])),
    );
  }
}
