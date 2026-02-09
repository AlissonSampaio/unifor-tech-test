# Frontend - Portal do Aluno e Coordenador

Aplicação Angular organizada como **monorepo Nx**, com bibliotecas reutilizáveis para autenticação, acesso a dados e componentes compartilhados.

## Tecnologias

- **Angular 21+** com Standalone Components
- **Nx 22+** (monorepo)
- **PrimeNG 21+** (UI Components)
- **RxJS** (programação reativa)
- **Keycloak Angular** (autenticação OIDC)
- **Vitest** (testes unitários)
- **Playwright** (testes E2E)

## Estrutura do Projeto

```
frontend/
├── apps/
│   └── portal/           # Aplicação principal
│       ├── src/app/
│       │   └── features/
│       │       ├── coordinator/  # Telas do coordenador
│       │       └── student/       # Telas do aluno
│       └── e2e/          # Testes E2E (Playwright)
├── libs/
│   ├── auth/             # Integração Keycloak (guards, service)
│   ├── data-access/     # Services de API e modelos
│   └── shared/          # Pipes e utilitários compartilhados
├── proxy.conf.json       # Proxy para desenvolvimento
└── nginx.conf            # Configuração para produção
```

## Execução

### Desenvolvimento

```bash
# Instalar dependências
npm install --legacy-peer-deps

# Rodar servidor de desenvolvimento
npx nx serve portal
```

Acesse http://localhost:4200

O proxy de desenvolvimento redireciona `/api/*` para `http://localhost:8080` (backend).

### Build de Produção

```bash
npx nx build portal
```

Os arquivos são gerados em `dist/apps/portal/browser/`.

## Scripts Úteis

```bash
# Servir aplicação
npx nx serve portal

# Build de produção
npx nx build portal

# Testes unitários
npx nx test auth
npx nx test data-access
npx nx test shared

# Testes E2E
npx nx e2e portal

# Lint
npx nx lint portal

# Ver grafo de dependências
npx nx graph
```

## Bibliotecas

### `@frontend/auth`

Integração com Keycloak para autenticação e autorização.

- `AuthService` - Gerencia estado de autenticação e perfil do usuário
- `authGuard` - Protege rotas que requerem login
- `roleGuard` - Protege rotas por role (COORDENADOR, ALUNO)

### `@frontend/data-access`

Services para comunicação com a API e modelos TypeScript.

- `MatrizService` - CRUD de matrizes curriculares
- `MatriculaService` - Matrículas do aluno
- `DadosReferenciaService` - Dados de referência (cursos, disciplinas, etc.)

### `@frontend/shared`

Utilitários compartilhados entre componentes.

- `FormatDiaSemanaPipe` - Formata enum de dia da semana

## Configuração de Proxy

Em desenvolvimento, o arquivo `proxy.conf.json` redireciona chamadas da API:

```json
{
  "/api/*": {
    "target": "http://localhost:8080",
    "secure": false
  }
}
```

Em produção, o Nginx faz o mesmo via `nginx.conf`.

## Mais Informações

- [Testes E2E](./apps/portal/e2e/README.md)
- [Biblioteca Auth](./libs/auth/README.md)
- [Biblioteca Data Access](./libs/data-access/README.md)
- [Biblioteca Shared](./libs/shared/README.md)
