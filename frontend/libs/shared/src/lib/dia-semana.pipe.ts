import { Pipe, PipeTransform } from '@angular/core';
import { DiaSemana } from '@frontend/data-access';

const DIAS_SEMANA_MAP: Record<string, string> = {
  [DiaSemana.SEGUNDA]: 'Seg',
  [DiaSemana.TERCA]: 'Ter',
  [DiaSemana.QUARTA]: 'Qua',
  [DiaSemana.QUINTA]: 'Qui',
  [DiaSemana.SEXTA]: 'Sex',
  [DiaSemana.SABADO]: 'Sáb'
};

/**
 * Pipe para formatar o enum DiaSemana em abreviacao legivel.
 * Uso: {{ horario.diaSemana | formatDiaSemana }}
 */
@Pipe({
  name: 'formatDiaSemana',
  standalone: true
})
export class FormatDiaSemanaPipe implements PipeTransform {
  transform(value: string | DiaSemana): string {
    return DIAS_SEMANA_MAP[value] || value;
  }
}

/** Funcao utilitaria para uso fora de templates */
export function formatDiaSemana(dia: string | DiaSemana): string {
  return DIAS_SEMANA_MAP[dia] || dia;
}
