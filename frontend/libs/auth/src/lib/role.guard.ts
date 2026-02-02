import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return async (route, state) => {
    const keycloak = inject(KeycloakService);
    const router = inject(Router);

    const authenticated = await keycloak.isLoggedIn();

    if (!authenticated) {
      await keycloak.login({
        redirectUri: window.location.origin + state.url
      });
      return false;
    }

    const roles = keycloak.getUserRoles();
    const hasRole = allowedRoles.some((role) => roles.includes(role));

    if (!hasRole) {
      // Redireciona para home ou mostra página de acesso negado
      await router.navigate(['/']);
      return false;
    }

    return true;
  };
};
