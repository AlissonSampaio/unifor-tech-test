import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatrizService } from './matriz.service';
import { Periodo } from './models';

describe('MatrizService', () => {
  let service: MatrizService;
  let httpMock: HttpTestingController;

  const mockMatriz = {
    id: 1,
    disciplina: { id: 1, codigo: 'ALG', nome: 'Algoritmos', cargaHoraria: 60 },
    professor: { id: 1, nome: 'Dr. Silva', email: 'silva@test.com' },
    horario: { id: 1, diaSemana: 'SEGUNDA', horaInicio: '07:30', horaFim: '09:10', periodo: 'MANHA' },
    maxAlunos: 30,
    vagasDisponiveis: 25,
    cursosAutorizados: [{ id: 1, codigo: 'CC', nome: 'Ciência da Computação' }]
  } as any;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MatrizService]
    });
    service = TestBed.inject(MatrizService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list matrizes without filters', () => {
    const mockList = [mockMatriz];

    service.listar().subscribe(matrizes => {
      expect(matrizes.length).toBe(1);
      expect(matrizes[0].disciplina.nome).toBe('Algoritmos');
    });

    const req = httpMock.expectOne('/api/matriz');
    expect(req.request.method).toBe('GET');
    req.flush(mockList);

    service.matrizes$.subscribe(matrizes => {
      expect(matrizes).toEqual(mockList);
    });
  });

  it('should list matrizes with filters as query params', () => {
    const filtro = { periodo: Periodo.MANHA, cursoId: 1 };

    service.listar(filtro).subscribe();

    const req = httpMock.expectOne(r =>
      r.url === '/api/matriz' &&
      r.params.get('periodo') === 'MANHA' &&
      r.params.get('cursoId') === '1'
    );
    expect(req.request.method).toBe('GET');
    req.flush([mockMatriz]);
  });

  it('should create a matriz and refresh the list', () => {
    const request = {
      disciplinaId: 1,
      professorId: 1,
      horarioId: 1,
      maxAlunos: 30,
      cursosAutorizadosIds: [1]
    };

    service.criar(request).subscribe(result => {
      expect(result.id).toBe(1);
    });

    // First: the POST request
    const postReq = httpMock.expectOne('/api/matriz');
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body).toEqual(request);
    postReq.flush(mockMatriz);

    // Then: the refresh GET request (triggered by switchMap)
    const getReq = httpMock.expectOne('/api/matriz');
    expect(getReq.request.method).toBe('GET');
    getReq.flush([mockMatriz]);
  });

  it('should update a matriz and refresh the list', () => {
    const request = {
      disciplinaId: 1,
      professorId: 2,
      horarioId: 1,
      maxAlunos: 25,
      cursosAutorizadosIds: [1, 2]
    };

    service.atualizar(1, request).subscribe(result => {
      expect(result.id).toBe(1);
    });

    // First: the PUT request
    const putReq = httpMock.expectOne('/api/matriz/1');
    expect(putReq.request.method).toBe('PUT');
    expect(putReq.request.body).toEqual(request);
    putReq.flush(mockMatriz);

    // Then: the refresh GET request
    const getReq = httpMock.expectOne('/api/matriz');
    expect(getReq.request.method).toBe('GET');
    getReq.flush([mockMatriz]);
  });

  it('should delete a matriz and refresh the list', () => {
    service.excluir(1).subscribe();

    // First: the DELETE request
    const deleteReq = httpMock.expectOne('/api/matriz/1');
    expect(deleteReq.request.method).toBe('DELETE');
    deleteReq.flush(null);

    // Then: the refresh GET request
    const getReq = httpMock.expectOne('/api/matriz');
    expect(getReq.request.method).toBe('GET');
    getReq.flush([]);
  });
});
