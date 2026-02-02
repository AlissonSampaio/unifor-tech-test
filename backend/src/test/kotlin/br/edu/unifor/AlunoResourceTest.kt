package br.edu.unifor

import br.edu.unifor.api.resource.AlunoResource
import io.quarkus.test.common.http.TestHTTPEndpoint
import io.quarkus.test.junit.QuarkusTest
import io.quarkus.test.security.TestSecurity
import io.restassured.RestAssured.given
import io.restassured.http.ContentType
import org.hamcrest.Matchers.*
import org.junit.jupiter.api.Test

@QuarkusTest
@TestHTTPEndpoint(AlunoResource::class)
class AlunoResourceTest {

    @Test
    fun `deve retornar 401 sem autenticacao`() {
        given()
            .`when`().get("/aulas-disponiveis")
            .then()
            .statusCode(401)
    }

    @Test
    @TestSecurity(user = "aluno1", roles = ["ALUNO"])
    fun `deve listar aulas disponiveis como aluno`() {
        given()
            .`when`().get("/aulas-disponiveis")
            .then()
            .statusCode(200)
    }

    @Test
    @TestSecurity(user = "coord1", roles = ["COORDENADOR"])
    fun `deve retornar 403 para coordenador acessando endpoint de aluno`() {
        given()
            .`when`().get("/aulas-disponiveis")
            .then()
            .statusCode(403)
    }

    @Test
    @TestSecurity(user = "aluno1", roles = ["ALUNO"])
    fun `deve retornar 400 para matricula com body vazio`() {
        given()
            .contentType(ContentType.JSON)
            .body("{}")
            .`when`().post("/matriculas")
            .then()
            .statusCode(400)
    }
}
