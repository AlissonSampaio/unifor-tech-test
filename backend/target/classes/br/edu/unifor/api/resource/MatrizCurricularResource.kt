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
        val filtro = MatrizFiltroRequest(
            periodo = periodo,
            cursoId = cursoId,
            horaInicio = parseTime(horaInicio),
            horaFim = parseTime(horaFim)
        )
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

    private fun parseTime(time: String?): LocalTime? {
        if (time.isNullOrBlank()) return null
        return try {
            LocalTime.parse(time, DateTimeFormatter.ISO_LOCAL_TIME)
        } catch (e: Exception) {
            null
        }
    }
}
