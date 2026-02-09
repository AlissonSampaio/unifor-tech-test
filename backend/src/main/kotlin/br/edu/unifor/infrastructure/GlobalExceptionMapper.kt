package br.edu.unifor.infrastructure

import br.edu.unifor.application.exception.*
import com.fasterxml.jackson.core.JsonProcessingException
import jakarta.validation.ConstraintViolationException
import jakarta.ws.rs.WebApplicationException
import jakarta.ws.rs.NotFoundException as JaxRsNotFoundException
import jakarta.ws.rs.core.Response
import jakarta.ws.rs.ext.ExceptionMapper
import jakarta.ws.rs.ext.Provider
import org.jboss.logging.Logger

@Provider
class GlobalExceptionMapper : ExceptionMapper<Exception> {
    
    private val log = Logger.getLogger(GlobalExceptionMapper::class.java)

    override fun toResponse(exception: Exception): Response {
        log.error("Unhandled exception: ${exception.message}", exception)

        return when (exception) {
            is NotFoundException -> Response.status(Response.Status.NOT_FOUND)
                .entity(ErrorResponse(exception.message ?: "Recurso não encontrado", exception.errorCode))
                .build()
            is ConflictException -> Response.status(Response.Status.CONFLICT)
                .entity(ErrorResponse(exception.message ?: "Conflito de dados", exception.errorCode))
                .build()
            is ForbiddenException -> Response.status(Response.Status.FORBIDDEN)
                .entity(ErrorResponse(exception.message ?: "Acesso negado", exception.errorCode))
                .build()
            is BusinessException -> Response.status(Response.Status.BAD_REQUEST)
                .entity(ErrorResponse(exception.message ?: "Erro de validação", exception.errorCode))
                .build()
            is ConstraintViolationException -> {
                val messages = exception.constraintViolations.joinToString("; ") { it.message }
                Response.status(Response.Status.BAD_REQUEST)
                    .entity(ErrorResponse(messages.ifEmpty { "Dados inválidos" }, "VALIDATION_ERROR"))
                    .build()
            }
            is JsonProcessingException -> Response.status(Response.Status.BAD_REQUEST)
                .entity(ErrorResponse("Dados inválidos na requisição", "INVALID_JSON"))
                .build()
            is WebApplicationException -> exception.response
            is JaxRsNotFoundException -> Response.status(Response.Status.NOT_FOUND)
                .entity(ErrorResponse(exception.message ?: "Recurso não encontrado", "NOT_FOUND"))
                .build()
            else -> Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(ErrorResponse("Ocorreu um erro inesperado. Tente novamente.", "INTERNAL_SERVER_ERROR"))
                .build()
        }
    }

    data class ErrorResponse(val message: String, val errorCode: String)
}
