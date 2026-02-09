import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi, beforeAll } from 'vitest';
import Keycloak from 'keycloak-js';
import { App } from './app';

// Mock window.matchMedia for PrimeNG components
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

describe('App', () => {
  const keycloakMock = {
    authenticated: true,
    realmAccess: { roles: ['ALUNO'] },
    token: 'mock-token',
    tokenParsed: {
      given_name: 'Test',
      preferred_username: 'testuser',
    },
    login: vi.fn(),
    logout: vi.fn(),
    loadUserProfile: vi.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        { provide: Keycloak, useValue: keycloakMock },
      ],
    }).compileComponents();
  });

  it('should render portal brand', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand-text')?.textContent).toContain(
      'Portal Unifor',
    );
  });
});
