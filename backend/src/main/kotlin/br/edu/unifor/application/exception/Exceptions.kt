package br.edu.unifor.application.exception

open class BusinessException(message: String, val errorCode: String) : RuntimeException(message)

class NotFoundException(entity: String, id: Any) : BusinessException("$entity com ID $id não encontrado(a)", "NOT_FOUND")

class ConflictException(message: String) : BusinessException(message, "CONFLICT")

class ForbiddenException(message: String) : BusinessException(message, "FORBIDDEN")
