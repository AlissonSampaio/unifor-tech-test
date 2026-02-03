# Sistema de Matriz Curricular - Unifor

Sistema full-stack para gerenciamento de matriz curricular e matriculas de alunos.

## Tecnologias

### Backend
- Kotlin 2.0+ com Quarkus 3.15+
- Hibernate Panache (ORM)
- PostgreSQL 15
- Keycloak 24 (OIDC)

### Frontend
- Angular 19+ com Nx 22+
- PrimeNG 21+ (UI Components)
- RxJS (Programacao Reativa)

## Pre-requisitos

- Docker e Docker Compose
- Java 21+ (para desenvolvimento local)
- Node.js 20+ (para desenvolvimento local)

## Execucao Rapida (Docker)

Para executar todo o sistema com um unico comando:

```bash
docker-compose up --build
```

Aguarde 2-3 minutos na primeira execucao. Acesse:

- Frontend: [http://localhost:4200](http://localhost:4200)
- Swagger: [http://localhost:8080/q/swagger-ui](http://localhost:8080/q/swagger-ui)
- Keycloak: [http://localhost:8180](http://localhost:8180) (admin/admin)

## Execucao para Desenvolvimento

### 1. Subir Infraestrutura

```bash
docker-compose up postgres keycloak -d
```

### 2. Backend

```bash
cd backend
./mvnw quarkus:dev
```

### 3. Frontend

```bash
cd frontend
npm install --legacy-peer-deps
npx nx serve portal
```

## Credenciais de Teste


| Usuario | Senha    | Perfil      | Cursos                 |
| ------- | -------- | ----------- | ---------------------- |
| coord1  | coord123 | Coordenador | CC, SI, ES             |
| coord2  | coord123 | Coordenador | EC, EM, EE             |
| coord3  | coord123 | Coordenador | ADM, DIR, MED          |
| aluno1  | aluno123 | Aluno       | Ciencia da Computacao  |
| aluno2  | aluno123 | Aluno       | Sistemas de Informacao |
| aluno3  | aluno123 | Aluno       | Engenharia de Software |
| aluno4  | aluno123 | Aluno       | Administracao          |
| aluno5  | aluno123 | Aluno       | Direito                |


## Estrutura do Projeto

```
/
├── backend/           # Quarkus (Kotlin)
│   └── src/main/kotlin/br/edu/unifor/
│       ├── api/       # REST Resources e DTOs
│       ├── application/  # Services e Regras de Negocio
│       ├── domain/    # Entidades e Repositorios
│       └── infrastructure/  # Config Global
├── frontend/          # Nx Workspace (Angular)
│   ├── apps/portal/   # Aplicacao Principal
│   └── libs/
│       ├── auth/      # Integracao Keycloak
│       ├── data-access/  # Services de API
│       └── shared/    # Componentes Comuns
├── docker/            # Configuracoes Docker
│   └── keycloak/      # Realm Export
└── docker-compose.yml
```

## Testes

### Backend

```bash
cd backend
./mvnw test
```

### Frontend

```bash
cd frontend
npx nx test auth
npx nx test data-access
```

## Documentacao Adicional

- [Decisoes Tecnicas](./DECISOES_TECNICAS.md)
- [Swagger UI](http://localhost:8080/q/swagger-ui) (com backend rodando)
