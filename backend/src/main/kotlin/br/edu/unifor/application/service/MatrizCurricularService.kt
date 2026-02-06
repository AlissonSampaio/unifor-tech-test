package br.edu.unifor.application.service

import br.edu.unifor.api.dto.*
import br.edu.unifor.application.exception.*
import br.edu.unifor.domain.model.*
import br.edu.unifor.domain.repository.*
import jakarta.enterprise.context.ApplicationScoped
import jakarta.inject.Inject
import jakarta.transaction.Transactional
import java.time.LocalDateTime

@ApplicationScoped
class MatrizCurricularService {

    @Inject lateinit var repository: MatrizCurricularRepository
    @Inject lateinit var disciplinaRepository: DisciplinaRepository
    @Inject lateinit var professorRepository: ProfessorRepository
    @Inject lateinit var horarioRepository: HorarioRepository
    @Inject lateinit var cursoRepository: CursoRepository
    @Inject lateinit var coordenadorRepository: CoordenadorRepository
    @Inject lateinit var matriculaRepository: MatriculaRepository

    @Transactional
    fun criar(request: MatrizCurricularRequest, keycloakId: String): MatrizCurricularResponse {
        val coordenador =
                coordenadorRepository.findByKeycloakId(keycloakId)
                        ?: throw ForbiddenException(
                                "Coordenador não encontrado para o usuário logado"
                        )

        val discId = request.disciplinaId!!
        val disciplina =
                disciplinaRepository.findById(discId)
                        ?: throw NotFoundException("Disciplina", discId)

        val profId = request.professorId!!
        val professor =
                professorRepository.findById(profId) ?: throw NotFoundException("Professor", profId)

        val horId = request.horarioId!!
        val horario = horarioRepository.findById(horId) ?: throw NotFoundException("Horário", horId)

        if (repository.existsByDisciplinaAndHorario(disciplina.id!!, horario.id!!)) {
            throw ConflictException("Já existe uma aula desta disciplina neste horário")
        }

        val cursos =
                request.cursosAutorizadosIds.map { cursoId ->
                    val curso =
                            cursoRepository.findById(cursoId)
                                    ?: throw NotFoundException("Curso", cursoId)
                    if (coordenador.cursosGerenciados.none { it.id == curso.id }) {
                        throw ForbiddenException("Você não gerencia o curso ${curso.nome}")
                    }
                    curso
                }

        val matriz =
                MatrizCurricular().apply {
                    this.disciplina = disciplina
                    this.professor = professor
                    this.horario = horario
                    this.maxAlunos = request.maxAlunos
                    this.cursosAutorizados = cursos.toMutableList()
                    this.coordenador = coordenador
                    this.createdAt = LocalDateTime.now()
                    this.deleted = false
                }

        repository.persist(matriz)
        repository.flush()
        return toResponse(matriz, 0L)
    }

    fun listar(filtro: MatrizFiltroRequest, keycloakId: String): List<MatrizCurricularResponse> {
        val coordenador =
                coordenadorRepository.findByKeycloakId(keycloakId)
                        ?: throw ForbiddenException("Coordenador não encontrado")

        val cursosIds = coordenador.cursosGerenciados.map { it.id!! }

        return repository
                .findByFilters(
                        filtro.periodo,
                        filtro.cursoId,
                        filtro.horaInicio,
                        filtro.horaFim,
                        filtro.maxAlunosMin,
                        filtro.maxAlunosMax,
                        cursosIds
                )
                .map { toResponse(it) }
    }

    @Transactional
    fun atualizar(
            id: Long,
            request: MatrizCurricularRequest,
            keycloakId: String
    ): MatrizCurricularResponse {
        val matriz = repository.findById(id) ?: throw NotFoundException("MatrizCurricular", id)

        val coordenador =
                coordenadorRepository.findByKeycloakId(keycloakId)
                        ?: throw ForbiddenException("Coordenador não encontrado")

        if (matriz.coordenador.id != coordenador.id) {
            throw ForbiddenException("Apenas o coordenador que criou a aula pode editá-la")
        }

        if (matriz.disciplina.id != request.disciplinaId) {
            throw BusinessException(
                    "Não é permitido alterar a disciplina de uma aula existente",
                    "DISCIPLINA_UNMODIFIABLE"
            )
        }

        val profId = request.professorId!!
        val professor =
                professorRepository.findById(profId) ?: throw NotFoundException("Professor", profId)

        val horId = request.horarioId!!
        val horario = horarioRepository.findById(horId) ?: throw NotFoundException("Horário", horId)

        if (matriz.horario.id != horario.id &&
                        repository.existsByDisciplinaAndHorario(
                                matriz.disciplina.id!!,
                                horario.id!!,
                                id
                        )
        ) {
            throw ConflictException("Já existe uma aula desta disciplina neste horário")
        }

        val novosCursos =
                request.cursosAutorizadosIds.map { cursoId ->
                    cursoRepository.findById(cursoId) ?: throw NotFoundException("Curso", cursoId)
                }

        val cursosRemovidos =
                matriz.cursosAutorizados.filter { existing ->
                    novosCursos.none { it.id == existing.id }
                }
        if (cursosRemovidos.isNotEmpty()) {
            val matriculas = matriculaRepository.list("matrizCurricular.id", id)
            for (cursoRemovido in cursosRemovidos) {
                if (matriculas.any { it.aluno.curso.id == cursoRemovido.id }) {
                    throw ConflictException(
                            "Não é possível remover o curso ${cursoRemovido.nome} pois há alunos matriculados"
                    )
                }
            }
        }

        val matriculados = matriculaRepository.countByMatrizId(id)
        if (request.maxAlunos < matriculados) {
            throw ConflictException(
                    "Não é possível reduzir para ${request.maxAlunos} vaga(s). " +
                            "Existem $matriculados aluno(s) matriculado(s). Desmatricule os excedentes primeiro."
            )
        }

        matriz.professor = professor
        matriz.horario = horario
        matriz.maxAlunos = request.maxAlunos
        matriz.cursosAutorizados = novosCursos.toMutableList()

        repository.persist(matriz)
        repository.flush()
        return toResponse(matriz)
    }

    @Transactional
    fun excluir(id: Long, keycloakId: String) {
        val matriz = repository.findById(id) ?: throw NotFoundException("MatrizCurricular", id)

        val coordenador =
                coordenadorRepository.findByKeycloakId(keycloakId)
                        ?: throw ForbiddenException("Coordenador não encontrado")

        if (matriz.coordenador.id != coordenador.id) {
            throw ForbiddenException("Apenas o coordenador que criou a aula pode excluí-la")
        }

        if (matriculaRepository.countByMatrizId(id) > 0) {
            throw ConflictException("Não é possível excluir uma aula que possui matrículas")
        }

        matriz.deleted = true
        repository.persist(matriz)
    }

    private fun toResponse(
            m: MatrizCurricular,
            matriculadosCount: Long? = null
    ): MatrizCurricularResponse {
        val matriculados = matriculadosCount ?: matriculaRepository.countByMatrizId(m.id!!)
        return MatrizCurricularResponse(
                id = m.id!!,
                disciplina =
                        DisciplinaResponse(
                                m.disciplina.id!!,
                                m.disciplina.codigo,
                                m.disciplina.nome,
                                m.disciplina.cargaHoraria
                        ),
                professor =
                        ProfessorResponse(m.professor.id!!, m.professor.nome, m.professor.email),
                horario =
                        HorarioResponse(
                                m.horario.id!!,
                                m.horario.diaSemana,
                                m.horario.horaInicio,
                                m.horario.horaFim,
                                m.horario.periodo
                        ),
                maxAlunos = m.maxAlunos,
                vagasDisponiveis = (m.maxAlunos - matriculados.toInt()).coerceAtLeast(0),
                cursosAutorizados =
                        m.cursosAutorizados.map { CursoResponse(it.id!!, it.codigo, it.nome) }
        )
    }
}
