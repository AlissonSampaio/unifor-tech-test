package br.edu.unifor

import br.edu.unifor.api.resource.MatrizCurricularResource
import io.quarkus.test.common.http.TestHTTPEndpoint
import io.quarkus.test.junit.QuarkusTest
import io.quarkus.test.security.TestSecurity
import io.restassured.RestAssured.given
import io.restassured.http.ContentType
import org.hamcrest.Matchers.*
import org.junit.jupiter.api.Test

@QuarkusTest
@TestHTTPEndpoint(MatrizCurricularResource::class)
class MatrizCurricularResourceTest {

    @Test
    fun `deve retornar 401 sem autenticacao`() {
        given()
            .`when`().get()
            .then()
            .statusCode(401)
    }

    @Test
    @TestSecurity(user = "coord1", roles = ["COORDENADOR"])
    fun `deve listar matrizes como coordenador`() {
        given()
            .`when`().get()
            .then()
            .statusCode(200)
            .body("$", hasSize(greaterThanOrEqualTo(0)))
    }

    @Test
    @TestSecurity(user = "aluno1", roles = ["ALUNO"])
    fun `deve retornar 403 para aluno acessando endpoint de coordenador`() {
        given()
            .`when`().get()
            .then()
            .statusCode(403)
    }

    @Test
    @TestSecurity(user = "coord1", roles = ["COORDENADOR"])
    fun `deve retornar 400 para request invalido`() {
        given()
            .contentType(ContentType.JSON)
            .body("{}")
            .`when`().post()
            .then()
            .statusCode(400)
    }
}
