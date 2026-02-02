---
name: Melhorias Finais Teste
overview: Plano de melhorias estrategicas para maximizar as chances de sucesso no teste tecnico, priorizando testes de integracao, containerizacao completa e diferenciais competitivos.
todos: []
isProject: false
---

# Plano de Melhorias Finais - Teste Tecnico Unifor

## Prioridades Estrategicas

```
┌─────────────────────────────────────────────────────────────────┐
│  IMPACTO NA AVALIACAO                                           │
├─────────────────────────────────────────────────────────────────┤
│  ALTO   │ Testes de Integracao REST (Backend)                  │
│         │ Verificar se projeto roda (smoke test)               │
│         │ Docker-compose completo (backend + frontend)         │
├─────────────────────────────────────────────────────────────────┤
│  MEDIO  │ Testes Unitarios Frontend (diferencial)              │
│         │ Melhorar UX com informacoes do usuario logado        │
│         │ Adicionar mais comentarios no DECISOES_TECNICAS      │
├─────────────────────────────────────────────────────────────────┤
│  BAIXO  │ Polimento de UI                                      │
│         │ Logs estruturados                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 1. Testes de Integracao REST (ALTO IMPACTO)

O `rest-assured` ja esta no pom.xml mas nao ha testes de integracao. Isso e muito valorizado.

### Criar: [backend/src/test/kotlin/br/edu/unifor/MatrizCurricularResourceTest.kt]

```kotlin
@QuarkusTest
@TestHTTPEndpoint(MatrizCurricularResource::class)
class MatrizCurricularResourceTest {

    @Test
    fun `deve retornar 401 sem autenticacao`() {
        given()
            .`when`().get()
            .then()
            .statusCode(401)
    }

    @Test
    @TestSecurity(user = "coord1", roles = ["COORDENADOR"])
    fun `deve listar matrizes como coordenador`() {
        given()
            .`when`().get()
            .then()
            .statusCode(200)
            .body("$", hasSize(greaterThanOrEqualTo(0)))
    }

    @Test
    @TestSecurity(user = "aluno1", roles = ["ALUNO"])
    fun `deve retornar 403 para aluno acessando endpoint de coordenador`() {
        given()
            .`when`().get()
            .then()
            .statusCode(403)
    }

    @Test
    @TestSecurity(user = "coord1", roles = ["COORDENADOR"])
    fun `deve retornar 400 para request invalido`() {
        given()
            .contentType(ContentType.JSON)
            .body("{}")
            .`when`().post()
            .then()
            .statusCode(400)
    }
}
```

### Criar: [backend/src/test/kotlin/br/edu/unifor/AlunoResourceTest.kt]

Testes similares para o endpoint do aluno.

### Adicionar dependencia no pom.xml

```xml
<dependency>
    <groupId>io.quarkus</groupId>
    <artifactId>quarkus-test-security</artifactId>
    <scope>test</scope>
</dependency>
```

---

## 2. Docker Compose Completo (ALTO IMPACTO)

Atualmente o docker-compose so tem postgres e keycloak. Adicionar backend e frontend para facilitar a vida do avaliador.

### Atualizar: [docker-compose.yml]

```yaml
services:
  postgres:
    # ... existente ...

  keycloak:
    # ... existente ...

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: unifor-backend
    ports:
      - "8080:8080"
    environment:
      QUARKUS_DATASOURCE_JDBC_URL: jdbc:postgresql://postgres:5432/matriz_curricular
      QUARKUS_OIDC_AUTH_SERVER_URL: http://keycloak:8080/realms/unifor
    depends_on:
      keycloak:
        condition: service_started

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: unifor-frontend
    ports:
      - "4200:80"
    depends_on:
      - backend
```

### Criar: [backend/Dockerfile]

```dockerfile
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/quarkus-app /app
EXPOSE 8080
CMD ["java", "-jar", "quarkus-run.jar"]
```

### Criar: [frontend/Dockerfile]

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx nx build portal --configuration=production

FROM nginx:alpine
COPY --from=build /app/dist/apps/portal/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Criar: [frontend/nginx.conf]

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:8080;
    }
}
```

---

## 3. Testes Unitarios Frontend (MEDIO IMPACTO - DIFERENCIAL)

O documento diz que testes no frontend sao diferencial.