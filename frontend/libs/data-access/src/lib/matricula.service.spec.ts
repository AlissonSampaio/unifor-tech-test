import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatriculaService } from './matricula.service';

describe('MatriculaService', () => {
  let service: MatriculaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MatriculaService]
    });
    service = TestBed.inject(MatriculaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load available classes and update subject', () => {
    const mockAulas = [{ id: 1, disciplina: { nome: 'Algoritmos' } }] as any;

    service.carregarAulasDisponiveis().subscribe(aulas => {
      expect(aulas.length).toBe(1);
      expect(aulas[0].disciplina.nome).toBe('Algoritmos');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/aluno/aulas-disponiveis');
    expect(req.request.method).toBe('GET');
    req.flush(mockAulas);

    service.aulasDisponiveis$.subscribe(aulas => {
      expect(aulas).toEqual(mockAulas);
    });
  });

  it('should call post when realizing enrollment', () => {
    const mockMatricula = { id: 100, disciplina: 'Algoritmos' } as any;

    service.realizarMatricula(1).subscribe(res => {
      expect(res).toEqual(mockMatricula);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/aluno/matriculas');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ matrizCurricularId: 1 });
    req.flush(mockMatricula);
  });
});
