package br.edu.unifor.domain.model

import io.quarkus.hibernate.orm.panache.kotlin.PanacheEntity
import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Table

@Entity
@Table(name = "curso")
class Curso : PanacheEntity() {
    @Column(unique = true, length = 10, nullable = false)
    lateinit var codigo: String

    @Column(length = 100, nullable = false)
    lateinit var nome: String
}

@Entity
@Table(name = "disciplina")
class Disciplina : PanacheEntity() {
    @Column(unique = true, length = 10, nullable = false)
    lateinit var codigo: String

    @Column(length = 100, nullable = false)
    lateinit var nome: String

    @Column(name = "carga_horaria", nullable = false)
    var cargaHoraria: Int = 0
}

@Entity
@Table(name = "professor")
class Professor : PanacheEntity() {
    @Column(length = 100, nullable = false)
    lateinit var nome: String

    @Column(unique = true, nullable = false)
    lateinit var email: String
}

@Entity
@Table(name = "horario")
class Horario : PanacheEntity() {
    @Column(name = "dia_semana", nullable = false)
    lateinit var diaSemana: DiaSemana

    @Column(name = "hora_inicio", nullable = false)
    lateinit var horaInicio: java.time.LocalTime

    @Column(name = "hora_fim", nullable = false)
    lateinit var horaFim: java.time.LocalTime

    @Column(nullable = false)
    lateinit var periodo: Periodo
}
