package br.edu.unifor.infrastructure

import br.edu.unifor.application.exception.*
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
                .entity(ErrorResponse(exception.message ?: "Resource not found", exception.errorCode))
                .build()
            is ConflictException -> Response.status(Response.Status.CONFLICT)
                .entity(ErrorResponse(exception.message ?: "Conflict", exception.errorCode))
                .build()
            is ForbiddenException -> Response.status(Response.Status.FORBIDDEN)
                .entity(ErrorResponse(exception.message ?: "Forbidden", exception.errorCode))
                .build()
            is BusinessException -> Response.status(Response.Status.BAD_REQUEST)
                .entity(ErrorResponse(exception.message ?: "Business error", exception.errorCode))
                .build()
            is WebApplicationException -> exception.response
            is JaxRsNotFoundException -> Response.status(Response.Status.NOT_FOUND)
                .entity(ErrorResponse(exception.message ?: "Not Found", "NOT_FOUND"))
                .build()
            else -> Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(ErrorResponse("An unexpected error occurred", "INTERNAL_SERVER_ERROR"))
                .build()
        }
    }

    data class ErrorResponse(val message: String, val errorCode: String)
}
