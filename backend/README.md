# Backend - API Matriz Curricular

API REST desenvolvida em **Kotlin** com **Quarkus** para gerenciamento de matriz curricular e matrículas.

## Tecnologias

- **Kotlin 2.0.21**
- **Quarkus 3.21+**
- **Hibernate Panache** (ORM com pattern Active Record/Repository)
- **PostgreSQL 15**
- **Keycloak 24** (autenticação OIDC)
- **SmallRye OpenAPI** (Swagger)

## Arquitetura

O projeto segue uma arquitetura em camadas:

```
src/main/kotlin/br/edu/unifor/
├── api/
│   ├── dto/          # Data Transfer Objects
│   └── resource/     # REST Resources (Controllers)
├── application/
│   ├── exception/    # Exceções de negócio
│   └── service/      # Services com regras de negócio
├── domain/
│   ├── model/        # Entidades JPA
│   └── repository/   # Interfaces de repositório
└── infrastructure/   # Configurações transversais (exceções, segurança)
```

## Endpoints da API

### Matriz Curricular (`/api/matriz`)

| Método | Endpoint           | Descrição                              | Roles       |
| ------ | ------------------ | -------------------------------------- | ----------- |
| GET    | `/api/matriz`      | Lista matrizes (com filtros opcionais) | COORDENADOR |
| POST   | `/api/matriz`      | Cria nova matriz curricular            | COORDENADOR |
| PUT    | `/api/matriz/{id}` | Atualiza matriz existente              | COORDENADOR |
| DELETE | `/api/matriz/{id}` | Remove matriz (soft delete)            | COORDENADOR |

**Parâmetros de filtro (GET):**

- `periodo` - MANHA, TARDE, NOITE
- `cursoId` - ID do curso
- `horaInicio` / `horaFim` - Filtro por horário
- `maxAlunosMin` / `maxAlunosMax` - Filtro por capacidade

### Aluno (`/api/aluno`)

| Método | Endpoint                       | Descrição                              | Roles |
| ------ | ------------------------------ | -------------------------------------- | ----- |
| GET    | `/api/aluno/aulas-disponiveis` | Lista aulas disponíveis para matrícula | ALUNO |
| GET    | `/api/aluno/matriculas`        | Lista matrículas do aluno logado       | ALUNO |
| POST   | `/api/aluno/matriculas`        | Realiza matrícula em uma aula          | ALUNO |

### Dados de Referência (`/api/dados-referencia`)

| Método | Endpoint                            | Descrição                  | Roles       |
| ------ | ----------------------------------- | -------------------------- | ----------- |
| GET    | `/api/dados-referencia/cursos`      | Lista todos os cursos      | Autenticado |
| GET    | `/api/dados-referencia/disciplinas` | Lista todas as disciplinas | Autenticado |
| GET    | `/api/dados-referencia/professores` | Lista todos os professores | Autenticado |
| GET    | `/api/dados-referencia/horarios`    | Lista todos os horários    | Autenticado |

### Health Check

| Método | Endpoint      | Descrição                    |
| ------ | ------------- | ---------------------------- |
| GET    | `/api/health` | Verifica se a API está ativa |

## Execução

### Desenvolvimento Local

Requer infraestrutura (Postgres + Keycloak) rodando:

```bash
# Subir infraestrutura
docker-compose up postgres keycloak -d

# Rodar backend em modo dev
./mvnw quarkus:dev
```

O modo dev habilita:

- Hot reload automático
- Swagger UI em http://localhost:8080/q/swagger-ui
- Logs SQL formatados
- Banco recriado a cada restart (drop-and-create)

### Produção (Docker)

```bash
docker-compose up backend
```

## Profiles

O projeto usa profiles nativos do Quarkus:

| Profile | Banco          | Schema          | Logs SQL     | OIDC           |
| ------- | -------------- | --------------- | ------------ | -------------- |
| `dev`   | localhost:5433 | drop-and-create | Habilitado   | localhost:8180 |
| `test`  | localhost:5433 | drop-and-create | Desabilitado | localhost:8180 |
| `prod`  | postgres:5432  | update          | Desabilitado | keycloak:8080  |

## Testes

```bash
# Executar todos os testes
./mvnw test

# Executar teste específico
./mvnw test -Dtest=MatriculaServiceTest
```

### Tipos de Testes

- **Unitários**: Services com Mockito (`MatriculaServiceTest`, `MatrizCurricularServiceTest`)
- **Integração**: REST Resources com RestAssured e `@TestSecurity`

## Segurança

- Autenticação via **Keycloak** (OIDC/JWT)
- Autorização por roles: `COORDENADOR` e `ALUNO`
- Validação de roles via `@RolesAllowed`
- Controle de concorrência com **Pessimistic Lock** para matrículas

## Documentação da API

Com o backend rodando, acesse:

- **Swagger UI**: http://localhost:8080/q/swagger-ui
- **OpenAPI JSON**: http://localhost:8080/q/openapi
