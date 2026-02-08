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

    const req = httpMock.expectOne('/api/aluno/aulas-disponiveis');
    expect(req.request.method).toBe('GET');
    req.flush(mockAulas);

    service.aulasDisponiveis$.subscribe(aulas => {
      expect(aulas).toEqual(mockAulas);
    });
  });

  it('should call post when realizing enrollment', () => {
    const mockMatricula = { id: 100, disciplina: 'Algoritmos' } as any;
    const mockAulas = [{ id: 1 }] as any;
    const mockMatriculas = [mockMatricula] as any;

    service.realizarMatricula(1).subscribe(res => {
      expect(res).toEqual(mockMatricula);
    });

    const postReq = httpMock.expectOne('/api/aluno/matriculas');
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body).toEqual({ matrizCurricularId: 1 });
    postReq.flush(mockMatricula);

    const aulasReq = httpMock.expectOne('/api/aluno/aulas-disponiveis');
    expect(aulasReq.request.method).toBe('GET');
    aulasReq.flush(mockAulas);

    const matriculasReq = httpMock.expectOne('/api/aluno/matriculas');
    expect(matriculasReq.request.method).toBe('GET');
    matriculasReq.flush(mockMatriculas);
  });
});
