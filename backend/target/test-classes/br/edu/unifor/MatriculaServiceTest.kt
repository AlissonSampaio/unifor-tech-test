package br.edu.unifor

import br.edu.unifor.api.dto.MatriculaRequest
import br.edu.unifor.application.exception.ConflictException
import br.edu.unifor.application.service.MatriculaService
import br.edu.unifor.domain.model.*
import br.edu.unifor.domain.repository.*
import io.quarkus.test.InjectMock
import io.quarkus.test.junit.QuarkusTest
import jakarta.inject.Inject
import jakarta.persistence.EntityManager
import jakarta.persistence.LockModeType
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyLong
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito.*
import java.time.LocalTime

@QuarkusTest
class MatriculaServiceTest {

    @Inject
    lateinit var service: MatriculaService

    @InjectMock
    lateinit var em: EntityManager
    @InjectMock
    lateinit var matriculaRepository: MatriculaRepository
    @InjectMock
    lateinit var alunoRepository: AlunoRepository
    @InjectMock
    lateinit var matrizRepository: MatrizCurricularRepository

    @Test
    fun `deve realizar matricula com sucesso`() {
        val curso = Curso().apply { id = 1L; nome = "CC" }
        val aluno = Aluno().apply { id = 1L; this.curso = curso }
        val hor = Horario().apply { id = 1L; diaSemana = DiaSemana.SEGUNDA; horaInicio = LocalTime.NOON; horaFim = LocalTime.NOON.plusHours(2) }
        val disc = Disciplina().apply { nome = "Calculo" }
        val prof = Professor().apply { nome = "Silva" }
        val matriz = MatrizCurricular().apply { 
            id = 1L; maxAlunos = 10; cursosAutorizados = mutableListOf(curso)
            this.horario = hor; this.disciplina = disc; this.professor = prof
        }

        `when`(alunoRepository.findByKeycloakId(anyString())).thenReturn(aluno)
        `when`(em.find(eq(MatrizCurricular::class.java), anyLong(), eq(LockModeType.PESSIMISTIC_WRITE))).thenReturn(matriz)
        `when`(matriculaRepository.countByMatrizId(anyLong())).thenReturn(0L)
        `when`(matriculaRepository.existsByAlunoAndHorario(anyLong(), anyLong())).thenReturn(false)
        `when`(matriculaRepository.existsByAlunoAndMatriz(anyLong(), anyLong())).thenReturn(false)

        val response = service.realizarMatricula(MatriculaRequest(1L), "aluno1")

        assertNotNull(response)
        assertEquals("Calculo", response.disciplina)
        verify(matriculaRepository, times(1)).persist(any(Matricula::class.java))
    }

    @Test
    fun `deve falhar matricula quando nao ha vagas`() {
        val curso = Curso().apply { id = 1L }
        val aluno = Aluno().apply { id = 1L; this.curso = curso }
        val matriz = MatrizCurricular().apply { id = 1L; maxAlunos = 5; cursosAutorizados = mutableListOf(curso) }

        `when`(alunoRepository.findByKeycloakId(anyString())).thenReturn(aluno)
        `when`(em.find(eq(MatrizCurricular::class.java), anyLong(), eq(LockModeType.PESSIMISTIC_WRITE))).thenReturn(matriz)
        `when`(matriculaRepository.countByMatrizId(1L)).thenReturn(5L) // Estampado

        assertThrows(ConflictException::class.java) {
            service.realizarMatricula(MatriculaRequest(1L), "aluno1")
        }
    }

    @Test
    fun `deve falhar matricula com conflito de horario`() {
        val curso = Curso().apply { id = 1L }
        val aluno = Aluno().apply { id = 1L; this.curso = curso }
        val hor = Horario().apply { id = 1L }
        val matriz = MatrizCurricular().apply { id = 1L; maxAlunos = 10; cursosAutorizados = mutableListOf(curso); this.horario = hor }

        `when`(alunoRepository.findByKeycloakId(anyString())).thenReturn(aluno)
        `when`(em.find(eq(MatrizCurricular::class.java), anyLong(), eq(LockModeType.PESSIMISTIC_WRITE))).thenReturn(matriz)
        `when`(matriculaRepository.countByMatrizId(1L)).thenReturn(0L)
        `when`(matriculaRepository.existsByAlunoAndHorario(1L, 1L)).thenReturn(true) // Conflito

        assertThrows(ConflictException::class.java) {
            service.realizarMatricula(MatriculaRequest(1L), "aluno1")
        }
    }

    @Test
    fun `deve falhar matricula em aula de curso nao autorizado`() {
        val cursoAluno = Curso().apply { id = 1L }
        val cursoOutro = Curso().apply { id = 2L }
        val aluno = Aluno().apply { id = 1L; this.curso = cursoAluno }
        val matriz = MatrizCurricular().apply { id = 1L; maxAlunos = 10; cursosAutorizados = mutableListOf(cursoOutro) }

        `when`(alunoRepository.findByKeycloakId(anyString())).thenReturn(aluno)
        `when`(em.find(eq(MatrizCurricular::class.java), anyLong(), eq(LockModeType.PESSIMISTIC_WRITE))).thenReturn(matriz)

        assertThrows(br.edu.unifor.application.exception.BusinessException::class.java) {
            service.realizarMatricula(MatriculaRequest(1L), "aluno1")
        }
    }

    @Test
    fun `deve falhar matricula em aula deletada`() {
        val curso = Curso().apply { id = 1L }
        val aluno = Aluno().apply { id = 1L; this.curso = curso }
        val matriz = MatrizCurricular().apply { id = 1L; deleted = true }

        `when`(alunoRepository.findByKeycloakId(anyString())).thenReturn(aluno)
        `when`(em.find(eq(MatrizCurricular::class.java), anyLong(), eq(LockModeType.PESSIMISTIC_WRITE))).thenReturn(matriz)

        assertThrows(br.edu.unifor.application.exception.BusinessException::class.java) {
            service.realizarMatricula(MatriculaRequest(1L), "aluno1")
        }
    }

    @Test
    fun `deve falhar ao matricular novamente na mesma aula`() {
        val curso = Curso().apply { id = 1L }
        val aluno = Aluno().apply { id = 1L; this.curso = curso }
        val matriz = MatrizCurricular().apply { id = 1L; maxAlunos = 10; cursosAutorizados = mutableListOf(curso); horario = Horario().apply { id = 1L } }

        `when`(alunoRepository.findByKeycloakId(anyString())).thenReturn(aluno)
        `when`(em.find(eq(MatrizCurricular::class.java), anyLong(), eq(LockModeType.PESSIMISTIC_WRITE))).thenReturn(matriz)
        `when`(matriculaRepository.countByMatrizId(1L)).thenReturn(0L)
        `when`(matriculaRepository.existsByAlunoAndHorario(anyLong(), anyLong())).thenReturn(false)
        `when`(matriculaRepository.existsByAlunoAndMatriz(1L, 1L)).thenReturn(true) // Já matriculado

        assertThrows(ConflictException::class.java) {
            service.realizarMatricula(MatriculaRequest(1L), "aluno1")
        }
    }

    @Test
    fun `deve listar apenas aulas do curso do aluno`() {
        val curso = Curso().apply { id = 1L }
        val aluno = Aluno().apply { id = 1L; this.curso = curso }
        val matriz = MatrizCurricular().apply { 
            id = 1L; disciplina = Disciplina().apply { id = 1L }; professor = Professor().apply { id = 1L }; 
            horario = Horario().apply { id = 1L; diaSemana = DiaSemana.SEGUNDA; horaInicio = LocalTime.NOON; horaFim = LocalTime.NOON.plusHours(2); periodo = Periodo.TARDE };
            maxAlunos = 10 
        }

        `when`(alunoRepository.findByKeycloakId(anyString())).thenReturn(aluno)
        `when`(matrizRepository.findByCursoId(1L)).thenReturn(listOf(matriz))
        `when`(matriculaRepository.findByAlunoId(1L)).thenReturn(emptyList())

        val aulas = service.listarAulasDisponiveis("aluno1")

        assertEquals(1, aulas.size)
        assertEquals(1L, aulas[0].id)
    }
}
