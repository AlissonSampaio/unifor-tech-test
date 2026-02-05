export const MOCK_DISCIPLINA = { id: 1, nome: 'Cálculo I', codigo: 'MAT101' };
export const MOCK_PROFESSOR = { id: 1, nome: 'Dr. João Silva' };
export const MOCK_HORARIO = {
  id: 1,
  diaSemana: 'Segunda',
  horaInicio: '08:00',
  horaFim: '10:00',
  periodo: 'MANHA',
};
export const MOCK_CURSO = { id: 1, nome: 'Engenharia', codigo: 'ENG' };

export const MOCK_MATRIZ_CURRICULAR = [
  {
    id: 1,
    disciplina: MOCK_DISCIPLINA,
    professor: MOCK_PROFESSOR,
    horario: MOCK_HORARIO,
    maxAlunos: 30,
    vagasDisponiveis: 25,
    cursosAutorizados: [MOCK_CURSO],
  },
  {
    id: 2,
    disciplina: { id: 2, nome: 'Física I', codigo: 'FIS101' },
    professor: { id: 2, nome: 'Dra. Maria Santos' },
    horario: { id: 2, diaSemana: 'Terça', horaInicio: '14:00', horaFim: '16:00', periodo: 'TARDE' },
    maxAlunos: 25,
    vagasDisponiveis: 0,
    cursosAutorizados: [MOCK_CURSO],
  },
];

export const MOCK_AULAS_DISPONIVEIS = [
  {
    id: 1,
    disciplina: MOCK_DISCIPLINA,
    professor: MOCK_PROFESSOR,
    horario: MOCK_HORARIO,
    maxAlunos: 30,
    vagasDisponiveis: 25,
    conflitaHorario: false,
    jaMatriculado: false,
    podeMatricular: true,
  },
  {
    id: 2,
    disciplina: { id: 2, nome: 'Física I', codigo: 'FIS101' },
    professor: { id: 2, nome: 'Dra. Maria Santos' },
    horario: { id: 2, diaSemana: 'Terça', horaInicio: '14:00', horaFim: '16:00', periodo: 'TARDE' },
    maxAlunos: 25,
    vagasDisponiveis: 5,
    conflitaHorario: true,
    jaMatriculado: false,
    podeMatricular: false,
  },
  {
    id: 3,
    disciplina: { id: 3, nome: 'Química', codigo: 'QUI101' },
    professor: { id: 3, nome: 'Dr. Pedro Lima' },
    horario: { id: 3, diaSemana: 'Quarta', horaInicio: '10:00', horaFim: '12:00', periodo: 'MANHA' },
    maxAlunos: 20,
    vagasDisponiveis: 10,
    conflitaHorario: false,
    jaMatriculado: true,
    podeMatricular: false,
  },
];

export const MOCK_MATRICULAS = [
  {
    id: 1,
    disciplina: 'Programação I',
    professor: 'Dr. Carlos Mendes',
    horario: 'Quinta 08:00 - 10:00',
    dataMatricula: '2024-01-15',
  },
];

export const API_ROUTES = {
  matriz: '**/api/matriz**',
  aulasDisponiveis: '**/api/aluno/aulas-disponiveis',
  matriculas: '**/api/aluno/matriculas',
  realizarMatricula: '**/api/aluno/matriculas',
};
