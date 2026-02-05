export const MOCK_DISCIPLINAS = [
  { id: 1, nome: 'Cálculo I', codigo: 'MAT101' },
  { id: 2, nome: 'Física I', codigo: 'FIS101' },
  { id: 3, nome: 'Química', codigo: 'QUI101' },
];

export const MOCK_PROFESSORES = [
  { id: 1, nome: 'Dr. João Silva' },
  { id: 2, nome: 'Dra. Maria Santos' },
  { id: 3, nome: 'Dr. Pedro Lima' },
];

export const MOCK_HORARIOS = [
  { id: 1, diaSemana: 'Segunda', horaInicio: '08:00', horaFim: '10:00', periodo: 'MANHA' },
  { id: 2, diaSemana: 'Terça', horaInicio: '14:00', horaFim: '16:00', periodo: 'TARDE' },
  { id: 3, diaSemana: 'Quarta', horaInicio: '10:00', horaFim: '12:00', periodo: 'MANHA' },
];

export const MOCK_CURSOS = [
  { id: 1, nome: 'Engenharia', codigo: 'ENG' },
  { id: 2, nome: 'Ciência da Computação', codigo: 'CC' },
];

export const MOCK_MATRIZ_CURRICULAR = [
  {
    id: 1,
    disciplina: MOCK_DISCIPLINAS[0],
    professor: MOCK_PROFESSORES[0],
    horario: MOCK_HORARIOS[0],
    maxAlunos: 30,
    vagasDisponiveis: 25,
    cursosAutorizados: [MOCK_CURSOS[0]],
  },
  {
    id: 2,
    disciplina: MOCK_DISCIPLINAS[1],
    professor: MOCK_PROFESSORES[1],
    horario: MOCK_HORARIOS[1],
    maxAlunos: 25,
    vagasDisponiveis: 0,
    cursosAutorizados: [MOCK_CURSOS[0]],
  },
];

export const MOCK_AULAS_DISPONIVEIS = [
  {
    id: 1,
    disciplina: MOCK_DISCIPLINAS[0],
    professor: MOCK_PROFESSORES[0],
    horario: MOCK_HORARIOS[0],
    maxAlunos: 30,
    vagasDisponiveis: 25,
    conflitaHorario: false,
    jaMatriculado: false,
    podeMatricular: true,
  },
  {
    id: 2,
    disciplina: MOCK_DISCIPLINAS[1],
    professor: MOCK_PROFESSORES[1],
    horario: MOCK_HORARIOS[1],
    maxAlunos: 25,
    vagasDisponiveis: 5,
    conflitaHorario: true,
    jaMatriculado: false,
    podeMatricular: false,
  },
  {
    id: 3,
    disciplina: MOCK_DISCIPLINAS[2],
    professor: MOCK_PROFESSORES[2],
    horario: MOCK_HORARIOS[2],
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

export const MOCK_NEW_MATRICULA = {
  id: 2,
  disciplina: 'Cálculo I',
  professor: 'Dr. João Silva',
  horario: 'Segunda 08:00 - 10:00',
  dataMatricula: '2024-01-20',
};

export const MOCK_NEW_MATRIZ = {
  id: 3,
  disciplina: MOCK_DISCIPLINAS[2],
  professor: MOCK_PROFESSORES[2],
  horario: MOCK_HORARIOS[2],
  maxAlunos: 20,
  vagasDisponiveis: 20,
  cursosAutorizados: [MOCK_CURSOS[1]],
};

export const API_ROUTES = {
  matriz: '**/api/matriz**',
  disciplinas: '**/api/dados/disciplinas',
  professores: '**/api/dados/professores',
  horarios: '**/api/dados/horarios',
  cursos: '**/api/dados/cursos',
  aulasDisponiveis: '**/api/aluno/aulas-disponiveis',
  matriculas: '**/api/aluno/matriculas',
};
