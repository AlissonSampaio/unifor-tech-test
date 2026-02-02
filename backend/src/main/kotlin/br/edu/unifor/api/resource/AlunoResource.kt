package br.edu.unifor.api.resource

import br.edu.unifor.api.dto.MatriculaRequest
import br.edu.unifor.application.service.MatriculaService
import io.quarkus.security.identity.SecurityIdentity
import jakarta.annotation.security.RolesAllowed
import jakarta.inject.Inject
import jakarta.ws.rs.*
import jakarta.ws.rs.core.MediaType
import jakarta.ws.rs.core.Response
import org.eclipse.microprofile.openapi.annotations.Operation

@Path("/api/aluno")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@RolesAllowed("ALUNO")
class AlunoResource {

    @Inject
    lateinit var matriculaService: MatriculaService

    @Inject
    lateinit var securityIdentity: SecurityIdentity

    @GET
    @Path("/aulas-disponiveis")
    @Operation(summary = "Lista aulas disponíveis para matrícula")
    fun listarAulasDisponiveis(): Response {
        val keycloakId = securityIdentity.principal.name
        return Response.ok(matriculaService.listarAulasDisponiveis(keycloakId)).build()
    }

    @GET
    @Path("/matriculas")
    @Operation(summary = "Lista matrículas do aluno")
    fun listarMatriculas(): Response {
        val keycloakId = securityIdentity.principal.name
        return Response.ok(matriculaService.listarMinhasMatriculas(keycloakId)).build()
    }

    @POST
    @Path("/matriculas")
    @Operation(summary = "Realiza matrícula em uma aula")
    fun realizarMatricula(request: MatriculaRequest): Response {
        val keycloakId = securityIdentity.principal.name
        val created = matriculaService.realizarMatricula(request, keycloakId)
        return Response.status(Response.Status.CREATED).entity(created).build()
    }
}
