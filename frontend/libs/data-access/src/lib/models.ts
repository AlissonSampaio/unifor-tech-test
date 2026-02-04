export enum DiaSemana {
  SEGUNDA = 'SEGUNDA',
  TERCA = 'TERCA',
  QUARTA = 'QUARTA',
  QUINTA = 'QUINTA',
  SEXTA = 'SEXTA',
  SABADO = 'SABADO'
}

export enum Periodo {
  MANHA = 'MANHA',
  TARDE = 'TARDE',
  NOITE = 'NOITE'
}

export interface Curso {
  id: number;
  codigo: string;
  nome: string;
}

export interface Disciplina {
  id: number;
  codigo: string;
  nome: string;
  cargaHoraria: number;
}

export interface Professor {
  id: number;
  nome: string;
  email: string;
}

export interface Horario {
  id: number;
  diaSemana: DiaSemana;
  horaInicio: string;
  horaFim: string;
  periodo: Periodo;
}

export interface MatrizCurricular {
  id: number;
  disciplina: Disciplina;
  professor: Professor;
  horario: Horario;
  maxAlunos: number;
  vagasDisponiveis: number;
  cursosAutorizados: Curso[];
}

export interface MatrizCurricularRequest {
  disciplinaId: number;
  professorId: number;
  horarioId: number;
  maxAlunos: number;
  cursosAutorizadosIds: number[];
}

export interface Matricula {
  id: number;
  disciplina: string;
  professor: string;
  horario: string;
  dataMatricula: string;
}

export interface AulaDisponivel {
  id: number;
  disciplina: Disciplina;
  professor: Professor;
  horario: Horario;
  maxAlunos: number;
  vagasDisponiveis: number;
  conflitaHorario: boolean;
  jaMatriculado: boolean;
  podeMatricular: boolean;
}

export interface MatrizFiltro {
  periodo?: Periodo;
  cursoId?: number;
  horaInicio?: string;
  horaFim?: string;
  maxAlunosMin?: number;
  maxAlunosMax?: number;
}
