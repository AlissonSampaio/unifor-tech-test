import { inject, Injectable } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { KeycloakProfile } from 'keycloak-js';
import { from, Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak = inject(KeycloakService);

  get isLoggedIn$(): Observable<boolean> {
    return of(this.keycloak.isLoggedIn());
  }

  get userProfile$(): Observable<KeycloakProfile | null> {
    return from(this.keycloak.loadUserProfile());
  }

  get roles(): string[] {
    return this.keycloak.getUserRoles();
  }

  get token(): string {
    return this.keycloak.getKeycloakInstance().token || '';
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
    this.keycloak.logout(window.location.origin);
  }
}
