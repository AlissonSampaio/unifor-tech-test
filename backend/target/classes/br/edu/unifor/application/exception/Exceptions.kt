package br.edu.unifor.application.exception

open class BusinessException(message: String, val errorCode: String) : RuntimeException(message)

class NotFoundException(entity: String, id: Any) : BusinessException("$entity not found with ID: $id", "NOT_FOUND")

class ConflictException(message: String) : BusinessException(message, "CONFLICT")

class ForbiddenException(message: String) : BusinessException(message, "FORBIDDEN")
