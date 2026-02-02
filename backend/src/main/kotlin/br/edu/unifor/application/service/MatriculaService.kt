package br.edu.unifor.application.service

import br.edu.unifor.api.dto.*
import br.edu.unifor.application.exception.*
import br.edu.unifor.domain.model.*
import br.edu.unifor.domain.repository.*
import jakarta.enterprise.context.ApplicationScoped
import jakarta.inject.Inject
import jakarta.persistence.EntityManager
import jakarta.persistence.LockModeType
import jakarta.transaction.Transactional
import java.time.LocalDateTime

@ApplicationScoped
class MatriculaService {

    @Inject
    lateinit var em: EntityManager
    @Inject
    lateinit var matriculaRepository: MatriculaRepository
    @Inject
    lateinit var alunoRepository: AlunoRepository
    @Inject
    lateinit var matrizRepository: MatrizCurricularRepository

    @Transactional
    fun realizarMatricula(request: MatriculaRequest, keycloakId: String): MatriculaResponse {
        val aluno = alunoRepository.findByKeycloakId(keycloakId)
            ?: throw NotFoundException("Aluno", keycloakId)

        // Lock pessimista na matriz para evitar race condition de vagas
        val matriz = em.find(
            MatrizCurricular::class.java,
            request.matrizCurricularId,
            LockModeType.PESSIMISTIC_WRITE
        ) ?: throw NotFoundException("MatrizCurricular", request.matrizCurricularId)

        if (matriz.deleted) {
            throw BusinessException("Aula não disponível", "AULA_INDISPONIVEL")
        }

        if (matriz.cursosAutorizados.none { it.id == aluno.curso.id }) {
            throw BusinessException("Aula não autorizada para seu curso", "CURSO_NAO_AUTORIZADO")
        }

        val matriculados = matriculaRepository.countByMatrizId(matriz.id!!)
        if (matriculados >= matriz.maxAlunos) {
            throw ConflictException("Não há vagas disponíveis")
        }

        if (matriculaRepository.existsByAlunoAndHorario(aluno.id!!, matriz.horario.id!!)) {
            throw ConflictException("Conflito de horário com outra matrícula")
        }

        if (matriculaRepository.existsByAlunoAndMatriz(aluno.id!!, matriz.id!!)) {
            throw ConflictException("Você já está matriculado nesta aula")
        }

        val matricula = Matricula().apply {
            this.aluno = aluno
            this.matrizCurricular = matriz
            this.dataMatricula = LocalDateTime.now()
        }

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
                vagasDisponiveis = vagasDisponiveis.coerceAtLeast(0),
                conflitaHorario = conflitaHorario,
                jaMatriculado = jaMatriculado,
                podeMatricular = vagasDisponiveis > 0 && !conflitaHorario && !jaMatriculado
            )
        }
    }

    private fun toResponse(m: Matricula) = MatriculaResponse(
        id = m.id!!,
        disciplina = m.matrizCurricular.disciplina.nome,
        professor = m.matrizCurricular.professor.nome,
        horario = "${m.matrizCurricular.horario.diaSemana} ${m.matrizCurricular.horario.horaInicio} - ${m.matrizCurricular.horario.horaFim}",
        dataMatricula = m.dataMatricula
    )

    private fun toDisciplinaResponse(d: Disciplina) = DisciplinaResponse(d.id!!, d.codigo, d.nome, d.cargaHoraria)
    private fun toProfessorResponse(p: Professor) = ProfessorResponse(p.id!!, p.nome, p.email)
    private fun toHorarioResponse(h: Horario) = HorarioResponse(h.id!!, h.diaSemana, h.horaInicio, h.horaFim, h.periodo)
}
