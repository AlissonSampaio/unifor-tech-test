import { TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { firstValueFrom } from 'rxjs';
import Keycloak from 'keycloak-js';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let keycloakMock: {
    authenticated: boolean;
    realmAccess: { roles: string[] };
    token: string;
    login: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
    loadUserProfile: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    keycloakMock = {
      authenticated: true,
      realmAccess: { roles: ['COORDENADOR'] },
      token: 'mock-token',
      login: vi.fn(),
      logout: vi.fn(),
      loadUserProfile: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: Keycloak, useValue: keycloakMock }
      ]
    });

    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return isLoggedIn from keycloak', async () => {
    const val = await firstValueFrom(service.isLoggedIn$);
    expect(val).toBe(true);
  });

  it('should check for COORDENADOR role', () => {
    expect(service.isCoordinator()).toBe(true);
    expect(service.isStudent()).toBe(false);
  });

  it('should call keycloak logout', () => {
    service.logout();
    expect(keycloakMock.logout).toHaveBeenCalled();
  });
});
