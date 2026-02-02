package br.edu.unifor.api.resource

import br.edu.unifor.api.dto.*
import br.edu.unifor.application.exception.ForbiddenException
import br.edu.unifor.domain.repository.*
import io.quarkus.security.Authenticated
import io.quarkus.security.identity.SecurityIdentity
import jakarta.annotation.security.RolesAllowed
import jakarta.inject.Inject
import jakarta.ws.rs.GET
import jakarta.ws.rs.Path
import jakarta.ws.rs.Produces
import jakarta.ws.rs.core.MediaType

@Path("/api/dados")
@Produces(MediaType.APPLICATION_JSON)
@Authenticated
class DadosReferenciaResource {

    @Inject
    lateinit var disciplinaRepository: DisciplinaRepository
    @Inject
    lateinit var professorRepository: ProfessorRepository
    @Inject
    lateinit var horarioRepository: HorarioRepository
    @Inject
    lateinit var cursoRepository: CursoRepository
    @Inject
    lateinit var coordenadorRepository: CoordenadorRepository
    @Inject
    lateinit var securityIdentity: SecurityIdentity

    @GET
    @Path("/disciplinas")
    fun listarDisciplinas(): List<DisciplinaResponse> {
        return disciplinaRepository.listAll().map { 
            DisciplinaResponse(it.id!!, it.codigo, it.nome, it.cargaHoraria) 
        }
    }

    @GET
    @Path("/professores")
    fun listarProfessores(): List<ProfessorResponse> {
        return professorRepository.listAll().map { 
            ProfessorResponse(it.id!!, it.nome, it.email) 
        }
    }

    @GET
    @Path("/horarios")
    fun listarHorarios(): List<HorarioResponse> {
        return horarioRepository.listAll().map { 
            HorarioResponse(it.id!!, it.diaSemana, it.horaInicio, it.horaFim, it.periodo) 
        }
    }

    @GET
    @Path("/cursos")
    @RolesAllowed("COORDENADOR")
    fun listarCursos(): List<CursoResponse> {
        val keycloakId = securityIdentity.principal.name
        val coordenador = coordenadorRepository.findByKeycloakId(keycloakId)
            ?: throw ForbiddenException("Coordenador não encontrado")
        
        return coordenador.cursosGerenciados.map { 
            CursoResponse(it.id!!, it.codigo, it.nome) 
        }
    }

    @GET
    @Path("/todos-cursos")
    fun listarTodosCursos(): List<CursoResponse> {
        return cursoRepository.listAll().map { 
            CursoResponse(it.id!!, it.codigo, it.nome) 
        }
    }
}
