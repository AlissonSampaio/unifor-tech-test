import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import Keycloak from 'keycloak-js';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return async (route, state) => {
    const keycloak = inject(Keycloak);
    const router = inject(Router);

    const authenticated = !!keycloak.authenticated;

    if (!authenticated) {
      await keycloak.login({
        redirectUri: window.location.origin + state.url
      });
      return false;
    }

    const roles = keycloak.realmAccess?.roles || [];
    const hasRole = allowedRoles.some((role) => roles.includes(role));

    if (!hasRole) {
      await router.navigate(['/']);
      return false;
    }

    return true;
  };
};
