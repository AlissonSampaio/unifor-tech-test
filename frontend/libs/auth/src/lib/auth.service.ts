import { inject, Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { from, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak = inject(Keycloak);

  get isLoggedIn$(): Observable<boolean> {
    return of(!!this.keycloak.authenticated);
  }

  get userProfile$(): Observable<any> {
    return from(this.keycloak.loadUserProfile());
  }

  get roles(): string[] {
    return this.keycloak.realmAccess?.roles || [];
  }

  get token(): string {
    return this.keycloak.token || '';
  }

  isCoordinator(): boolean {
    return this.roles.includes('COORDENADOR');
  }

  isStudent(): boolean {
    return this.roles.includes('ALUNO');
  }

  login(): void {
    this.keycloak.login();
  }

  logout(): void {
    this.keycloak.logout({ redirectUri: window.location.origin });
  }
}
