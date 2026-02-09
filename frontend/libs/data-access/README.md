# @frontend/data-access

Biblioteca de acesso a dados com services HTTP e modelos TypeScript para comunicação com a API.

## Instalação

A biblioteca já está configurada no workspace. Para usar:

```typescript
import { MatrizService, MatriculaService, DadosReferenciaService } from '@frontend/data-access';
import { MatrizCurricular, Matricula, Curso } from '@frontend/data-access';
```

## Services

### MatrizService

Gerencia matrizes curriculares (CRUD para coordenadores).

```typescript
@Component({...})
export class CoordinatorComponent {
  private matrizService = inject(MatrizService);

  // Observable reativo com estado local
  matrizes$ = this.matrizService.matrizes$;

  ngOnInit() {
    // Listar com filtros opcionais
    this.matrizService.listar({
      periodo: Periodo.MANHA,
      cursoId: 1
    }).subscribe();
  }

  criar(request: MatrizCurricularRequest) {
    this.matrizService.criar(request).subscribe();
  }

  atualizar(id: number, request: MatrizCurricularRequest) {
    this.matrizService.atualizar(id, request).subscribe();
  }

  excluir(id: number) {
    this.matrizService.excluir(id).subscribe();
  }
}
```

### MatriculaService

Gerencia matrículas do aluno logado.

```typescript
@Component({...})
export class StudentComponent {
  private matriculaService = inject(MatriculaService);

  // Observables reativos
  aulasDisponiveis$ = this.matriculaService.aulasDisponiveis$;
  minhasMatriculas$ = this.matriculaService.minhasMatriculas$;

  ngOnInit() {
    // Carregar dados iniciais
    forkJoin([
      this.matriculaService.carregarAulasDisponiveis(),
      this.matriculaService.carregarMinhasMatriculas()
    ]).subscribe();
  }

  matricular(matrizId: number) {
    this.matriculaService.realizarMatricula(matrizId).subscribe();
  }
}
```

### DadosReferenciaService

Carrega dados de referência (cursos, disciplinas, professores, horários).

```typescript
@Component({...})
export class FormComponent {
  private dadosRef = inject(DadosReferenciaService);

  cursos$ = this.dadosRef.getCursos();
  disciplinas$ = this.dadosRef.getDisciplinas();
  professores$ = this.dadosRef.getProfessores();
  horarios$ = this.dadosRef.getHorarios();
}
```

## Modelos

### Enums

```typescript
enum DiaSemana {
  SEGUNDA, TERCA, QUARTA, QUINTA, SEXTA, SABADO
}

enum Periodo {
  MANHA, TARDE, NOITE
}
```

### Interfaces Principais

| Interface | Descrição |
|-----------|-----------|
| `Curso` | Curso (id, codigo, nome) |
| `Disciplina` | Disciplina (id, codigo, nome, cargaHoraria) |
| `Professor` | Professor (id, nome, email) |
| `Horario` | Horário (id, diaSemana, horaInicio, horaFim, periodo) |
| `MatrizCurricular` | Matriz completa com disciplina, professor, horário e vagas |
| `MatrizCurricularRequest` | DTO para criar/atualizar matriz |
| `Matricula` | Matrícula do aluno |
| `AulaDisponivel` | Aula disponível com flags de conflito e matrícula |
| `MatrizFiltro` | Filtros para listagem de matrizes |

## Padrão Reativo

Os services usam `BehaviorSubject` para manter estado local:

1. Chamadas HTTP atualizam o subject interno
2. Componentes se inscrevem nos observables públicos (`matrizes$`, `aulasDisponiveis$`, etc.)
3. Atualizações são propagadas automaticamente para todos os inscritos

Isso permite que múltiplos componentes compartilhem o mesmo estado sem chamadas HTTP duplicadas.

## Testes

```bash
npx nx test data-access
```

Os testes usam Vitest e cobrem:
- `MatrizService` - CRUD e gerenciamento de estado
- `MatriculaService` - Carregamento e matrícula
