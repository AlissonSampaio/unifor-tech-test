---
name: Correções Finais Entrega
overview: Plano de correcoes finais para deixar o projeto em estado ideal de entrega, focando em limpar o repositorio, commitar arquivos pendentes e ajustar configuracoes criticas.
todos:
  - id: remove-debug
    content: Deletar backend_logs.txt e git-history-visual.html, criar .gitignore
    status: pending
  - id: fix-hibernate
    content: Mudar drop-and-create para update em application.properties
    status: pending
  - id: update-readme
    content: Substituir README.md com instrucoes completas
    status: pending
  - id: update-decisions
    content: Adicionar secao de Desafios Encontrados no DECISOES_TECNICAS.md
    status: pending
  - id: final-commit
    content: git add -A && git commit com mensagem descritiva
    status: pending
  - id: smoke-test
    content: Executar docker-compose up e testar fluxo completo
    status: pending
isProject: false
---

# Plano de Correcoes Finais - Entrega do Teste Tecnico

## Contexto

O projeto esta funcional mas tem problemas que podem prejudicar a avaliacao:

- Arquivos modificados nao commitados
- Arquivos de debug no repositorio
- Configuracao do Hibernate que apaga dados
- README desatualizado

---

## TAREFA 1: Remover Arquivos de Debug

### Arquivos para Deletar

Deletar estes arquivos da raiz do projeto:

- `backend_logs.txt`
- `git-history-visual.html`

### Adicionar ao .gitignore

Criar ou atualizar o arquivo `.gitignore` na raiz com:

```
# Logs
*.log
backend_logs.txt

# Arquivos temporarios
git-history-visual.html

# IDE
.idea/
*.iml

# Build
backend/target/
frontend/dist/
frontend/node_modules/

# OS
.DS_Store
Thumbs.db
```

---

## TAREFA 2: Corrigir Configuracao do Hibernate

### Arquivo: `backend/src/main/resources/application.properties`

Alterar a linha:

```properties
quarkus.hibernate-orm.database.generation=drop-and-create
```

Para:

```properties
quarkus.hibernate-orm.database.generation=update
```

**Motivo**: `drop-and-create` apaga todos os dados toda vez que o backend reinicia. `update` mantem os dados e apenas atualiza o schema se necessario.

---

## TAREFA 3: Atualizar README com Instrucoes Completas

### Arquivo: `README.md`

Substituir o conteudo por:

```markdown
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

```

---

## TAREFA 4: Atualizar DECISOES_TECNICAS.md

### Arquivo: `DECISOES_TECNICAS.md`

Adicionar no final do arquivo, antes de qualquer conclusao:

```markdown

## 8. Desafios Encontrados e Solucoes

### 8.1 Sincronizacao Keycloak-Banco
**Problema**: Os IDs dos usuarios no Keycloak eram gerados automaticamente, nao correspondendo ao `keycloak_id` no banco.
**Solucao**: Definir IDs fixos no `realm-export.json` que correspondem exatamente aos valores em `import.sql`.

### 8.2 OIDC em Ambiente Dual (Docker + Local)
**Problema**: O issuer do token JWT difere entre execucao local (localhost:8180) e Docker (keycloak:8080).
**Solucao**: Configurar `quarkus.oidc.token.issuer` separado do `auth-server-url`.

### 8.3 PrimeNG v21 Breaking Changes
**Problema**: Migracao de PrimeNG v17 para v21 quebrou varios componentes.
**Solucao**: Substituir `DropdownModule` por `SelectModule` e usar nova API de temas com `@primeuix/themes`.

### 8.4 Angular SSR com Keycloak
**Problema**: Server-Side Rendering falha porque Keycloak precisa de `window`.
**Solucao**: Desabilitar prerendering no `project.json` do portal.
```

---

## TAREFA 5: Commit Final

### Passo 1: Verificar arquivos modificados

```bash
git status
```

### Passo 2: Adicionar .gitignore

```bash
git add .gitignore
```

### Passo 3: Adicionar todos os arquivos modificados

```bash
git add -A
```

### Passo 4: Fazer commit com mensagem descritiva

```bash
git commit -m "chore: final cleanup and documentation improvements

- Remove debug files (backend_logs.txt, git-history-visual.html)
- Add comprehensive .gitignore
- Change Hibernate to update mode (was drop-and-create)
- Expand README with complete setup instructions
- Document technical challenges and solutions in DECISOES_TECNICAS.md"
```

### Passo 5: Verificar estado final

```bash
git status
git log --oneline -5
```

O `git status` deve mostrar:

```
On branch master
nothing to commit, working tree clean
```

---

## TAREFA 6: Verificacao Final (Smoke Test)

### Executar e Testar

1. Limpar ambiente:

```bash
docker-compose down -v
```

1. Subir tudo:

```bash
docker-compose up --build
```

1. Aguardar 2-3 minutos e verificar:
  - [http://localhost:4200](http://localhost:4200) - Deve redirecionar para login Keycloak
  - Login com coord1/coord123 - Deve mostrar tela de Matriz Curricular
  - Criar uma aula de teste
  - Logout
  - Login com aluno1/aluno123 - Deve mostrar tela de Matriculas
  - Verificar se a aula aparece (se o curso for autorizado)

---

## Ordem de Execucao

1. TAREFA 1: Remover arquivos de debug e criar .gitignore
2. TAREFA 2: Corrigir application.properties
3. TAREFA 3: Atualizar README.md
4. TAREFA 4: Atualizar DECISOES_TECNICAS.md
5. TAREFA 5: Fazer commit final
6. TAREFA 6: Smoke test (opcional mas recomendado)

---

## Resultado Esperado

Apos executar todas as tarefas:

- `git status` mostra "working tree clean"
- Nenhum arquivo de debug no repositorio
- README com instrucoes completas de execucao
- Configuracao de banco segura (nao apaga dados)
- Documentacao de desafios tecnicos (mostra experiencia real)

