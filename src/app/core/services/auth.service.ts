import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { StorageService } from './storage.service';

const TOKEN_KEY = 'crm_token';
const USER_KEY = 'crm_user';
export const MOCK_TOKEN = 'mock-jwt-token';

const DEMO_EMAIL = 'admin@crm.com';
const DEMO_PASSWORD = '123456';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUser = signal<User | null>(null);

  readonly user = this.currentUser.asReadonly();

  constructor(
    private readonly storage: StorageService,
    private readonly router: Router,
  ) {
    this.currentUser.set(this.readUserFromStorage());
  }

  login(email: string, password: string): boolean {
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const user: User = {
        id: 1,
        name: 'Admin Neko',
        email: DEMO_EMAIL,
        role: 'ADMIN',
      };
      this.storage.setItem(TOKEN_KEY, MOCK_TOKEN);
      this.storage.setItem(USER_KEY, JSON.stringify(user));
      this.currentUser.set(user);
      return true;
    }
    return false;
  }

  logout(): void {
    this.storage.removeItem(TOKEN_KEY);
    this.storage.removeItem(USER_KEY);
    this.currentUser.set(null);
    void this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!this.storage.getItem(TOKEN_KEY);
  }

  getToken(): string | null {
    return this.storage.getItem(TOKEN_KEY);
  }

  getCurrentUser(): User | null {
    return this.currentUser();
  }

  private readUserFromStorage(): User | null {
    const raw = this.storage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }
}
