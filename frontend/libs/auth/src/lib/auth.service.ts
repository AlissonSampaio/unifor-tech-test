import { inject, Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import { Observable, of } from 'rxjs';

interface UserProfile {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak = inject(Keycloak);

  get isLoggedIn$(): Observable<boolean> {
    return of(!!this.keycloak.authenticated);
  }

  get userProfile$(): Observable<UserProfile> {
    const tokenParsed = this.keycloak.tokenParsed;
    const profile: UserProfile = {
      firstName: tokenParsed?.['given_name'] || tokenParsed?.['name'],
      lastName: tokenParsed?.['family_name'],
      username: tokenParsed?.['preferred_username'],
      email: tokenParsed?.['email'],
    };
    return of(profile);
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
