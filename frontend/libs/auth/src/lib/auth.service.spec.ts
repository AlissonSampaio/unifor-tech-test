import { TestBed } from '@angular/core/testing';
import { KeycloakService } from 'keycloak-angular';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let keycloakServiceSpy: jasmine.SpyObj<KeycloakService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('KeycloakService', ['isLoggedIn', 'loadUserProfile', 'getUserRoles', 'getKeycloakInstance', 'login', 'logout']);
    
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        { provide: KeycloakService, useValue: spy }
      ]
    });
    
    service = TestBed.inject(AuthService);
    keycloakServiceSpy = TestBed.inject(KeycloakService) as jasmine.SpyObj<KeycloakService>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return isLoggedIn from keycloak', (done) => {
    keycloakServiceSpy.isLoggedIn.and.returnValue(true);
    service.isLoggedIn$.subscribe(val => {
      expect(val).toBeTrue();
      done();
    });
  });

  it('should check for COORDENADOR role', () => {
    keycloakServiceSpy.getUserRoles.and.returnValue(['COORDENADOR', 'USER']);
    expect(service.isCoordinator()).toBeTrue();
    expect(service.isStudent()).toBeFalse();
  });

  it('should call keycloak logout', () => {
    service.logout();
    expect(keycloakServiceSpy.logout).toHaveBeenCalled();
  });
});
