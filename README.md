# Sistema de Matriz Curricular - Unifor

Projeto de teste técnico para gerenciamento de matriz curricular e matrículas, utilizando Quarkus (Backend) e Angular/Nx (Frontend).

## Pré-requisitos

- Docker & Docker Compose
- Java 21+ (para desenvolvimento backend)
- Node.js 20+ (para desenvolvimento frontend)

## Infraestrutura

Para subir o banco de dados e o Keycloak:

```bash
docker-compose up -d
```

### URLs de Acesso

- **Keycloak Admin**: [http://localhost:8180](http://localhost:8180) (Usuário: `admin` / Senha: `admin`)
- **Backend API**: [http://localhost:8080](http://localhost:8080)
- **Frontend Portal**: [http://localhost:4200](http://localhost:4200)

### Configurações Keycloak

- **Realm**: `unifor`
- **Clients**: `backend` (confidential), `portal` (public)
- **Roles**: `COORDENADOR`, `ALUNO`
