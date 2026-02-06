import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { AulaDisponivel, Horario, MatriculaService } from '@frontend/data-access';
import { FormatDiaSemanaPipe, formatDiaSemana } from '@frontend/shared';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { finalize, forkJoin } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    FormatDiaSemanaPipe
  ],
  templateUrl: './home.component.html',
  styles: [`
    .student-layout {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;

      @media (min-width: 1200px) {
        grid-template-columns: 3fr 2fr;
      }
    }

    :host {
      display: block;
    }
  `]
})
export class AlunoHomeComponent implements OnInit {
  private matriculaService = inject(MatriculaService);
  private messageService = inject(MessageService);

  aulasDisponiveis$ = this.matriculaService.aulasDisponiveis$;
  minhasMatriculas$ = this.matriculaService.minhasMatriculas$;
  matriculando: number | null = null;

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    forkJoin([
      this.matriculaService.carregarAulasDisponiveis(),
      this.matriculaService.carregarMinhasMatriculas()
    ]).subscribe();
  }

  matricular(aula: AulaDisponivel): void {
    this.matriculando = aula.id;
    this.matriculaService.realizarMatricula(aula.id).pipe(
      finalize(() => this.matriculando = null)
    ).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Matrícula realizada com sucesso!' });
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: err.message });
      }
    });
  }

  formatarHorario(horario: Horario): string {
    return `${formatDiaSemana(horario.diaSemana)} ${horario.horaInicio} - ${horario.horaFim}`;
  }

  getTooltip(aula: AulaDisponivel): string {
    if (aula.jaMatriculado) return 'Já matriculado';
    if (aula.conflitaHorario) return 'Conflito de horário';
    if (aula.vagasDisponiveis === 0) return 'Sem vagas disponíveis';
    return '';
  }
}
