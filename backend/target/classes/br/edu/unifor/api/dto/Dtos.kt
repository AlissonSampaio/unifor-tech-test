package br.edu.unifor.api.dto

import br.edu.unifor.domain.model.DiaSemana
import br.edu.unifor.domain.model.Periodo
import java.time.LocalTime
import jakarta.validation.constraints.*

data class MatrizCurricularRequest(
    @field:NotNull(message = "Disciplina é obrigatória")
    val disciplinaId: Long? = null,
    
    @field:NotNull(message = "Professor é obrigatório")
    val professorId: Long? = null,
    
    @field:NotNull(message = "Horário é obrigatório")
    val horarioId: Long? = null,
    
    @field:Min(value = 1, message = "Máximo de alunos deve ser pelo menos 1")
    val maxAlunos: Int = 30,
    
    @field:NotEmpty(message = "Pelo menos um curso deve ser autorizado")
    val cursosAutorizadosIds: List<Long> = emptyList()
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

data class DisciplinaResponse(val id: Long, val codigo: String, val nome: String, val cargaHoraria: Int)
data class ProfessorResponse(val id: Long, val nome: String, val email: String)
data class HorarioResponse(val id: Long, val diaSemana: DiaSemana, val horaInicio: LocalTime, val horaFim: LocalTime, val periodo: Periodo)
data class CursoResponse(val id: Long, val codigo: String, val nome: String)

data class MatrizFiltroRequest(
    val periodo: Periodo?,
    val cursoId: Long?,
    val horaInicio: LocalTime?,
    val horaFim: LocalTime?
)

data class MatriculaRequest(
    @field:NotNull(message = "ID da aula é obrigatório")
    val matrizCurricularId: Long?
)

data class MatriculaResponse(
    val id: Long,
    val disciplina: String,
    val professor: String,
    val horario: String,
    val dataMatricula: java.time.LocalDateTime
)

data class AulaDisponivelResponse(
    val id: Long,
    val disciplina: DisciplinaResponse,
    val professor: ProfessorResponse,
    val horario: HorarioResponse,
    val maxAlunos: Int,
    val vagasDisponiveis: Int,
    val conflitaHorario: Boolean,
    val jaMatriculado: Boolean,
    val podeMatricular: Boolean
)
