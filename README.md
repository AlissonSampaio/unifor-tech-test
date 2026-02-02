# Sistema de Matriz Curricular - Unifor

Sistema full-stack para gerenciamento de matriz curricular e matrículas de alunos, desenvolvido como teste técnico.

## 🚀 Tecnologias

### Backend
- **Kotlin 2.0+**
- **Quarkus 3.15+** (Framework Java nativo do GraalVM)
- **Hibernate Panache** (Camada de persistência simplificada)
- **PostgreSQL 15** (Banco de dados)
- **Keycloak 24** (Autenticação e Autorização OIDC)

### Frontend
- **Angular 18+**
- **Nx 22+** (Monorepo management)
- **PrimeNG 21+** (Biblioteca de componentes UI)
- **PrimeFlex** (Utilitários de CSS)
- **RxJS** (Programação reativa)

## 🛠️ Pré-requisitos

- **Docker & Docker Compose**
- **Java 17+** (JDK)
- **Node.js 20+**

## 🏃 Como Executar

### 1. Infraestrutura (Banco e Auth)
Na raiz do projeto:
```bash
docker-compose up -d
```
Aguarde os serviços subirem. O Keycloak importará automaticamente o realm `unifor`.

### 2. Backend
```bash
cd backend
./mvnw quarkus:dev
```
A API estará disponível em `http://localhost:8080`.
Swagger UI: `http://localhost:8080/q/swagger-ui`.

### 3. Frontend
```bash
cd frontend
npm install
npx nx serve portal
```
Acesse `http://localhost:4200`.

## 👥 Credenciais de Teste

| Usuário | Senha | Perfil | Curso/Gerencia |
|---------|-------|--------|----------------|
| `coord1`| `coord123` | Coordenador | CC, SI, ES |
| `coord2`| `coord123` | Coordenador | EC, EM, EE |
| `aluno1`| `aluno123` | Aluno | Ciência da Computação |
| `aluno2`| `aluno123` | Aluno | Sistemas de Informação |

## 🏗️ Estrutura do Monorepo

- `backend/`: Projeto Quarkus com arquitetura em camadas.
- `frontend/`: Workspace Nx contendo:
  - `apps/portal`: Aplicação Angular principal.
  - `libs/auth`: Biblioteca de integração com Keycloak e Guards.
  - `libs/data-access`: Camada de serviços e modelos de API.
  - `libs/shared`: Componentes compartilhados.

## 📝 Decisões Técnicas

As principais decisões técnicas estão documentadas no arquivo [DECISOES_TECNICAS.md](./DECISOES_TECNICAS.md).
