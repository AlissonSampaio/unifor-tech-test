# Prompts para Execução por IA

Use estes prompts sequencialmente. Cada prompt deve resultar em código funcional e commits verificáveis.

---

## PROMPT 1: Infraestrutura Docker

```text
Preciso configurar a infraestrutura para um projeto full-stack. Crie os seguintes arquivos:

1. `docker-compose.yml` na raiz com:
   - Serviço `postgres`:
     - Image: postgres:15-alpine
     - Porta: 5432:5432
     - Environment: POSTGRES_USER=unifor, POSTGRES_PASSWORD=unifor123, POSTGRES_DB=matriz_curricular
     - Volume: ./docker/init.sql:/docker-entrypoint-initdb.d/init.sql
     - Healthcheck com pg_isready
   
   - Serviço `keycloak`:
     - Image: quay.io/keycloak/keycloak:24.0
     - Porta: 8180:8080 (8180 externo para não conflitar com Quarkus)
     - Command: start-dev --import-realm
     - Environment: KEYCLOAK_ADMIN=admin, KEYCLOAK_ADMIN_PASSWORD=admin
     - Volume: ./docker/keycloak:/opt/keycloak/data/import
     - Depends_on: postgres

2. `docker/init.sql` - arquivo vazio com comentário (Hibernate criará o schema)

3. `docker/keycloak/realm-export.json` com:
   - Realm: "unifor"
   - Clients:
     - "backend": confidential, secret "backend-secret", service-accounts-enabled
     - "portal": public, redirectUris ["http://localhost:4200/*"], webOrigins ["http://localhost:4200"]
   - Roles no realm: "COORDENADOR", "ALUNO"
   - Usuários (todos com emailVerified=true, enabled=true):
     - coord1/coord123 com role COORDENADOR
     - coord2/coord123 com role COORDENADOR  
     - coord3/coord123 com role COORDENADOR
     - aluno1/aluno123 com role ALUNO
     - aluno2/aluno123 com role ALUNO
     - aluno3/aluno123 com role ALUNO
     - aluno4/aluno123 com role ALUNO
     - aluno5/aluno123 com role ALUNO

4. `README.md` básico com:
   - Título: Sistema de Matriz Curricular - Unifor
   - Seção de pré-requisitos: Docker, Docker Compose
   - Comando para subir: docker-compose up -d
   - URLs: Keycloak em http://localhost:8180 (admin/admin)

Depois de criar os arquivos, me dê os comandos git para:
- Inicializar repositório
- Fazer commit com mensagem: "chore: setup docker infrastructure with postgres and keycloak"
```

---

## PROMPT 2: Backend - Inicialização do Projeto

```text
Preciso criar o projeto backend Quarkus. Execute:

1. Criar projeto Quarkus na pasta `backend/` usando CLI ou Maven:
   - groupId: br.edu.unifor
   - artifactId: matriz-curricular
   - Kotlin habilitado
   - Extensions:
     - resteasy-reactive-jackson
     - hibernate-orm-panache-kotlin
     - jdbc-postgresql
     - hibernate-validator
     - smallrye-openapi
     - oidc
     - kotlin

2. Configurar `backend/src/main/resources/application.properties`:
```properties
# Datasource
quarkus.datasource.db-kind=postgresql
quarkus.datasource.username=unifor
quarkus.datasource.password=unifor123
quarkus.datasource.jdbc.url=jdbc:postgresql://localhost:5432/matriz_curricular

# Hibernate
quarkus.hibernate-orm.database.generation=update
quarkus.hibernate-orm.log.sql=true

# OIDC
quarkus.oidc.auth-server-url=http://localhost:8180/realms/unifor
quarkus.oidc.client-id=backend
quarkus.oidc.credentials.secret=backend-secret

# OpenAPI
quarkus.smallrye-openapi.info-title=API Matriz Curricular
quarkus.smallrye-openapi.info-version=1.0.0
quarkus.smallrye-openapi.info-description=API para gerenciamento de matriz curricular e matrículas

# CORS
quarkus.http.cors=true
quarkus.http.cors.origins=http://localhost:4200
quarkus.http.cors.methods=GET,POST,PUT,DELETE,OPTIONS
quarkus.http.cors.headers=accept,authorization,content-type
```

3. Criar estrutura de pacotes em src/main/kotlin/br/edu/unifor/:
   - domain/model/
   - domain/repository/
   - application/service/
   - application/exception/
   - api/resource/
   - api/dto/
   - infrastructure/

4. Criar um endpoint health check simples para testar.

Commit: "chore(backend): init quarkus project with kotlin and extensions"
```

---

## PROMPT 3: Backend - Entidades de Domínio

```text
Crie as entidades JPA em Kotlin no pacote br.edu.unifor.domain.model.

Regras gerais:
- Use PanacheEntityBase ou PanacheEntity
- IDs são Long auto-gerados
- Use @field: para anotações JPA em data classes ou classes normais
- Não over-comente o código

ENTIDADES BASE (dados pré-cadastrados):

1. Curso:
   - id: Long
   - codigo: String (unique, max 10)
   - nome: String (max 100)

2. Disciplina:
   - id: Long
   - codigo: String (unique, max 10)
   - nome: String (max 100)
   - cargaHoraria: Int

3. Professor:
   - id: Long
   - nome: String (max 100)
   - email: String (unique)

4. Horario:
   - id: Long
   - diaSemana: enum DiaSemana (SEGUNDA, TERCA, QUARTA, QUINTA, SEXTA, SABADO)
   - horaInicio: LocalTime
   - horaFim: LocalTime
   - periodo: enum Periodo (MANHA, TARDE, NOITE)

5. Coordenador:
   - id: Long
   - nome: String (max 100)
   - email: String (unique)
   - keycloakId: String (unique) - para vincular ao usuário do Keycloak
   - cursosGerenciados: ManyToMany com Curso

6. Aluno:
   - id: Long
   - matricula: String (unique)
   - nome: String (max 100)
   - email: String (unique)
   - keycloakId: String (unique)
   - curso: ManyToOne com Curso

ENTIDADES DE NEGÓCIO:

7. MatrizCurricular (representa uma aula ofertada):
   - id: Long
   - disciplina: ManyToOne (não nulo)
   - professor: ManyToOne (não nulo)
   - horario: ManyToOne (não nulo)
   - maxAlunos: Int (mínimo 1)
   - cursosAutorizados: ManyToMany com Curso
   - coordenador: ManyToOne (quem criou)
   - deleted: Boolean (default false) - para soft delete
   - createdAt: LocalDateTime

8. Matricula:
   - id: Long
   - aluno: ManyToOne (não nulo)
   - matrizCurricular: ManyToOne (não nulo)
   - dataMatricula: LocalDateTime
   - Constraint unique em (aluno_id, matriz_curricular_id)

Crie também os enums DiaSemana e Periodo no mesmo pacote.

Commit: "feat(backend): add domain entities with jpa mappings"
```

---

## PROMPT 4: Backend - Repositórios e Dados Seed

```text
1. Crie repositórios no pacote br.edu.unifor.domain.repository usando PanacheRepository:

- CursoRepository
- DisciplinaRepository
- ProfessorRepository
- HorarioRepository (com método para buscar por período)
- CoordenadorRepository (com método findByKeycloakId)
- AlunoRepository (com método findByKeycloakId)
- MatrizCurricularRepository:
  - findByFilters(periodo: Periodo?, cursoId: Long?, horaInicio: LocalTime?, horaFim: LocalTime?): List<MatrizCurricular>
  - countMatriculados(matrizId: Long): Long
- MatriculaRepository:
  - findByAlunoId(alunoId: Long): List<Matricula>
  - existsByAlunoAndHorario(alunoId: Long, horarioId: Long): Boolean

2. Atualize docker/init.sql com os dados seed:

-- Cursos (9)
INSERT INTO curso (id, codigo, nome) VALUES
(1, 'CC', 'Ciência da Computação'),
(2, 'SI', 'Sistemas de Informação'),
(3, 'ES', 'Engenharia de Software'),
(4, 'EC', 'Engenharia Civil'),
(5, 'EM', 'Engenharia Mecânica'),
(6, 'EE', 'Engenharia Elétrica'),
(7, 'ADM', 'Administração'),
(8, 'DIR', 'Direito'),
(9, 'MED', 'Medicina');

-- Professores (5)
INSERT INTO professor (id, nome, email) VALUES
(1, 'Dr. João Silva', 'joao.silva@unifor.br'),
(2, 'Dra. Maria Santos', 'maria.santos@unifor.br'),
(3, 'Dr. Pedro Oliveira', 'pedro.oliveira@unifor.br'),
(4, 'Dra. Julia Ferreira', 'julia.ferreira@unifor.br'),
(5, 'Dr. Lucas Almeida', 'lucas.almeida@unifor.br');

-- Horarios (9)
INSERT INTO horario (id, dia_semana, hora_inicio, hora_fim, periodo) VALUES
(1, 'SEGUNDA', '07:30', '09:10', 'MANHA'),
(2, 'SEGUNDA', '09:20', '11:00', 'MANHA'),
(3, 'SEGUNDA', '11:10', '12:50', 'MANHA'),
(4, 'TERCA', '13:30', '15:10', 'TARDE'),
(5, 'TERCA', '15:20', '17:00', 'TARDE'),
(6, 'TERCA', '17:10', '18:50', 'TARDE'),
(7, 'QUARTA', '19:00', '20:40', 'NOITE'),
(8, 'QUARTA', '20:50', '22:30', 'NOITE'),
(9, 'QUINTA', '19:00', '20:40', 'NOITE');

-- Disciplinas (15)
INSERT INTO disciplina (id, codigo, nome, carga_horaria) VALUES
(1, 'ALG', 'Algoritmos', 60),
(2, 'BD', 'Banco de Dados', 60),
(3, 'POO', 'Programação Orientada a Objetos', 60),
(4, 'ENGSOFT', 'Engenharia de Software', 60),
(5, 'RC', 'Redes de Computadores', 60),
(6, 'SO', 'Sistemas Operacionais', 60),
(7, 'IA', 'Inteligência Artificial', 60),
(8, 'WEB', 'Desenvolvimento Web', 60),
(9, 'MOB', 'Desenvolvimento Mobile', 60),
(10, 'SEG', 'Segurança da Informação', 60),
(11, 'CAL', 'Cálculo I', 80),
(12, 'FIS', 'Física I', 80),
(13, 'EST', 'Estatística', 60),
(14, 'ADMG', 'Administração Geral', 60),
(15, 'DIREMP', 'Direito Empresarial', 60);

-- Coordenadores (3)
INSERT INTO coordenador (id, nome, email, keycloak_id) VALUES
(1, 'Ana Costa', 'ana.costa@unifor.br', 'coord1'),
(2, 'Bruno Lima', 'bruno.lima@unifor.br', 'coord2'),
(3, 'Carla Souza', 'carla.souza@unifor.br', 'coord3');

-- Coordenador-Curso (relacionamento)
INSERT INTO coordenador_curso (coordenador_id, curso_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 4), (2, 5), (2, 6),
(3, 7), (3, 8), (3, 9);

-- Alunos (5)
INSERT INTO aluno (id, matricula, nome, email, keycloak_id, curso_id) VALUES
(1, '2024001', 'Felipe Rodrigues', 'felipe@edu.unifor.br', 'aluno1', 1),
(2, '2024002', 'Gabriela Costa', 'gabriela@edu.unifor.br', 'aluno2', 2),
(3, '2024003', 'Henrique Lima', 'henrique@edu.unifor.br', 'aluno3', 3),
(4, '2024004', 'Isabella Souza', 'isabella@edu.unifor.br', 'aluno4', 7),
(5, '2024005', 'João Ferreira', 'joao.f@edu.unifor.br', 'aluno5', 8);

-- Sequences (importante para que novos inserts funcionem)
SELECT setval('curso_id_seq', 10);
SELECT setval('professor_id_seq', 6);
SELECT setval('horario_id_seq', 10);
SELECT setval('disciplina_id_seq', 16);
SELECT setval('coordenador_id_seq', 4);
SELECT setval('aluno_id_seq', 6);

Commit: "feat(backend): add repositories and seed data"
```

---

## PROMPT 5: Backend - Serviço de Matriz Curricular

```text
Implemente o serviço de gestão da matriz curricular.

1. Crie DTOs em br.edu.unifor.api.dto:

data class MatrizCurricularRequest(
    val disciplinaId: Long,
    val professorId: Long,
    val horarioId: Long,
    val maxAlunos: Int,
    val cursosAutorizadosIds: List<Long>
)

data class MatrizCurricularResponse(
    val id: Long,
    val disciplina: DisciplinaResponse,
    val professor: ProfessorResponse,
    val horario: HorarioResponse,
    val maxAlunos: Int,
    val vagasDisponiveis: Int,
    val cursosAutorizados: List<CursoResponse>
)

// Crie também DisciplinaResponse, ProfessorResponse, HorarioResponse, CursoResponse

data class MatrizFiltroRequest(
    val periodo: Periodo?,
    val cursoId: Long?,
    val horaInicio: LocalTime?,
    val horaFim: LocalTime?
)

2. Crie exceções customizadas em br.edu.unifor.application.exception:
- BusinessException(message: String, errorCode: String)
- NotFoundException(entity: String, id: Long)
- ConflictException(message: String)
- ForbiddenException(message: String)

3. Crie exception mapper global em br.edu.unifor.infrastructure:
@Provider
class GlobalExceptionMapper : ExceptionMapper<Exception> que retorna:
- 400 para BusinessException
- 404 para NotFoundException
- 409 para ConflictException
- 403 para ForbiddenException
- 500 para outros erros

4. Crie MatrizCurricularService em br.edu.unifor.application.service:

@ApplicationScoped
class MatrizCurricularService {
    
    fun criar(request: MatrizCurricularRequest, keycloakId: String): MatrizCurricularResponse {
        // 1. Buscar coordenador pelo keycloakId
        // 2. Validar se disciplina, professor, horário existem
        // 3. Validar se todos os cursos autorizados existem
        // 4. Validar se coordenador gerencia os cursos informados
        // 5. Verificar se já não existe aula com mesma disciplina no mesmo horário
        // 6. Criar e salvar MatrizCurricular
        // 7. Retornar response mapeado
    }
    
    fun listar(filtro: MatrizFiltroRequest, keycloakId: String): List<MatrizCurricularResponse> {
        // 1. Buscar coordenador
        // 2. Aplicar filtros
        // 3. Retornar apenas matrizes de cursos que o coordenador gerencia
        // 4. Não retornar deletadas (deleted = false)
    }
    
    fun atualizar(id: Long, request: MatrizCurricularRequest, keycloakId: String): MatrizCurricularResponse {
        // 1. Buscar matriz existente
        // 2. Validar se coordenador tem permissão
        // 3. Não permitir alterar disciplina
        // 4. Ao remover curso autorizado, verificar se não há aluno daquele curso matriculado
        // 5. Validar novo horário e professor existem
        // 6. Atualizar e salvar
    }
    
    fun excluir(id: Long, keycloakId: String) {
        // 1. Buscar matriz
        // 2. Validar permissão do coordenador
        // 3. Verificar se não há matrículas
        // 4. Fazer soft delete (deleted = true)
    }
}

Commit: "feat(backend): add matrix management service with business rules"
```

---

## PROMPT 6: Backend - Resource do Coordenador

```text
Crie o REST Resource para coordenadores.

1. Em br.edu.unifor.api.resource, crie MatrizCurricularResource:

@Path("/api/matriz")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("COORDENADOR")
class MatrizCurricularResource {
    
    @Inject
    lateinit var service: MatrizCurricularService
    
    @Inject
    lateinit var securityIdentity: SecurityIdentity
    
    @GET
    @Operation(summary = "Lista aulas da matriz curricular")
    fun listar(
        @QueryParam("periodo") periodo: Periodo?,
        @QueryParam("cursoId") cursoId: Long?,
        @QueryParam("horaInicio") horaInicio: String?,
        @QueryParam("horaFim") horaFim: String?
    ): Response {
        val keycloakId = securityIdentity.principal.name
        val filtro = MatrizFiltroRequest(periodo, cursoId, parseTime(horaInicio), parseTime(horaFim))
        return Response.ok(service.listar(filtro, keycloakId)).build()
    }
    
    @POST
    @Operation(summary = "Cria nova aula na matriz")
    fun criar(request: MatrizCurricularRequest): Response {
        val keycloakId = securityIdentity.principal.name
        val created = service.criar(request, keycloakId)
        return Response.status(Response.Status.CREATED).entity(created).build()
    }
    
    @PUT
    @Path("/{id}")
    @Operation(summary = "Atualiza aula existente")
    fun atualizar(@PathParam("id") id: Long, request: MatrizCurricularRequest): Response {
        val keycloakId = securityIdentity.principal.name
        return Response.ok(service.atualizar(id, request, keycloakId)).build()
    }
    
    @DELETE
    @Path("/{id}")
    @Operation(summary = "Remove aula (soft delete)")
    fun excluir(@PathParam("id") id: Long): Response {
        val keycloakId = securityIdentity.principal.name
        service.excluir(id, keycloakId)
        return Response.noContent().build()
    }
}

2. Crie endpoints auxiliares para dados de referência:

@Path("/api/dados")
@Produces(MediaType.APPLICATION_JSON)
@Authenticated
class DadosReferenciaResource {
    
    @GET @Path("/disciplinas")
    fun listarDisciplinas(): List<DisciplinaResponse>
    
    @GET @Path("/professores")
    fun listarProfessores(): List<ProfessorResponse>
    
    @GET @Path("/horarios")
    fun listarHorarios(): List<HorarioResponse>
    
    @GET @Path("/cursos")
    @RolesAllowed("COORDENADOR")
    fun listarCursos(): List<CursoResponse> // Retorna apenas cursos do coordenador logado
}

Commit: "feat(backend): add rest endpoints for matrix management"
```

---

## PROMPT 7: Backend - Serviço de Matrícula

```text
Implemente o serviço de matrícula do aluno com controle de concorrência.

1. Crie DTOs:

data class MatriculaRequest(
    val matrizCurricularId: Long
)

data class MatriculaResponse(
    val id: Long,
    val disciplina: String,
    val professor: String,
    val horario: String,
    val dataMatricula: LocalDateTime
)

data class AulaDisponivelResponse(
    val id: Long,
    val disciplina: DisciplinaResponse,
    val professor: ProfessorResponse,
    val horario: HorarioResponse,
    val maxAlunos: Int,
    val vagasDisponiveis: Int,
    val conflitaHorario: Boolean,
    val podeMatricular: Boolean
)

2. Crie MatriculaService:

@ApplicationScoped
class MatriculaService {
    
    @Inject
    lateinit var em: EntityManager
    
    @Transactional
    fun realizarMatricula(request: MatriculaRequest, keycloakId: String): MatriculaResponse {
        val aluno = alunoRepository.findByKeycloakId(keycloakId)
            ?: throw NotFoundException("Aluno", keycloakId)
        
        // Lock pessimista na matriz para evitar race condition
        val matriz = em.find(
            MatrizCurricular::class.java, 
            request.matrizCurricularId,
            LockModeType.PESSIMISTIC_WRITE
        ) ?: throw NotFoundException("MatrizCurricular", request.matrizCurricularId)
        
        // Validação 1: Aula não deletada
        if (matriz.deleted) {
            throw BusinessException("Aula não disponível", "AULA_INDISPONIVEL")
        }
        
        // Validação 2: Curso do aluno autorizado
        if (matriz.cursosAutorizados.none { it.id == aluno.curso.id }) {
            throw BusinessException("Aula não autorizada para seu curso", "CURSO_NAO_AUTORIZADO")
        }
        
        // Validação 3: Vagas disponíveis
        val matriculados = matriculaRepository.countByMatrizId(matriz.id!!)
        if (matriculados >= matriz.maxAlunos) {
            throw ConflictException("Não há vagas disponíveis")
        }
        
        // Validação 4: Conflito de horário
        if (matriculaRepository.existsByAlunoAndHorario(aluno.id!!, matriz.horario.id!!)) {
            throw ConflictException("Conflito de horário com outra matrícula")
        }
        
        // Validação 5: Não está já matriculado
        if (matriculaRepository.existsByAlunoAndMatriz(aluno.id!!, matriz.id!!)) {
            throw ConflictException("Você já está matriculado nesta aula")
        }
        
        val matricula = Matricula(
            aluno = aluno,
            matrizCurricular = matriz,
            dataMatricula = LocalDateTime.now()
        )
        matriculaRepository.persist(matricula)
        
        return toResponse(matricula)
    }
    
    fun listarMinhasMatriculas(keycloakId: String): List<MatriculaResponse> {
        val aluno = alunoRepository.findByKeycloakId(keycloakId)
            ?: throw NotFoundException("Aluno", keycloakId)
        return matriculaRepository.findByAlunoId(aluno.id!!).map { toResponse(it) }
    }
    
    fun listarAulasDisponiveis(keycloakId: String): List<AulaDisponivelResponse> {
        val aluno = alunoRepository.findByKeycloakId(keycloakId)
            ?: throw NotFoundException("Aluno", keycloakId)
        
        // Buscar aulas autorizadas para o curso do aluno
        val aulas = matrizRepository.findByCursoId(aluno.curso.id!!)
        val minhasMatriculas = matriculaRepository.findByAlunoId(aluno.id!!)
        val meusHorarios = minhasMatriculas.map { it.matrizCurricular.horario.id }
        
        return aulas.map { aula ->
            val vagasOcupadas = matriculaRepository.countByMatrizId(aula.id!!)
            val vagasDisponiveis = aula.maxAlunos - vagasOcupadas.toInt()
            val conflitaHorario = meusHorarios.contains(aula.horario.id)
            val jaMatriculado = minhasMatriculas.any { it.matrizCurricular.id == aula.id }
            
            AulaDisponivelResponse(
                id = aula.id!!,
                disciplina = toDisciplinaResponse(aula.disciplina),
                professor = toProfessorResponse(aula.professor),
                horario = toHorarioResponse(aula.horario),
                maxAlunos = aula.maxAlunos,
                vagasDisponiveis = vagasDisponiveis,
                conflitaHorario = conflitaHorario,
                podeMatricular = vagasDisponiveis > 0 && !conflitaHorario && !jaMatriculado
            )
        }
    }
}

Commit: "feat(backend): add enrollment service with concurrency control"
```

---

## PROMPT 8: Backend - Resource do Aluno

```text
Crie o REST Resource para alunos.

@Path("/api/aluno")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("ALUNO")
class AlunoResource {
    
    @Inject
    lateinit var matriculaService: MatriculaService
    
    @Inject
    lateinit var securityIdentity: SecurityIdentity
    
    @GET
    @Path("/aulas-disponiveis")
    @Operation(summary = "Lista aulas disponíveis para matrícula")
    fun listarAulasDisponiveis(): Response {
        val keycloakId = securityIdentity.principal.name
        return Response.ok(matriculaService.listarAulasDisponiveis(keycloakId)).build()
    }
    
    @GET
    @Path("/matriculas")
    @Operation(summary = "Lista matrículas do aluno")
    fun listarMatriculas(): Response {
        val keycloakId = securityIdentity.principal.name
        return Response.ok(matriculaService.listarMinhasMatriculas(keycloakId)).build()
    }
    
    @POST
    @Path("/matriculas")
    @Operation(summary = "Realiza matrícula em uma aula")
    fun realizarMatricula(request: MatriculaRequest): Response {
        val keycloakId = securityIdentity.principal.name
        val created = matriculaService.realizarMatricula(request, keycloakId)
        return Response.status(Response.Status.CREATED).entity(created).build()
    }
}

Commit: "feat(backend): add rest endpoints for student enrollment"
```

---

## PROMPT 9: Backend - Testes Unitários

```text
Crie testes unitários para os serviços.

1. Adicione dependências de teste no pom.xml se necessário:
   - quarkus-junit5
   - quarkus-junit5-mockito ou mockk
   - rest-assured

2. Crie MatrizCurricularServiceTest:

@QuarkusTest
class MatrizCurricularServiceTest {
    
    @InjectMock
    lateinit var matrizRepository: MatrizCurricularRepository
    
    @InjectMock
    lateinit var coordenadorRepository: CoordenadorRepository
    
    // ... outros mocks
    
    @Inject
    lateinit var service: MatrizCurricularService
    
    @Test
    fun `deve criar matriz curricular com sucesso`() { }
    
    @Test
    fun `deve falhar ao criar matriz com disciplina inexistente`() { }
    
    @Test
    fun `deve falhar ao criar matriz para curso nao gerenciado`() { }
    
    @Test
    fun `nao deve excluir matriz com alunos matriculados`() { }
    
    @Test
    fun `deve fazer soft delete corretamente`() { }
}

3. Crie MatriculaServiceTest:

@QuarkusTest
class MatriculaServiceTest {
    
    @Test
    fun `deve realizar matricula com sucesso`() { }
    
    @Test
    fun `deve falhar matricula quando nao ha vagas`() { }
    
    @Test
    fun `deve falhar matricula com conflito de horario`() { }
    
    @Test
    fun `deve falhar matricula em curso nao autorizado`() { }
    
    @Test
    fun `deve listar apenas aulas do curso do aluno`() { }
}

Commit: "test(backend): add unit tests for matrix and enrollment services"
```

---

## PROMPT 10: Frontend - Setup Nx e PrimeNG

```text
Configure o workspace Nx para o frontend.

1. Na raiz do projeto, crie o workspace Nx:
   npx create-nx-workspace@latest frontend --preset=angular-monorepo --appName=portal --style=scss --routing=true --e2eTestRunner=none

2. Entre na pasta frontend e crie as libs:
   cd frontend
   nx g @nx/angular:library auth --directory=libs/auth --standalone --routing=false
   nx g @nx/angular:library shared --directory=libs/shared --standalone
   nx g @nx/angular:library data-access --directory=libs/data-access --standalone

3. Instale dependências:
   npm install primeng primeicons primeflex keycloak-js keycloak-angular

4. Configure PrimeNG em apps/portal/src/styles.scss:
   @import "primeng/resources/themes/lara-light-blue/theme.css";
   @import "primeng/resources/primeng.css";
   @import "primeicons/primeicons.css";
   @import "primeflex/primeflex.css";

5. Configure o angular.json para incluir os assets do PrimeNG

6. Crie um layout base em apps/portal com:
   - Navbar usando p-menubar
   - Exibição do nome do usuário
   - Botão de logout
   - router-outlet

Commit: "chore(frontend): init nx workspace with primeng and libs"
```

---

## PROMPT 11: Frontend - Autenticação Keycloak

```text
Implemente a autenticação com Keycloak.

1. Em libs/auth/src/lib, crie:

// keycloak.config.ts
export const keycloakConfig = {
  url: 'http://localhost:8180',
  realm: 'unifor',
  clientId: 'portal'
};

// auth.service.ts
@Injectable({ providedIn: 'root' })
export class AuthService {
  private keycloak = inject(KeycloakService);
  
  get isLoggedIn$(): Observable<boolean> { }
  get userProfile$(): Observable<KeycloakProfile | null> { }
  get roles(): string[] { }
  
  isCoordinator(): boolean { return this.roles.includes('COORDENADOR'); }
  isStudent(): boolean { return this.roles.includes('ALUNO'); }
  
  login(): void { }
  logout(): void { }
}

// auth.guard.ts
export const authGuard: CanActivateFn = () => { };

// role.guard.ts  
export const roleGuard = (allowedRoles: string[]): CanActivateFn => { };

// auth.interceptor.ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Adiciona Bearer token ao header Authorization
};

2. Em apps/portal/src/app, configure:

// app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideKeycloakAngular({
      config: keycloakConfig,
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html'
      }
    })
  ]
};

3. Configure rotas com guards:
   - /coordenador -> CoordinatorModule (roleGuard(['COORDENADOR']))
   - /aluno -> StudentModule (roleGuard(['ALUNO']))
   - / -> redirect baseado no role

Commit: "feat(frontend): add keycloak authentication with guards"
```

---

## PROMPT 12: Frontend - Data Access Layer

```text
Crie os serviços de acesso a dados.

1. Em libs/data-access/src/lib, crie os models:

// models/matriz.model.ts
export interface MatrizCurricular {
  id: number;
  disciplina: Disciplina;
  professor: Professor;
  horario: Horario;
  maxAlunos: number;
  vagasDisponiveis: number;
  cursosAutorizados: Curso[];
}

export interface MatrizCurricularRequest {
  disciplinaId: number;
  professorId: number;
  horarioId: number;
  maxAlunos: number;
  cursosAutorizadosIds: number[];
}

// Crie também interfaces para Disciplina, Professor, Horario, Curso, Matricula, AulaDisponivel

2. Crie os serviços usando RxJS adequadamente:

// matriz.service.ts
@Injectable({ providedIn: 'root' })
export class MatrizService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api';
  
  private matrizesSubject = new BehaviorSubject<MatrizCurricular[]>([]);
  matrizes$ = this.matrizesSubject.asObservable();
  
  listar(filtro?: MatrizFiltro): Observable<MatrizCurricular[]> {
    const params = this.buildParams(filtro);
    return this.http.get<MatrizCurricular[]>(`${this.apiUrl}/matriz`, { params }).pipe(
      tap(matrizes => this.matrizesSubject.next(matrizes)),
      catchError(this.handleError)
    );
  }
  
  criar(request: MatrizCurricularRequest): Observable<MatrizCurricular> {
    return this.http.post<MatrizCurricular>(`${this.apiUrl}/matriz`, request).pipe(
      tap(() => this.refresh()),
      catchError(this.handleError)
    );
  }
  
  // atualizar, excluir...
  
  private refresh(): void {
    this.listar().subscribe();
  }
}

// matricula.service.ts
@Injectable({ providedIn: 'root' })
export class MatriculaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/aluno';
  
  private aulasSubject = new BehaviorSubject<AulaDisponivel[]>([]);
  aulasDisponiveis$ = this.aulasSubject.asObservable();
  
  private matriculasSubject = new BehaviorSubject<Matricula[]>([]);
  minhasMatriculas$ = this.matriculasSubject.asObservable();
  
  carregarAulasDisponiveis(): Observable<AulaDisponivel[]> {
    return this.http.get<AulaDisponivel[]>(`${this.apiUrl}/aulas-disponiveis`).pipe(
      tap(aulas => this.aulasSubject.next(aulas))
    );
  }
  
  carregarMinhasMatriculas(): Observable<Matricula[]> {
    return this.http.get<Matricula[]>(`${this.apiUrl}/matriculas`).pipe(
      tap(matriculas => this.matriculasSubject.next(matriculas))
    );
  }
  
  realizarMatricula(matrizId: number): Observable<Matricula> {
    return this.http.post<Matricula>(`${this.apiUrl}/matriculas`, { matrizCurricularId: matrizId }).pipe(
      tap(() => {
        this.carregarAulasDisponiveis().subscribe();
        this.carregarMinhasMatriculas().subscribe();
      })
    );
  }
}

// dados-referencia.service.ts
@Injectable({ providedIn: 'root' })
export class DadosReferenciaService {
  disciplinas$ = this.http.get<Disciplina[]>(`${this.apiUrl}/dados/disciplinas`).pipe(shareReplay(1));
  professores$ = this.http.get<Professor[]>(`${this.apiUrl}/dados/professores`).pipe(shareReplay(1));
  horarios$ = this.http.get<Horario[]>(`${this.apiUrl}/dados/horarios`).pipe(shareReplay(1));
  cursos$ = this.http.get<Curso[]>(`${this.apiUrl}/dados/cursos`).pipe(shareReplay(1));
}

Commit: "feat(frontend): add data access services with rxjs"
```

---

## PROMPT 13: Frontend - Telas do Coordenador

```text
Implemente as telas do coordenador.

1. Crie o módulo/componentes em apps/portal/src/app/features/coordenador:

// coordenador.routes.ts
export const coordenadorRoutes: Routes = [
  { path: '', component: MatrizListComponent },
  { path: 'nova', component: MatrizFormComponent },
  { path: ':id/editar', component: MatrizFormComponent }
];

2. MatrizListComponent:
   - Use p-table para listar matrizes
   - Filtros no topo usando p-dropdown (período), p-multiSelect (cursos)
   - Colunas: Disciplina, Professor, Horário, Vagas, Cursos, Ações
   - Botões de ação: Editar, Excluir
   - Confirmação de exclusão com p-confirmDialog
   - Use async pipe para subscrever aos observables

Template exemplo:
<p-table [value]="matrizes$ | async" [loading]="loading">
  <ng-template pTemplate="header">
    <tr>
      <th>Disciplina</th>
      <th>Professor</th>
      <th>Horário</th>
      <th>Vagas</th>
      <th>Ações</th>
    </tr>
  </ng-template>
  <ng-template pTemplate="body" let-matriz>
    <tr>
      <td>{{ matriz.disciplina.nome }}</td>
      <td>{{ matriz.professor.nome }}</td>
      <td>{{ matriz.horario.diaSemana }} {{ matriz.horario.horaInicio }}</td>
      <td>{{ matriz.vagasDisponiveis }}/{{ matriz.maxAlunos }}</td>
      <td>
        <p-button icon="pi pi-pencil" (click)="editar(matriz)"></p-button>
        <p-button icon="pi pi-trash" severity="danger" (click)="confirmarExclusao(matriz)"></p-button>
      </td>
    </tr>
  </ng-template>
</p-table>

3. MatrizFormComponent:
   - p-dialog ou página separada
   - ReactiveForm com validações
   - Dropdowns para disciplina, professor, horário
   - MultiSelect para cursos autorizados
   - Input number para max alunos
   - Botões Salvar/Cancelar

4. Use combineLatest do RxJS para carregar dados de referência

Commit: "feat(frontend): add coordinator matrix management screens"
```

---

## PROMPT 14: Frontend - Telas do Aluno

```text
Implemente as telas do aluno.

1. Crie o módulo/componentes em apps/portal/src/app/features/aluno:

// aluno.routes.ts
export const alunoRoutes: Routes = [
  { path: '', component: AlunoHomeComponent }
];

2. AlunoHomeComponent com duas seções:

<div class="grid">
  <div class="col-12 md:col-6">
    <p-card header="Aulas Disponíveis">
      <p-table [value]="aulasDisponiveis$ | async">
        <!-- Colunas: Disciplina, Professor, Horário, Vagas, Ação -->
        <ng-template pTemplate="body" let-aula>
          <tr [class.opacity-50]="!aula.podeMatricular">
            <td>{{ aula.disciplina.nome }}</td>
            <td>{{ aula.professor.nome }}</td>
            <td>{{ formatarHorario(aula.horario) }}</td>
            <td>
              <p-tag [severity]="aula.vagasDisponiveis > 0 ? 'success' : 'danger'">
                {{ aula.vagasDisponiveis }}/{{ aula.maxAlunos }}
              </p-tag>
            </td>
            <td>
              <p-button 
                label="Matricular" 
                [disabled]="!aula.podeMatricular"
                [loading]="matriculando === aula.id"
                (click)="matricular(aula)"
                [pTooltip]="getTooltip(aula)">
              </p-button>
            </td>
          </tr>
        </ng-template>
      </p-table>
    </p-card>
  </div>
  
  <div class="col-12 md:col-6">
    <p-card header="Minhas Matrículas">
      <p-table [value]="minhasMatriculas$ | async">
        <ng-template pTemplate="body" let-matricula>
          <tr>
            <td>{{ matricula.disciplina }}</td>
            <td>{{ matricula.professor }}</td>
            <td>{{ matricula.horario }}</td>
          </tr>
        </ng-template>
        <ng-template pTemplate="emptymessage">
          <tr><td colspan="3">Nenhuma matrícula realizada</td></tr>
        </ng-template>
      </p-table>
    </p-card>
  </div>
</div>

3. Lógica do componente:

export class AlunoHomeComponent implements OnInit {
  private matriculaService = inject(MatriculaService);
  private messageService = inject(MessageService);
  
  aulasDisponiveis$ = this.matriculaService.aulasDisponiveis$;
  minhasMatriculas$ = this.matriculaService.minhasMatriculas$;
  matriculando: number | null = null;
  
  ngOnInit(): void {
    this.carregarDados();
  }
  
  carregarDados(): void {
    forkJoin([
      this.matriculaService.carregarAulasDisponiveis(),
      this.matriculaService.carregarMinhasMatriculas()
    ]).subscribe();
  }
  
  matricular(aula: AulaDisponivel): void {
    this.matriculando = aula.id;
    this.matriculaService.realizarMatricula(aula.id).pipe(
      finalize(() => this.matriculando = null)
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Matrícula realizada!' });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.message });
      }
    });
  }
  
  getTooltip(aula: AulaDisponivel): string {
    if (aula.conflitaHorario) return 'Conflito de horário';
    if (aula.vagasDisponiveis === 0) return 'Sem vagas';
    return '';
  }
}

4. Adicione p-toast no app.component para mensagens

Commit: "feat(frontend): add student enrollment screens"
```

---

## PROMPT 15: Documentação Final

```text
Finalize a documentação do projeto.

1. Atualize o README.md completo:

# Sistema de Matriz Curricular - Unifor

Sistema para gerenciamento de matriz curricular e matrículas de alunos.

## Tecnologias

### Backend
- Kotlin 2.0
- Quarkus 3.20+
- PostgreSQL 15
- Keycloak 24

### Frontend
- Angular 18
- Nx 19
- PrimeNG 17
- RxJS

## Pré-requisitos

- Docker e Docker Compose
- Java 21+ (para desenvolvimento)
- Node.js 20+ (para desenvolvimento)

## Executando o Projeto

### 1. Subir infraestrutura
```bash
docker-compose up -d
```

### 2. Backend (desenvolvimento)
```bash
cd backend
./mvnw quarkus:dev
```

### 3. Frontend (desenvolvimento)
```bash
cd frontend
npm install
nx serve portal
```

## URLs de Acesso

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:4200 |
| Backend | http://localhost:8080 |
| Swagger UI | http://localhost:8080/q/swagger-ui |
| Keycloak | http://localhost:8180 |

## Credenciais de Teste

### Coordenadores
- coord1 / coord123 (gerencia CC, SI, ES)
- coord2 / coord123 (gerencia EC, EM, EE)
- coord3 / coord123 (gerencia ADM, DIR, MED)

### Alunos
- aluno1 / aluno123 (Ciência da Computação)
- aluno2 / aluno123 (Sistemas de Informação)
- aluno3 / aluno123 (Engenharia de Software)
- aluno4 / aluno123 (Administração)
- aluno5 / aluno123 (Direito)

## Estrutura do Projeto
[descrever estrutura]

## Decisões Técnicas
[documentar decisões]

2. Crie DECISOES_TECNICAS.md documentando:
   - Por que Panache ao invés de Spring Data
   - Estratégia de controle de concorrência
   - Estrutura do Nx com libs
   - Uso de BehaviorSubject para estado

Commits:
- "docs: complete readme with setup instructions"
- "docs: add technical decisions documentation"
```

---

## Ordem de Execução Recomendada

1. Prompts 1-2: Infraestrutura ✓ Testável
2. Prompts 3-4: Entidades e dados ✓ Testável (backend inicia)
3. Prompts 5-6: Coordenador backend ✓ Testável (Swagger)
4. Prompts 7-8: Aluno backend ✓ Testável (Swagger)
5. Prompt 9: Testes backend ✓ Testável (mvn test)
6. Prompts 10-11: Frontend setup ✓ Testável (login funciona)
7. Prompt 12: Data access ✓ Testável (serviços prontos)
8. Prompts 13-14: Telas ✓ Testável (fluxo completo)
9. Prompt 15: Documentação ✓ Entregável

Cada fase deve ter commits que compilam e podem ser testados individualmente.
