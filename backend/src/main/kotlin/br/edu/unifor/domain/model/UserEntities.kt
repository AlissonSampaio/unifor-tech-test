package br.edu.unifor.domain.model

import io.quarkus.hibernate.orm.panache.kotlin.PanacheEntity
import jakarta.persistence.*

@Entity
@Table(name = "coordenador")
class Coordenador : PanacheEntity() {
    @Column(length = 100, nullable = false)
    lateinit var nome: String

    @Column(unique = true, nullable = false)
    lateinit var email: String

    @Column(name = "keycloak_id", unique = true, nullable = false)
    lateinit var keycloakId: String

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "coordenador_curso",
        joinColumns = [JoinColumn(name = "coordenador_id")],
        inverseJoinColumns = [JoinColumn(name = "curso_id")]
    )
    var cursosGerenciados: MutableList<Curso> = mutableListOf()
}

@Entity
@Table(name = "aluno")
class Aluno : PanacheEntity() {
    @Column(unique = true, nullable = false)
    lateinit var matricula: String

    @Column(length = 100, nullable = false)
    lateinit var nome: String

    @Column(unique = true, nullable = false)
    lateinit var email: String

    @Column(name = "keycloak_id", unique = true, nullable = false)
    lateinit var keycloakId: String

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "curso_id", nullable = false)
    lateinit var curso: Curso
}
