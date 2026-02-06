# Decisões Técnicas - Matriz Curricular

Este documento descreve as principais escolhas arquiteturais e técnicas feitas durante o desenvolvimento.

## 1. Backend: Quarkus & Kotlin

- **Kotlin**: Escolhido pela expressividade e segurança nula (null-safety), reduzindo o boilerplate em comparação ao Java tradicional.
- **Quarkus Panache**: Optou-se pelo Panache (Active Record/Repository pattern) pela simplicidade em CRUDs, mantendo o poder do Hibernate mas com menos código repetitivo.
- **Arquitetura em Camadas**: O projeto segue uma separação clara entre:
    - `api`: DTOs e Resources (REST).
    - `application`: Services contendo as regras de negócio críticas.
    - `domain`: Entidades JPA e interfaces de repositório.
    - `infrastructure`: Configurações transversais (segurança, exceções).

## 2. Controle de Concorrência

Para o fluxo de matrícula, onde a concorrência é alta (múltiplos alunos tentando a mesma vaga), foi implementado o **Pessimistic Lock** (`PESSIMISTIC_WRITE`).
- **Motivo**: Garante que o contador de vagas seja verificado e atualizado de forma atômica no banco de dados, evitando "overbooking" (mais matrículas que o permitido).

## 3. Frontend: Nx & Monorepo

- **Nx Workspace**: Utilizado para organizar o frontend em bibliotecas reutilizáveis.
    - `auth`: Encapsula a complexidade do Keycloak, facilitando o uso em múltiplos apps futuramente.
    - `data-access`: Centraliza as chamadas de API, garantindo tipagem forte em todo o projeto.
    - `shared`: Contém pipes e utilitários reutilizáveis (ex: `FormatDiaSemanaPipe`) para evitar duplicação de código entre componentes.
- **Programação Reativa (RxJS)**: Uso de `BehaviorSubject` para gerenciar estado local, `switchMap` para encadear operações (ex: refresh pós-CRUD), `forkJoin` para carregamento paralelo, e `async pipe` nos templates para subscrições automáticas. O `takeUntilDestroyed` é utilizado para evitar memory leaks em subscrições manuais dentro de componentes.

## 4. Segurança: Keycloak (OIDC)

- **Keycloak**: Escolhido para descentralizar a gestão de usuários e segurança.
- **RBAC (Role Based Access Control)**: O backend valida as roles `COORDENADOR` e `ALUNO` via `@RolesAllowed`. O frontend utiliza Guards (`authGuard` e `roleGuard`) para proteger rotas e elementos de UI.
- **Token Interceptor**: Utilizado o `includeBearerTokenInterceptor` do `keycloak-angular` para injetar automaticamente o token JWT nas requisições para `/api/*`.

## 5. UI/UX: PrimeNG

- **PrimeNG**: Selecionado pela maturidade e vasta gama de componentes complexos (Table, Dialog, MultiSelect) que agilizam o desenvolvimento de dashboards administrativos.
- **Aesthetics**: Segue a paleta de cores institucional sugerida, com foco em usabilidade e feedback instantâneo (Toasts).
- **Responsividade**: Layout adaptativo com tabelas para desktop e cards para mobile.

## 6. Profiles Quarkus (Dev / Prod)

O arquivo `application.properties` utiliza **profiles nativos do Quarkus** (`%dev`, `%test`, `%prod`) para separar configurações por ambiente:

- **`%dev`**: Banco local na porta 5433, `drop-and-create` para agilizar o desenvolvimento, logs SQL habilitados.
- **`%test`**: Mesma configuração do dev, mas com logs SQL desabilitados para output mais limpo nos testes.
- **`%prod`**: Banco via Docker (`postgres:5432`), `update` para preservar dados entre reinícios, logs SQL desabilitados para performance.

O Docker Compose define `QUARKUS_PROFILE=prod` para garantir que o backend sempre rode com configurações de produção dentro dos containers.

## 7. Proxy Reverso e URLs

Para evitar URLs hardcoded no frontend e garantir funcionamento tanto em desenvolvimento local quanto em Docker:

- **Desenvolvimento**: O Angular dev server usa `proxy.conf.json` para redirecionar chamadas `/api/*` para `http://localhost:8080`.
- **Produção (Docker)**: O Nginx serve os arquivos estáticos e faz proxy reverso de `/api/*` para o backend.
- **Resultado**: Todos os services do frontend usam URLs relativas (`/api/...`), funcionando transparentemente em ambos os ambientes.

## 8. Trade-offs e Limitações

- **Validação de Conflito de Horário**: Atualmente valida apenas por ID do horário. 
  Uma melhoria seria validar sobreposição de horários reais (hora_inicio/hora_fim) para suportar horários de durações variáveis ou turnos quebrados.
  
- **Soft Delete**: Implementado via flag `deleted` na entidade `MatrizCurricular`. 
  Isso evita a perda de integridade referencial com o histórico de matrículas, permitindo que o aluno ainda veja dados de aulas passadas que foram "removidas" do catálogo atual.

- **Filtragem por Cursos do Coordenador**: A filtragem de matrizes por cursos autorizados do coordenador é feita diretamente na query SQL (HQL), garantindo performance e escalabilidade mesmo com grande volume de dados.

## 9. O que faria com mais tempo

- **Paginação**: Implementar paginação nas listagens de matriz e matrículas para suportar grandes volumes de dados.
- **Cache**: Adicionar cache (ex: Redis ou Caffeine) para dados de referência (disciplinas, professores, cursos) que mudam raramente.
- **CI/CD**: Configurar pipeline de GitHub Actions para rodar testes e builds automaticamente.
- **Monitoramento**: Adicionar Prometheus e Grafana para métricas de performance da API.
- **Migrations**: Substituir o `import.sql` por Flyway para controle versionado de schema e dados iniciais.

## 10. Desafios Encontrados e Soluções

### 10.1 Sincronização Keycloak-Banco
**Problema**: Os IDs dos usuários no Keycloak eram gerados automaticamente, não correspondendo ao `keycloak_id` no banco.
**Solução**: Definir IDs fixos no `realm-export.json` que correspondem exatamente aos valores em `import.sql`.

### 10.2 OIDC em Ambiente Dual (Docker + Local)
**Problema**: O issuer do token JWT difere entre execução local (localhost:8180) e Docker (keycloak:8080).
**Solução**: Utilizar profiles Quarkus para configurar `oidc.auth-server-url` e `oidc.token.issuer` separadamente por ambiente.

### 10.3 PrimeNG v21 Breaking Changes
**Problema**: Migração de PrimeNG v17 para v21 quebrou vários componentes.
**Solução**: Substituir `DropdownModule` por `SelectModule` e usar nova API de temas com `@primeuix/themes`.

### 10.4 Angular SSR com Keycloak
**Problema**: Server-Side Rendering falha porque Keycloak precisa de `window`.
**Solução**: Desabilitar prerendering no `project.json` do portal.

## 11. Testes

### Backend
- **Testes unitários** com Mockito para services (MatrizCurricularService, MatriculaService) cobrindo regras de negócio: criação, edição, exclusão, concorrência, controle de acesso.
- **Testes de integração** com RestAssured e `@TestSecurity` para validar endpoints REST, códigos HTTP e controle de acesso por perfil.

### Frontend
- **Testes unitários** com Vitest para services (AuthService, MatriculaService, MatrizService) validando comunicação HTTP, gerenciamento de estado reativo e interceptação de tokens.
- **Testes E2E** com Playwright para fluxos principais (autenticação, coordenador CRUD, matrícula do aluno).
