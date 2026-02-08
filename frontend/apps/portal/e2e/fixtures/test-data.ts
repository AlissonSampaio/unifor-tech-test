export const TEST_USERS = {
  coordinator: {
    username: 'coord1',
    password: 'coord123',
    role: 'COORDENADOR',
  },
  student: {
    username: 'aluno1',
    password: 'aluno123',
    role: 'ALUNO',
  },
} as const;

export const ROUTES = {
  home: '/',
  coordinator: '/coordenador',
  student: '/aluno',
} as const;

export const PAGE_TITLES = {
  coordinator: 'Gestão da Matriz Curricular',
  studentAvailableClasses: 'Aulas Disponíveis',
  studentEnrollments: 'Minhas Matrículas',
} as const;

export const BUTTON_LABELS = {
  newClass: 'Nova Aula',
  save: 'Salvar',
  cancel: 'Cancelar',
  enroll: 'Matricular',
} as const;

export const DIALOG_TITLES = {
  newClass: 'Nova Aula',
  editClass: 'Editar Aula',
} as const;

export const MESSAGES = {
  emptyClassList: 'Nenhuma aula encontrada',
  emptyAvailableClasses: 'Nenhuma aula disponível',
  emptyEnrollments: 'Nenhuma matrícula realizada',
} as const;

export const TIMEOUTS = {
  navigation: 30000,
  action: 15000,
  assertion: 10000,
} as const;
