# @frontend/auth

Biblioteca de autenticação e autorização com integração **Keycloak**.

## Instalação

A biblioteca já está configurada no workspace. Para usar em um componente:

```typescript
import { AuthService, authGuard, roleGuard } from '@frontend/auth';
```

## Componentes

### AuthService

Service principal para gerenciar autenticação.

```typescript
@Component({...})
export class MyComponent {
  private authService = inject(AuthService);

  // Observables
  isLoggedIn$ = this.authService.isLoggedIn$;
  userProfile$ = this.authService.userProfile$;

  // Propriedades síncronas
  token = this.authService.token;
  roles = this.authService.roles;

  // Verificação de roles
  isCoordinator = this.authService.isCoordinator();
  isStudent = this.authService.isStudent();

  // Ações
  login() { this.authService.login(); }
  logout() { this.authService.logout(); }
}
```

### authGuard

Guard funcional que protege rotas que requerem autenticação. Redireciona para login se não autenticado.

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  }
];
```

### roleGuard

Guard funcional que protege rotas por role específica.

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'coordenador',
    loadChildren: () => import('./coordinator/routes'),
    canActivate: [roleGuard(['COORDENADOR'])]
  },
  {
    path: 'aluno',
    loadChildren: () => import('./student/routes'),
    canActivate: [roleGuard(['ALUNO'])]
  }
];
```

## Roles Disponíveis

| Role | Descrição |
|------|-----------|
| `COORDENADOR` | Gerencia matrizes curriculares dos cursos autorizados |
| `ALUNO` | Visualiza aulas e realiza matrículas |

## Configuração do Keycloak

A configuração está em `keycloak.config.ts`:

- **Realm**: `unifor`
- **Client ID**: `frontend`
- **URL Dev**: `http://localhost:8180`
- **URL Prod**: `http://localhost:8180` (via Docker)

O token JWT é injetado automaticamente nas requisições `/api/*` via `includeBearerTokenInterceptor`.

## Testes

```bash
npx nx test auth
```

Os testes usam Vitest e cobrem:
- `AuthService` - Verificação de roles e estado de autenticação
