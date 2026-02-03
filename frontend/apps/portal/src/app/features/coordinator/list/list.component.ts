import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DadosReferenciaService,
  MatrizCurricular,
  MatrizFiltro,
  MatrizService,
  Periodo
} from '@frontend/data-access';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

@Component({
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TableModule, 
    ButtonModule, 
    DialogModule, 
    SelectModule, 
    MultiSelectModule, 
    InputNumberModule,
    ConfirmDialogModule
  ],
  providers: [ConfirmationService],
  templateUrl: './list.component.html'
})
export class MatrizListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private matrizService = inject(MatrizService);
  private dadosService = inject(DadosReferenciaService);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  matrizes$ = this.matrizService.matrizes$;
  disciplinas$ = this.dadosService.disciplinas$;
  professores$ = this.dadosService.professores$;
  horarios$ = this.dadosService.horarios$;
  cursos$ = this.dadosService.cursos$;

  displayForm = false;
  editingId: number | null = null;
  loading = false;

  form = this.fb.group({
    disciplinaId: [null as number | null, Validators.required],
    professorId: [null as number | null, Validators.required],
    horarioId: [null as number | null, Validators.required],
    maxAlunos: [30, [Validators.required, Validators.min(1)]],
    cursosAutorizadosIds: [[] as number[], Validators.required]
  });

  filtroForm = this.fb.group({
    periodo: [null as Periodo | null],
    cursoId: [null as number | null]
  });

  periodos = [
    { label: 'Manhã', value: Periodo.MANHA },
    { label: 'Tarde', value: Periodo.TARDE },
    { label: 'Noite', value: Periodo.NOITE }
  ];

  ngOnInit() {
    this.refresh();
    
    this.filtroForm.valueChanges.subscribe(val => {
      this.matrizService.listar(val as MatrizFiltro).subscribe();
    });
  }

  refresh() {
    this.loading = true;
    this.matrizService.listar(this.filtroForm.value as MatrizFiltro).subscribe({
      next: () => this.loading = false,
      error: () => this.loading = false
    });
  }

  showDialog() {
    this.editingId = null;
    this.form.reset({ maxAlunos: 30, cursosAutorizadosIds: [] });
    this.form.get('disciplinaId')?.enable();
    this.displayForm = true;
  }

  editar(matriz: MatrizCurricular) {
    this.editingId = matriz.id;
    this.form.patchValue({
      disciplinaId: matriz.disciplina.id,
      professorId: matriz.professor.id,
      horarioId: matriz.horario.id,
      maxAlunos: matriz.maxAlunos,
      cursosAutorizadosIds: matriz.cursosAutorizados.map(c => c.id)
    });
    this.form.get('disciplinaId')?.disable(); // Não pode alterar disciplina
    this.displayForm = true;
  }

  salvar() {
    if (this.form.invalid) return;

    const rawValue = this.form.getRawValue();
    const request = {
      disciplinaId: rawValue.disciplinaId!,
      professorId: rawValue.professorId!,
      horarioId: (typeof rawValue.horarioId === 'object' && rawValue.horarioId !== null) 
          ? (rawValue.horarioId as any).id 
          : rawValue.horarioId!,
      maxAlunos: rawValue.maxAlunos!,
      cursosAutorizadosIds: rawValue.cursosAutorizadosIds!
    };

    const obs = this.editingId 
      ? this.matrizService.atualizar(this.editingId, request)
      : this.matrizService.criar(request);

    obs.subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Matriz salva com sucesso' });
        this.displayForm = false;
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.message });
      }
    });
  }

  confirmarExclusao(matriz: MatrizCurricular) {
    this.confirmationService.confirm({
      message: `Deseja realmente excluir a aula de ${matriz.disciplina.nome}?`,
      header: 'Confirmação',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.matrizService.excluir(matriz.id).subscribe({
          next: () => this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Excluído com sucesso' }),
          error: (err) => this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.message })
        });
      }
    });
  }
}
