# Plano de Implementação - Teste Técnico Unifor

## 1. Visão Geral da Arquitetura

```
/ (raiz)
├── backend/                    # Projeto Quarkus (Kotlin)
│   ├── src/main/kotlin/
│   │   └── br/edu/unifor/
│   │       ├── domain/         # Entidades e repositórios
│   │       ├── application/    # Serviços e casos de uso
│   │       ├── infrastructure/ # Config, exceções, segurança
│   │       └── api/            # Resources (controllers) e DTOs
│   └── src/test/kotlin/
├── frontend/                   # Nx Workspace
│   ├── apps/
│   │   └── portal/             # App Angular principal
│   └── libs/
│       ├── auth/               # Lib de autenticação Keycloak
│       ├── shared/             # Componentes e utilitários comuns
│       └── data-access/        # Serviços de API e models
├── docker/
│   ├── init.sql                # Dados seed
│   ├── keycloak/
│   │   └── realm-export.json   # Realm pré-configurado
│   └── nginx.conf              # (opcional) proxy reverso
├── docker-compose.yml
└── README.md
```

### Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Backend | Kotlin | 2.0+ |
| Framework | Quarkus | 3.20+ |
| ORM | Hibernate Panache | - |
| Banco | PostgreSQL | 15 |
| Auth | Keycloak | 24+ |
| Frontend | Angular | 18+ |
| Monorepo | Nx | 19+ |
| UI | PrimeNG | 17+ |

---

## 2. Modelo de Domínio

### 2.1 Entidades Base (Pré-cadastradas)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Curso     │     │ Disciplina  │     │  Professor  │
├─────────────┤     ├─────────────┤     ├─────────────┤
│ id          │     │ id          │     │ id          │
│ nome        │     │ nome        │     │ nome        │
│ codigo      │     │ cargaHoraria│     │ email       │
└─────────────┘     └─────────────┘     └─────────────┘

┌─────────────────┐     ┌─────────────┐     ┌─────────────┐
│    Horario      │     │    Aluno    │     │ Coordenador │
├─────────────────┤     ├─────────────┤     ├─────────────┤
│ id              │     │ id          │     │ id          │
│ diaSemana       │     │ nome        │     │ nome        │
│ horaInicio      │     │ matricula   │     │ email       │
│ horaFim         │     │ email       │     │ keycloakId  │
│ periodo (M/T/N) │     │ curso_id    │     └─────────────┘
└─────────────────┘     │ keycloakId  │
                        └─────────────┘

Coordenador ──< gerencia >── Curso (ManyToMany)
```

### 2.2 Entidades do Negócio

```
┌───────────────────────┐
│   MatrizCurricular    │ (Aula ofertada)
├───────────────────────┤
│ id                    │
│ disciplina_id (FK)    │
│ professor_id (FK)     │
│ horario_id (FK)       │
│ maxAlunos             │
│ deleted (boolean)     │ ← Soft delete
│ createdAt             │
│ coordenador_id (FK)   │ ← Quem criou
└───────────────────────┘
        │
        │ cursosAutorizados (ManyToMany)
        ▼
┌─────────────┐
│    Curso    │
└─────────────┘

┌───────────────────────┐
│      Matricula        │
├───────────────────────┤
│ id                    │
│ aluno_id (FK)         │
│ matrizCurricular_id   │
│ dataMatricula         │
└───────────────────────┘
```

### 2.3 Regras de Negócio Críticas

1. **Criação de Aula (MatrizCurricular)**:
   - Mesma disciplina pode existir em horários diferentes
   - Disciplina, Professor e Horário devem existir
   - Coordenador só cria para cursos que gerencia

2. **Edição de Aula**:
   - Não pode remover curso se há aluno matriculado daquele curso
   - Horário e Professor são editáveis
   - Disciplina NÃO é editável

3. **Exclusão de Aula**:
   - Só permitida se não há matrículas
   - Exclusão é LÓGICA (deleted = true)

4. **Matrícula**:
   - Aula deve ser autorizada para o curso do aluno
   - Deve haver vaga disponível
   - Não pode haver conflito de horário
   - **Controle de concorrência obrigatório**

---

## 3. Fases de Implementação

### FASE 1: Infraestrutura e Setup [~2 commits]

**Objetivo**: Ambiente funcional com Docker Compose rodando.

**Tarefas**:
1. Criar `docker-compose.yml`:
   - PostgreSQL 15 (porta 5432)
   - Keycloak 24+ (porta 8180 para não conflitar com Quarkus)
   - Volume para `init.sql`
   - Volume para `realm-export.json`

2. Criar `docker/keycloak/realm-export.json`:
   - Realm: `unifor`
   - Client `backend`: confidential, service-account
   - Client `portal`: public (SPA)
   - Roles: `COORDENADOR`, `ALUNO`
   - Usuários de teste mapeados aos roles

3. Criar `docker/init.sql` (vazio por enquanto, Hibernate cria schema)

4. Criar `README.md` básico com comandos de execução

**Commits**:
```
chore: setup docker-compose with postgres and keycloak
docs: add basic readme with setup instructions
```

**Teste do Commit**: `docker-compose up -d` deve subir os serviços.

---

### FASE 2: Backend - Projeto e Entidades [~3 commits]

**Objetivo**: Projeto Quarkus inicializado com entidades mapeadas.

**Tarefas**:
1. Inicializar projeto Quarkus:
   ```bash
   quarkus create app br.edu.unifor:matriz-curricular \
     --extension="resteasy-reactive-jackson,hibernate-orm-panache-kotlin,jdbc-postgresql,hibernate-validator,smallrye-openapi,oidc,keycloak-authorization" \
     --kotlin
   ```

2. Configurar `application.properties`:
   - Datasource PostgreSQL
   - OIDC com Keycloak
   - Hibernate ddl-auto: update
   - CORS habilitado

3. Criar entidades em `domain/model/`:
   - Entidades base: Curso, Disciplina, Professor, Horario, Aluno, Coordenador
   - Entidade de relacionamento: CoordenadorCurso
   - Entidades de negócio: MatrizCurricular, Matricula

4. Criar repositórios em `domain/repository/`

5. Atualizar `init.sql` com dados seed

**Commits**:
```
chore(backend): init quarkus project with extensions
feat(backend): add domain entities and relationships
feat(backend): add seed data for base entities
```

**Teste do Commit**: `./mvnw quarkus:dev` deve iniciar sem erros.

---

### FASE 3: Backend - Funcionalidades do Coordenador [~3 commits]

**Objetivo**: CRUD da matriz curricular funcionando.

**Tarefas**:
1. Criar DTOs em `api/dto/`:
   - `MatrizCurricularRequest`
   - `MatrizCurricularResponse`
   - `MatrizCurricularFiltro`

2. Criar `MatrizCurricularService` em `application/`:
   - `criar(request, coordenadorId)`: validações de existência e permissão
   - `listar(filtro, coordenadorId)`: filtros por horário, período, curso
   - `atualizar(id, request, coordenadorId)`: validações de edição
   - `excluir(id, coordenadorId)`: soft delete com validação

3. Criar `MatrizCurricularResource` em `api/`:
   - `@RolesAllowed("COORDENADOR")`
   - GET, POST, PUT, DELETE

4. Criar exception handler global em `infrastructure/`

5. Criar testes unitários para `MatrizCurricularService`

**Commits**:
```
feat(backend): add matrix management service with validations
feat(backend): add matrix rest endpoints for coordinator
test(backend): add unit tests for matrix service
```

**Teste do Commit**: Endpoints testáveis via Swagger UI.

---

### FASE 4: Backend - Funcionalidades do Aluno [~3 commits]

**Objetivo**: Matrícula funcionando com controle de concorrência.

**Tarefas**:
1. Criar DTOs:
   - `MatriculaRequest`
   - `MatriculaResponse`
   - `AulaDisponivelResponse`

2. Criar `MatriculaService`:
   - `realizarMatricula(alunoId, aulaId)`:
     - Usar `@Transactional` com `PESSIMISTIC_WRITE`
     - Validar curso autorizado
     - Validar vaga disponível (COUNT atual < maxAlunos)
     - Validar conflito de horário
   - `listarMinhasMatriculas(alunoId)`
   - `listarAulasDisponiveis(alunoId)`

3. Criar `MatriculaResource`:
   - `@RolesAllowed("ALUNO")`
   - POST `/matriculas`
   - GET `/matriculas`
   - GET `/aulas-disponiveis`

4. Criar testes unitários para `MatriculaService`

**Commits**:
```
feat(backend): add enrollment service with business rules
feat(backend): add concurrency control for enrollment
test(backend): add unit tests for enrollment service
```

**Teste do Commit**: Testar via Swagger com dois usuários simultâneos.

---

### FASE 5: Frontend - Setup e Autenticação [~3 commits]

**Objetivo**: Nx workspace configurado com autenticação Keycloak.

**Tarefas**:
1. Criar Nx workspace:
   ```bash
   npx create-nx-workspace@latest frontend --preset=angular-monorepo --appName=portal --style=scss
   ```

2. Criar libs:
   ```bash
   nx g @nx/angular:library auth --directory=libs/auth
   nx g @nx/angular:library shared --directory=libs/shared
   nx g @nx/angular:library data-access --directory=libs/data-access
   ```

3. Configurar PrimeNG:
   - Instalar `primeng`, `primeicons`, `primeflex`
   - Configurar tema em `styles.scss`

4. Implementar `libs/auth`:
   - Serviço de autenticação com `keycloak-js`
   - APP_INITIALIZER para inicializar Keycloak
   - AuthGuard e RoleGuard
   - HTTP Interceptor para adicionar Bearer token

5. Criar layout base:
   - Navbar com info do usuário e logout
   - Router outlet

**Commits**:
```
chore(frontend): init nx workspace with angular app
chore(frontend): setup primeng and base layout
feat(frontend): add keycloak auth library
```

**Teste do Commit**: Login via Keycloak deve funcionar.

---

### FASE 6: Frontend - Telas do Coordenador [~2 commits]

**Objetivo**: Dashboard do coordenador funcionando.

**Tarefas**:
1. Criar em `libs/data-access`:
   - `MatrizService` com métodos CRUD
   - Interfaces/models tipados
   - Usar RxJS operators corretamente (switchMap, catchError, etc.)

2. Criar módulo Coordenador em `apps/portal`:
   - Rota protegida por RoleGuard
   - Componente de listagem com `p-table`:
     - Filtros: período (dropdown), curso (multiselect), horário
     - Ações: editar, excluir
   - Componente de formulário com `p-dialog`:
     - Selects para disciplina, professor, horário
     - Multiselect para cursos autorizados
     - Input para max alunos

3. Usar ReactiveForms com validação

**Commits**:
```
feat(frontend): add data-access services with rxjs
feat(frontend): add coordinator matrix management screens
```

**Teste do Commit**: CRUD completo funcionando via UI.

---

### FASE 7: Frontend - Telas do Aluno [~2 commits]

**Objetivo**: Fluxo de matrícula funcionando.

**Tarefas**:
1. Criar módulo Aluno em `apps/portal`:
   - Rota protegida por RoleGuard
   - Componente "Aulas Disponíveis":
     - Lista com `p-table` ou `p-dataView`
     - Botão "Matricular" (desabilitado se cheio ou conflito)
     - Indicadores visuais de status
   - Componente "Minhas Matrículas":
     - Lista simples com disciplina, professor, horário

2. Tratamento de erros:
   - `p-toast` para feedback
   - Mensagens amigáveis para cada tipo de erro

3. Usar RxJS adequadamente:
   - `BehaviorSubject` para estado local
   - `shareReplay` para cache
   - `finalize` para loading states

**Commits**:
```
feat(frontend): add student enrollment screens
feat(frontend): add error handling and feedback
```

**Teste do Commit**: Fluxo completo de matrícula funcionando.

---

### FASE 8: Polimento e Documentação [~2 commits]

**Objetivo**: Projeto pronto para entrega.

**Tarefas**:
1. Revisar Swagger/OpenAPI:
   - Adicionar descrições nos endpoints
   - Documentar códigos de erro
   - Exemplos de request/response

2. Atualizar `README.md`:
   - Pré-requisitos detalhados
   - Passo a passo de execução
   - Credenciais de teste
   - URLs de acesso
   - Decisões técnicas tomadas

3. Criar arquivo `DECISOES_TECNICAS.md`:
   - Justificativas de arquitetura
   - Trade-offs considerados
   - O que faria diferente com mais tempo

4. Revisar código:
   - Remover console.logs
   - Verificar imports não usados
   - Garantir consistência de nomenclatura

**Commits**:
```
docs: complete api documentation with swagger
docs: finalize readme and technical decisions
```

---

## 4. Dados Seed (init.sql)

### Coordenadores (3)
| ID | Nome | Email | Cursos que gerencia |
|----|------|-------|---------------------|
| 1 | Ana Costa | ana.costa@unifor.br | 1, 2, 3 |
| 2 | Bruno Lima | bruno.lima@unifor.br | 4, 5, 6 |
| 3 | Carla Souza | carla.souza@unifor.br | 7, 8, 9 |

### Cursos (9)
| ID | Código | Nome |
|----|--------|------|
| 1 | CC | Ciência da Computação |
| 2 | SI | Sistemas de Informação |
| 3 | ES | Engenharia de Software |
| 4 | EC | Engenharia Civil |
| 5 | EM | Engenharia Mecânica |
| 6 | EE | Engenharia Elétrica |
| 7 | ADM | Administração |
| 8 | DIR | Direito |
| 9 | MED | Medicina |

### Horários (9)
| ID | Dia | Início | Fim | Período |
|----|-----|--------|-----|---------|
| 1 | SEG | 07:30 | 09:10 | MANHA |
| 2 | SEG | 09:20 | 11:00 | MANHA |
| 3 | SEG | 11:10 | 12:50 | MANHA |
| 4 | TER | 13:30 | 15:10 | TARDE |
| 5 | TER | 15:20 | 17:00 | TARDE |
| 6 | TER | 17:10 | 18:50 | TARDE |
| 7 | QUA | 19:00 | 20:40 | NOITE |
| 8 | QUA | 20:50 | 22:30 | NOITE |
| 9 | QUI | 19:00 | 20:40 | NOITE |

### Professores (5)
| ID | Nome | Email |
|----|------|-------|
| 1 | Dr. João Silva | joao.silva@unifor.br |
| 2 | Dra. Maria Santos | maria.santos@unifor.br |
| 3 | Dr. Pedro Oliveira | pedro.oliveira@unifor.br |
| 4 | Dra. Julia Ferreira | julia.ferreira@unifor.br |
| 5 | Dr. Lucas Almeida | lucas.almeida@unifor.br |

### Disciplinas (15)
| ID | Código | Nome | Carga Horária |
|----|--------|------|---------------|
| 1 | ALG | Algoritmos | 60 |
| 2 | BD | Banco de Dados | 60 |
| 3 | POO | Programação Orientada a Objetos | 60 |
| 4 | ES | Engenharia de Software | 60 |
| 5 | RC | Redes de Computadores | 60 |
| 6 | SO | Sistemas Operacionais | 60 |
| 7 | IA | Inteligência Artificial | 60 |
| 8 | WEB | Desenvolvimento Web | 60 |
| 9 | MOB | Desenvolvimento Mobile | 60 |
| 10 | SEG | Segurança da Informação | 60 |
| 11 | CAL | Cálculo I | 80 |
| 12 | FIS | Física I | 80 |
| 13 | EST | Estatística | 60 |
| 14 | ADM | Administração Geral | 60 |
| 15 | DIR | Direito Empresarial | 60 |

### Alunos (5)
| ID | Matrícula | Nome | Email | Curso |
|----|-----------|------|-------|-------|
| 1 | 2024001 | Felipe Rodrigues | felipe@edu.unifor.br | CC |
| 2 | 2024002 | Gabriela Costa | gabriela@edu.unifor.br | SI |
| 3 | 2024003 | Henrique Lima | henrique@edu.unifor.br | ES |
| 4 | 2024004 | Isabella Souza | isabella@edu.unifor.br | ADM |
| 5 | 2024005 | João Ferreira | joao.f@edu.unifor.br | DIR |

---

## 5. Configuração do Keycloak

### Realm: unifor

### Clients:
- **backend**: confidential, service-accounts-enabled
- **portal**: public, redirect URIs: http://localhost:4200/*

### Roles:
- `COORDENADOR`
- `ALUNO`

### Usuários de Teste:
| Username | Password | Role | Observação |
|----------|----------|------|------------|
| coord1 | coord123 | COORDENADOR | Ana Costa |
| coord2 | coord123 | COORDENADOR | Bruno Lima |
| coord3 | coord123 | COORDENADOR | Carla Souza |
| aluno1 | aluno123 | ALUNO | Felipe Rodrigues |
| aluno2 | aluno123 | ALUNO | Gabriela Costa |
| aluno3 | aluno123 | ALUNO | Henrique Lima |
| aluno4 | aluno123 | ALUNO | Isabella Souza |
| aluno5 | aluno123 | ALUNO | João Ferreira |

---

## 6. Endpoints da API

### Coordenador

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/matriz | Lista aulas com filtros |
| POST | /api/matriz | Cria nova aula |
| PUT | /api/matriz/{id} | Atualiza aula |
| DELETE | /api/matriz/{id} | Remove aula (soft delete) |
| GET | /api/cursos | Lista cursos do coordenador |
| GET | /api/disciplinas | Lista todas disciplinas |
| GET | /api/professores | Lista todos professores |
| GET | /api/horarios | Lista todos horários |

### Aluno

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /api/aluno/aulas-disponiveis | Lista aulas disponíveis para matrícula |
| GET | /api/aluno/matriculas | Lista matrículas do aluno |
| POST | /api/aluno/matriculas | Realiza matrícula |

---

## 7. Estratégia de Testes

### Backend
- **Unitários**: Services com mocks dos repositories
- **Framework**: JUnit 5 + Mockito ou MockK
- **Foco**: Regras de negócio (validações, conflitos, concorrência)

### Frontend (Diferencial)
- **Unitários**: Services com HttpClientTestingModule
- **Framework**: Jest (configurado pelo Nx)
- **Foco**: Transformações de dados, lógica de estado

---

## 8. Checklist Final

- [ ] Docker Compose sobe todos os serviços
- [ ] Keycloak tem realm e usuários configurados
- [ ] Backend inicia e conecta ao banco
- [ ] Swagger UI acessível em `/q/swagger-ui`
- [ ] Frontend inicia e redireciona para login
- [ ] Login funciona para coordenador e aluno
- [ ] Coordenador consegue criar/editar/excluir aulas
- [ ] Aluno consegue ver aulas disponíveis
- [ ] Aluno consegue se matricular
- [ ] Validações de conflito funcionam
- [ ] README completo e claro
