package br.edu.unifor

import br.edu.unifor.api.dto.MatrizCurricularRequest
import br.edu.unifor.application.exception.BusinessException
import br.edu.unifor.application.exception.ConflictException
import br.edu.unifor.application.service.MatrizCurricularService
import br.edu.unifor.domain.model.*
import br.edu.unifor.domain.repository.*
import io.quarkus.test.InjectMock
import io.quarkus.test.junit.QuarkusTest
import jakarta.inject.Inject
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.mockito.ArgumentMatchers.anyLong
import org.mockito.ArgumentMatchers.anyString
import org.mockito.Mockito.*
import java.time.LocalTime

@QuarkusTest
class MatrizCurricularServiceTest {

    @Inject
    lateinit var service: MatrizCurricularService

    @InjectMock
    lateinit var repository: MatrizCurricularRepository
    @InjectMock
    lateinit var disciplinaRepository: DisciplinaRepository
    @InjectMock
    lateinit var professorRepository: ProfessorRepository
    @InjectMock
    lateinit var horarioRepository: HorarioRepository
    @InjectMock
    lateinit var cursoRepository: CursoRepository
    @InjectMock
    lateinit var coordenadorRepository: CoordenadorRepository
    @InjectMock
    lateinit var matriculaRepository: MatriculaRepository

    @Test
    fun `deve criar matriz curricular com sucesso`() {
        val coord = Coordenador().apply { id = 1L; nome = "Ana"; cursosGerenciados = mutableListOf(Curso().apply { id = 1L }) }
        val disc = Disciplina().apply { id = 1L; nome = "Algo"; codigo = "A1"; cargaHoraria = 60 }
        val prof = Professor().apply { id = 1L; nome = "Joao" }
        val hor = Horario().apply { id = 1L; diaSemana = DiaSemana.SEGUNDA; horaInicio = LocalTime.NOON; horaFim = LocalTime.NOON.plusHours(2); periodo = Periodo.TARDE }
        val curso = Curso().apply { id = 1L; nome = "CC" }

        `when`(coordenadorRepository.findByKeycloakId(anyString())).thenReturn(coord)
        `when`(disciplinaRepository.findById(anyLong())).thenReturn(disc)
        `when`(professorRepository.findById(anyLong())).thenReturn(prof)
        `when`(horarioRepository.findById(anyLong())).thenReturn(hor)
        `when`(cursoRepository.findById(anyLong())).thenReturn(curso)
        `when`(matriculaRepository.countByMatrizId(anyLong())).thenReturn(0L)

        val request = MatrizCurricularRequest(1L, 1L, 1L, 30, listOf(1L))
        val response = service.criar(request, "coord1")

        assertNotNull(response)
        assertEquals("Algo", response.disciplina.nome)
        verify(repository, times(1)).persist(any(MatrizCurricular::class.java))
    }

    @Test
    fun `deve falhar ao criar matriz para curso nao gerenciado`() {
        val coord = Coordenador().apply { id = 1L; nome = "Ana"; cursosGerenciados = mutableListOf() } // Sem cursos
        val disc = Disciplina().apply { id = 1L }
        val prof = Professor().apply { id = 1L }
        val hor = Horario().apply { id = 1L }
        val curso = Curso().apply { id = 1L; nome = "CC" }

        `when`(coordenadorRepository.findByKeycloakId(anyString())).thenReturn(coord)
        `when`(disciplinaRepository.findById(anyLong())).thenReturn(disc)
        `when`(professorRepository.findById(anyLong())).thenReturn(prof)
        `when`(horarioRepository.findById(anyLong())).thenReturn(hor)
        `when`(cursoRepository.findById(anyLong())).thenReturn(curso)

        val request = MatrizCurricularRequest(1L, 1L, 1L, 30, listOf(1L))
        
        assertThrows(BusinessException::class.java) {
            service.criar(request, "coord1")
        }
    }

    @Test
    fun `nao deve excluir matriz com alunos matriculados`() {
        val matriz = MatrizCurricular().apply { id = 1L; coordenador = Coordenador().apply { id = 1L } }
        val coord = Coordenador().apply { id = 1L }

        `when`(repository.findById(anyLong())).thenReturn(matriz)
        `when`(coordenadorRepository.findByKeycloakId(anyString())).thenReturn(coord)
        `when`(matriculaRepository.countByMatrizId(1L)).thenReturn(5L) // Tem alunos

        assertThrows(ConflictException::class.java) {
            service.excluir(1L, "coord1")
        }
    }

    @Test
    fun `deve falhar ao atualizar matriz de outro coordenador`() {
        val coordCriador = Coordenador().apply { id = 1L }
        val coordEditando = Coordenador().apply { id = 2L }
        val matriz = MatrizCurricular().apply { id = 10L; coordenador = coordCriador }

        `when`(repository.findById(10L)).thenReturn(matriz)
        `when`(coordenadorRepository.findByKeycloakId("coord2")).thenReturn(coordEditando)

        val request = MatrizCurricularRequest(1L, 1L, 1L, 30, listOf(1L))
        assertThrows(BusinessException::class.java) {
            service.atualizar(10L, request, "coord2")
        }
    }

    @Test
    fun `deve fazer soft delete corretamente`() {
        val coord = Coordenador().apply { id = 1L }
        val matriz = MatrizCurricular().apply { id = 1L; coordenador = coord; deleted = false }

        `when`(repository.findById(1L)).thenReturn(matriz)
        `when`(coordenadorRepository.findByKeycloakId(anyString())).thenReturn(coord)
        `when`(matriculaRepository.countByMatrizId(1L)).thenReturn(0L)

        service.excluir(1L, "coord1")

        assertTrue(matriz.deleted)
        verify(repository).persist(matriz)
    }

    @Test
    fun `nao deve permitir remover curso com alunos matriculados na atualizacao`() {
        val curso1 = Curso().apply { id = 1L; nome = "CC" }
        val curso2 = Curso().apply { id = 2L; nome = "SI" }
        val coord = Coordenador().apply { id = 1L }
        val disc = Disciplina().apply { id = 1L }
        val prof = Professor().apply { id = 1L }
        val hor = Horario().apply { id = 1L }
        
        val matriz = MatrizCurricular().apply { 
            id = 1L
            coordenador = coord
            disciplina = disc
            cursosAutorizados = mutableListOf(curso1, curso2)
        }

        `when`(repository.findById(1L)).thenReturn(matriz)
        `when`(coordenadorRepository.findByKeycloakId(anyString())).thenReturn(coord)
        `when`(professorRepository.findById(anyLong())).thenReturn(prof)
        `when`(horarioRepository.findById(anyLong())).thenReturn(hor)
        `when`(cursoRepository.findById(2L)).thenReturn(curso2)
        
        // Mock matriculas para aluno do curso 1
        val aluno = Aluno().apply { curso = curso1 }
        val matricula = Matricula().apply { this.aluno = aluno }
        `when`(matriculaRepository.list(anyString(), anyLong())).thenReturn(listOf(matricula))

        // Request tentando remover curso 1 (deixando só curso 2)
        val request = MatrizCurricularRequest(1L, 1L, 1L, 30, listOf(2L))

        assertThrows(ConflictException::class.java) {
            service.atualizar(1L, request, "coord1")
        }
    }
}
