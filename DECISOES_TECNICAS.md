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
- **Programação Reativa (RxJS)**: Uso extensivo de `BehaviorSubject` para gerenciar estado local e subscrições automáticas via `async pipe`, evitando memory leaks e garantindo UI sempre sincronizada.

## 4. Segurança: Keycloak (OIDC)

- **Keycloak**: Escolhido para descentralizar a gestão de usuários e segurança.
- **RBAC (Role Based Access Control)**: O backend valida as roles `COORDENADOR` e `ALUNO` via `@RolesAllowed`. O frontend utiliza Guards (`authGuard` e `roleGuard`) para proteger rotas e elementos de UI.

## 5. UI/UX: PrimeNG

- **PrimeNG**: Selecionado pela maturidade e vasta gama de componentes complexos (Table, Dialog, MultiSelect) que agilizam o desenvolvimento de dashboards administrativos.
- **Aesthetics**: Segue a paleta de cores institucional sugerida, com foco em usabilidade e feedback instantâneo (Toasts).
