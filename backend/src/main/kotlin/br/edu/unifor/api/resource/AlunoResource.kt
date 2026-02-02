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
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse
import org.eclipse.microprofile.openapi.annotations.responses.APIResponses
import jakarta.validation.Valid

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
    @Operation(summary = "Lista aulas disponíveis para matrícula", description = "Retorna todas as aulas que o aluno pode se matricular, considerando seu curso e conflitos de horário.")
    @APIResponses(
        APIResponse(responseCode = "200", description = "Lista de aulas retornada com sucesso")
    )
    fun listarAulasDisponiveis(): Response {
        val keycloakId = securityIdentity.principal.name
        return Response.ok(matriculaService.listarAulasDisponiveis(keycloakId)).build()
    }

    @GET
    @Path("/matriculas")
    @Operation(summary = "Lista matrículas do aluno", description = "Retorna o histórico de todas as matrículas realizadas pelo aluno autenticado.")
    @APIResponses(
        APIResponse(responseCode = "200", description = "Lista de matrículas retornada com sucesso")
    )
    fun listarMatriculas(): Response {
        val keycloakId = securityIdentity.principal.name
        return Response.ok(matriculaService.listarMinhasMatriculas(keycloakId)).build()
    }

    @POST
    @Path("/matriculas")
    @Operation(summary = "Realiza matrícula em uma aula", description = "Tenta realizar a matrícula do aluno em uma aula específica. Valida pré-requisitos, vagas e conflitos.")
    @APIResponses(
        APIResponse(responseCode = "201", description = "Matrícula realizada com sucesso"),
        APIResponse(responseCode = "400", description = "Violação de regra de negócio (sem vagas, conflito, etc)"),
        APIResponse(responseCode = "409", description = "Aluno já matriculado nesta aula ou em outra no mesmo horário")
    )
    fun realizarMatricula(@Valid request: MatriculaRequest): Response {
        val keycloakId = securityIdentity.principal.name
        val created = matriculaService.realizarMatricula(request, keycloakId)
        return Response.status(Response.Status.CREATED).entity(created).build()
    }
}
