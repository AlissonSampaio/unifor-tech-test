package br.edu.unifor.domain.repository

import br.edu.unifor.domain.model.*
import io.quarkus.hibernate.orm.panache.kotlin.PanacheRepository
import jakarta.enterprise.context.ApplicationScoped
import java.time.LocalTime

@ApplicationScoped
class MatrizCurricularRepository : PanacheRepository<MatrizCurricular> {
    
    fun findByFilters(
        periodo: Periodo?,
        cursoId: Long?,
        horaInicio: LocalTime?,
        horaFim: LocalTime?,
        maxAlunosMin: Int?,
        maxAlunosMax: Int?,
        coordenadorCursosIds: List<Long>? = null
    ): List<MatrizCurricular> {
        val query = StringBuilder("deleted = false")
        val params = mutableMapOf<String, Any>()

        if (periodo != null) {
            query.append(" AND horario.periodo = :periodo")
            params["periodo"] = periodo
        }
        if (cursoId != null) {
            query.append(" AND :cursoId member of cursosAutorizados")
            params["cursoId"] = cursoId
        }
        if (horaInicio != null) {
            query.append(" AND horario.horaInicio >= :horaInicio")
            params["horaInicio"] = horaInicio
        }
        if (horaFim != null) {
            query.append(" AND horario.horaFim <= :horaFim")
            params["horaFim"] = horaFim
        }
        if (maxAlunosMin != null) {
            query.append(" AND maxAlunos >= :maxAlunosMin")
            params["maxAlunosMin"] = maxAlunosMin
        }
        if (maxAlunosMax != null) {
            query.append(" AND maxAlunos <= :maxAlunosMax")
            params["maxAlunosMax"] = maxAlunosMax
        }
        if (!coordenadorCursosIds.isNullOrEmpty()) {
            query.append(" AND EXISTS (SELECT 1 FROM MatrizCurricular m2 JOIN m2.cursosAutorizados ca WHERE m2.id = id AND ca.id IN :coordCursosIds)")
            params["coordCursosIds"] = coordenadorCursosIds
        }

        return list(query.toString(), params)
    }

    fun existsByDisciplinaAndHorario(disciplinaId: Long, horarioId: Long, excludeId: Long? = null): Boolean {
        return if (excludeId != null) {
            count("disciplina.id = ?1 AND horario.id = ?2 AND deleted = false AND id != ?3", disciplinaId, horarioId, excludeId) > 0
        } else {
            count("disciplina.id = ?1 AND horario.id = ?2 AND deleted = false", disciplinaId, horarioId) > 0
        }
    }

    fun countMatriculados(matrizId: Long): Long {
        return find("from Matricula where matrizCurricular.id = ?1", matrizId).count()
    }

    fun findByCursoId(cursoId: Long): List<MatrizCurricular> {
        return list("from MatrizCurricular m join m.cursosAutorizados c where c.id = ?1 and m.deleted = false", cursoId)
    }
}

@ApplicationScoped
class MatriculaRepository : PanacheRepository<Matricula> {
    
    fun findByAlunoId(alunoId: Long) = list("aluno.id", alunoId)

    fun existsByAlunoAndHorario(alunoId: Long, horarioId: Long): Boolean {
        return count("aluno.id = ?1 AND matrizCurricular.horario.id = ?2", alunoId, horarioId) > 0
    }

    fun existsByAlunoAndMatriz(alunoId: Long, matrizId: Long): Boolean {
        return count("aluno.id = ?1 AND matrizCurricular.id = ?2", alunoId, matrizId) > 0
    }

    fun countByMatrizId(matrizId: Long): Long {
        return count("matrizCurricular.id", matrizId)
    }
}
