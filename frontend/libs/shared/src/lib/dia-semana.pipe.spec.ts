import { describe, it, expect } from 'vitest';
import { FormatDiaSemanaPipe, formatDiaSemana } from './dia-semana.pipe';
import { DiaSemana } from '@frontend/data-access';

describe('FormatDiaSemanaPipe', () => {
  const pipe = new FormatDiaSemanaPipe();

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should transform SEGUNDA to Seg', () => {
    expect(pipe.transform(DiaSemana.SEGUNDA)).toBe('Seg');
  });

  it('should transform TERCA to Ter', () => {
    expect(pipe.transform(DiaSemana.TERCA)).toBe('Ter');
  });

  it('should transform QUARTA to Qua', () => {
    expect(pipe.transform(DiaSemana.QUARTA)).toBe('Qua');
  });

  it('should transform QUINTA to Qui', () => {
    expect(pipe.transform(DiaSemana.QUINTA)).toBe('Qui');
  });

  it('should transform SEXTA to Sex', () => {
    expect(pipe.transform(DiaSemana.SEXTA)).toBe('Sex');
  });

  it('should transform SABADO to Sáb', () => {
    expect(pipe.transform(DiaSemana.SABADO)).toBe('Sáb');
  });

  it('should return the original value for unknown input', () => {
    expect(pipe.transform('UNKNOWN')).toBe('UNKNOWN');
  });
});

describe('formatDiaSemana function', () => {
  it('should format SEGUNDA to Seg', () => {
    expect(formatDiaSemana(DiaSemana.SEGUNDA)).toBe('Seg');
  });

  it('should return original value for unknown input', () => {
    expect(formatDiaSemana('INVALID')).toBe('INVALID');
  });
});
