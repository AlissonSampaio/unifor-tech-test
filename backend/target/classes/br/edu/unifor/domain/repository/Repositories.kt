package br.edu.unifor.domain.repository

import br.edu.unifor.domain.model.*
import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepository
import jakarta.enterprise.context.ApplicationScoped

@ApplicationScoped
class CursoRepository : PanacheRepository<Curso>

@ApplicationScoped
class DisciplinaRepository : PanacheRepository<Disciplina>

@ApplicationScoped
class ProfessorRepository : PanacheRepository<Professor>

@ApplicationScoped
class HorarioRepository : PanacheRepository<Horario> {
    fun findByPeriodo(periodo: Periodo) = list("periodo", periodo)
}

@ApplicationScoped
class CoordenadorRepository : PanacheRepository<Coordenador> {
    fun findByKeycloakId(keycloakId: String) = find("keycloakId", keycloakId).firstResult()
}

@ApplicationScoped
class AlunoRepository : PanacheRepository<Aluno> {
    fun findByKeycloakId(keycloakId: String) = find("keycloakId", keycloakId).firstResult()
}
