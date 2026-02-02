package br.edu.unifor.domain.model

import io.quarkus.hibernate.orm.panache.kotlin.PanacheEntity
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "matriz_curricular")
class MatrizCurricular : PanacheEntity() {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "disciplina_id", nullable = false)
    lateinit var disciplina: Disciplina

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "professor_id", nullable = false)
    lateinit var professor: Professor

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "horario_id", nullable = false)
    lateinit var horario: Horario

    @Column(name = "max_alunos", nullable = false)
    var maxAlunos: Int = 0

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "matriz_curso_autorizado",
        joinColumns = [JoinColumn(name = "matriz_id")],
        inverseJoinColumns = [JoinColumn(name = "curso_id")]
    )
    var cursosAutorizados: MutableList<Curso> = mutableListOf()

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coordenador_id", nullable = false)
    lateinit var coordenador: Coordenador

    @Column(nullable = false)
    var deleted: Boolean = false

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
}

@Entity
@Table(
    name = "matricula",
    uniqueConstraints = [UniqueConstraint(columnNames = ["aluno_id", "matriz_curricular_id"])]
)
class Matricula : PanacheEntity() {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aluno_id", nullable = false)
    lateinit var aluno: Aluno

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "matriz_curricular_id", nullable = false)
    lateinit var matrizCurricular: MatrizCurricular

    @Column(name = "data_matricula", nullable = false)
    var dataMatricula: LocalDateTime = LocalDateTime.now()
}
