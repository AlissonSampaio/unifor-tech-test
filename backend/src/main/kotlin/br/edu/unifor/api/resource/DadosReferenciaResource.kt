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
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.openapi.annotations.Operation
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses

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
    @Operation(summary = "Lista todas as disciplinas", description = "Retorna o catálogo completo de disciplinas cadastradas.")
    fun listarDisciplinas(): List<DisciplinaResponse> {
        return disciplinaRepository.listAll().map { 
            DisciplinaResponse(it.id!!, it.codigo, it.nome, it.cargaHoraria) 
        }
    }

    @GET
    @Path("/professores")
    @Operation(summary = "Lista todos os professores", description = "Retorna a lista de todos os professores cadastrados no sistema.")
    fun listarProfessores(): List<ProfessorResponse> {
        return professorRepository.listAll().map { 
            ProfessorResponse(it.id!!, it.nome, it.email) 
        }
    }

    @GET
    @Path("/horarios")
    @Operation(summary = "Lista todos os horários", description = "Retorna os horários padrão da universidade (turnos e dias).")
    fun listarHorarios(): List<HorarioResponse> {
        return horarioRepository.listAll().map { 
            HorarioResponse(it.id!!, it.diaSemana, it.horaInicio, it.horaFim, it.periodo) 
        }
    }

    @GET
    @Path("/cursos")
    @RolesAllowed("COORDENADOR")
    @Operation(summary = "Lista cursos gerenciados", description = "Retorna apenas os cursos que o coordenador autenticado tem permissão para gerenciar.")
    @APIResponses(
        APIResponse(responseCode = "200", description = "Cursos retornados com sucesso"),
        APIResponse(responseCode = "403", description = "Acesso negado")
    )
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
