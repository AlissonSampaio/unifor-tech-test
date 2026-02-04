package br.edu.unifor.api.resource

import br.edu.unifor.api.dto.MatrizCurricularRequest
import br.edu.unifor.api.dto.MatrizFiltroRequest
import br.edu.unifor.application.service.MatrizCurricularService
import br.edu.unifor.domain.model.Periodo
import io.quarkus.security.identity.SecurityIdentity
import jakarta.annotation.security.RolesAllowed
import jakarta.inject.Inject
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.openapi.annotations.Operation
import java.time.LocalTime
import java.time.format.DateTimeFormatter
import jakarta.validation.Valid
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses
import org.eclipse.microprofile.openapi.annotations.media.Content
import org.eclipse.microprofile.openapi.annotations.media.Schema

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
    @Operation(
        summary = "Lista aulas da matriz curricular",
        description = "Retorna todas as aulas da matriz curricular que o coordenador tem permissão para visualizar. Suporta filtros por período, curso e horário."
    )
    @APIResponses(
        APIResponse(responseCode = "200", description = "Lista de aulas retornada com sucesso"),
        APIResponse(responseCode = "403", description = "Coordenador não encontrado ou sem permissão")
    )
    fun listar(
        @Parameter(description = "Filtrar por período (MANHA, TARDE, NOITE)") @QueryParam("periodo") periodo: Periodo?,
        @Parameter(description = "Filtrar por ID do curso") @QueryParam("cursoId") cursoId: Long?,
        @Parameter(description = "Filtrar por hora de início (HH:mm:ss)") @QueryParam("horaInicio") horaInicio: String?,
        @Parameter(description = "Filtrar por hora de fim (HH:mm:ss)") @QueryParam("horaFim") horaFim: String?,
        @Parameter(description = "Filtrar por mínimo de vagas") @QueryParam("maxAlunosMin") maxAlunosMin: Int?,
        @Parameter(description = "Filtrar por máximo de vagas") @QueryParam("maxAlunosMax") maxAlunosMax: Int?
    ): Response {
        val keycloakId = securityIdentity.principal.name
        val filtro = MatrizFiltroRequest(
            periodo = periodo,
            cursoId = cursoId,
            horaInicio = parseTime(horaInicio),
            horaFim = parseTime(horaFim),
            maxAlunosMin = maxAlunosMin,
            maxAlunosMax = maxAlunosMax
        )
        return Response.ok(service.listar(filtro, keycloakId)).build()
    }

    @POST
    @Operation(summary = "Cria nova aula na matriz", description = "Cria um novo registro na matriz curricular vinculado aos cursos autorizados.")
    @APIResponses(
        APIResponse(responseCode = "201", description = "Aula criada com sucesso"),
        APIResponse(responseCode = "400", description = "Dados inválidos"),
        APIResponse(responseCode = "403", description = "Sem permissão para gerenciar um dos cursos")
    )
    fun criar(@Valid request: MatrizCurricularRequest): Response {
        val keycloakId = securityIdentity.principal.name
        val created = service.criar(request, keycloakId)
        return Response.status(Response.Status.CREATED).entity(created).build()
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Atualiza aula existente", description = "Atualiza os dados de uma aula existente. Não é permitido alterar a disciplina.")
    @APIResponses(
        APIResponse(responseCode = "200", description = "Aula atualizada com sucesso"),
        APIResponse(responseCode = "404", description = "Aula não encontrada"),
        APIResponse(responseCode = "400", description = "Dados inválidos ou tentativa de alterar disciplina")
    )
    fun atualizar(@PathParam("id") id: Long, @Valid request: MatrizCurricularRequest): Response {
        val keycloakId = securityIdentity.principal.name
        return Response.ok(service.atualizar(id, request, keycloakId)).build()
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Remove aula (soft delete)", description = "Marca uma aula como excluída. Não é possível excluir aulas com alunos matriculados.")
    @APIResponses(
        APIResponse(responseCode = "204", description = "Aula excluída com sucesso"),
        APIResponse(responseCode = "400", description = "Aula possui matrículas ativas"),
        APIResponse(responseCode = "404", description = "Aula não encontrada")
    )
    fun excluir(@PathParam("id") id: Long): Response {
        val keycloakId = securityIdentity.principal.name
        service.excluir(id, keycloakId)
        return Response.noContent().build()
    }

    private fun parseTime(time: String?): LocalTime? {
        if (time.isNullOrBlank()) return null
        return try {
            LocalTime.parse(time, DateTimeFormatter.ISO_LOCAL_TIME)
        } catch (e: Exception) {
            null
        }
    }
}
