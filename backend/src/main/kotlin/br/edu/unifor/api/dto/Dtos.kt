package br.edu.unifor.api.dto

import br.edu.unifor.domain.model.DiaSemana
import br.edu.unifor.domain.model.Periodo
import java.time.LocalTime
import jakarta.validation.constraints.*
import org.eclipse.microprofile.openapi.annotations.media.Schema

data class MatrizCurricularRequest(
    @field:NotNull(message = "Disciplina é obrigatória")
    @Schema(description = "ID da disciplina pré-cadastrada", example = "1")
    val disciplinaId: Long? = null,
    
    @field:NotNull(message = "Professor é obrigatório")
    @Schema(description = "ID do professor pré-cadastrado", example = "1")
    val professorId: Long? = null,
    
    @field:NotNull(message = "Horário é obrigatório")
    @Schema(description = "ID do horário pré-cadastrado", example = "1")
    val horarioId: Long? = null,
    
    @field:Min(value = 1, message = "Máximo de alunos deve ser pelo menos 1")
    @field:Max(value = 1000, message = "Máximo de alunos não pode exceder 1000")
    @Schema(description = "Número máximo de alunos permitidos", example = "30")
    val maxAlunos: Int = 30,
    
    @field:NotEmpty(message = "Pelo menos um curso deve ser autorizado")
    @Schema(description = "Lista de IDs dos cursos autorizados", example = "[1, 2, 3]")
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
    val horaFim: LocalTime?,
    val maxAlunosMin: Int?,
    val maxAlunosMax: Int?
)

data class MatriculaRequest(
    @field:NotNull(message = "ID da aula é obrigatório")
    @Schema(description = "ID da aula na matriz curricular", example = "1")
    val matrizCurricularId: Long? = null
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
