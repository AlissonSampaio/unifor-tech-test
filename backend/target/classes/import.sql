-- Cursos (9)
INSERT INTO curso (id, codigo, nome) VALUES (1, 'CC', 'Ciência da Computação');
INSERT INTO curso (id, codigo, nome) VALUES (2, 'SI', 'Sistemas de Informação');
INSERT INTO curso (id, codigo, nome) VALUES (3, 'ES', 'Engenharia de Software');
INSERT INTO curso (id, codigo, nome) VALUES (4, 'EC', 'Engenharia Civil');
INSERT INTO curso (id, codigo, nome) VALUES (5, 'EM', 'Engenharia Mecânica');
INSERT INTO curso (id, codigo, nome) VALUES (6, 'EE', 'Engenharia Elétrica');
INSERT INTO curso (id, codigo, nome) VALUES (7, 'ADM', 'Administração');
INSERT INTO curso (id, codigo, nome) VALUES (8, 'DIR', 'Direito');
INSERT INTO curso (id, codigo, nome) VALUES (9, 'MED', 'Medicina');

-- Professores (5)
INSERT INTO professor (id, nome, email) VALUES (1, 'Dr. João Silva', 'joao.silva@unifor.br');
INSERT INTO professor (id, nome, email) VALUES (2, 'Dra. Maria Santos', 'maria.santos@unifor.br');
INSERT INTO professor (id, nome, email) VALUES (3, 'Dr. Pedro Oliveira', 'pedro.oliveira@unifor.br');
INSERT INTO professor (id, nome, email) VALUES (4, 'Dra. Julia Ferreira', 'julia.ferreira@unifor.br');
INSERT INTO professor (id, nome, email) VALUES (5, 'Dr. Lucas Almeida', 'lucas.almeida@unifor.br');

-- Horarios (9)
INSERT INTO horario (id, dia_semana, hora_inicio, hora_fim, periodo) VALUES (1, 'SEGUNDA', '07:30', '09:10', 'MANHA');
INSERT INTO horario (id, dia_semana, hora_inicio, hora_fim, periodo) VALUES (2, 'SEGUNDA', '09:20', '11:00', 'MANHA');
INSERT INTO horario (id, dia_semana, hora_inicio, hora_fim, periodo) VALUES (3, 'SEGUNDA', '11:10', '12:50', 'MANHA');
INSERT INTO horario (id, dia_semana, hora_inicio, hora_fim, periodo) VALUES (4, 'TERCA', '13:30', '15:10', 'TARDE');
INSERT INTO horario (id, dia_semana, hora_inicio, hora_fim, periodo) VALUES (5, 'TERCA', '15:20', '17:00', 'TARDE');
INSERT INTO horario (id, dia_semana, hora_inicio, hora_fim, periodo) VALUES (6, 'TERCA', '17:10', '18:50', 'TARDE');
INSERT INTO horario (id, dia_semana, hora_inicio, hora_fim, periodo) VALUES (7, 'QUARTA', '19:00', '20:40', 'NOITE');
INSERT INTO horario (id, dia_semana, hora_inicio, hora_fim, periodo) VALUES (8, 'QUARTA', '20:50', '22:30', 'NOITE');
INSERT INTO horario (id, dia_semana, hora_inicio, hora_fim, periodo) VALUES (9, 'QUINTA', '19:00', '20:40', 'NOITE');

-- Disciplinas (15)
INSERT INTO disciplina (id, codigo, nome, carga_horaria) VALUES (1, 'ALG', 'Algoritmos', 60);
INSERT INTO disciplina (id, codigo, nome, carga_horaria) VALUES (2, 'BD', 'Banco de Dados', 60);
INSERT INTO disciplina (id, codigo, nome, carga_horaria) VALUES (3, 'POO', 'Programação Orientada a Objetos', 60);
INSERT INTO disciplina (id, codigo, nome, carga_horaria) VALUES (4, 'ENGSOFT', 'Engenharia de Software', 60);
INSERT INTO disciplina (id, codigo, nome, carga_horaria) VALUES (5, 'RC', 'Redes de Computadores', 60);
INSERT INTO disciplina (id, codigo, nome, carga_horaria) VALUES (6, 'SO', 'Sistemas Operacionais', 60);
INSERT INTO disciplina (id, codigo, nome, carga_horaria) VALUES (7, 'IA', 'Inteligência Artificial', 60);
INSERT INTO disciplina (id, codigo, nome, carga_horaria) VALUES (8, 'WEB', 'Desenvolvimento Web', 60);
INSERT INTO disciplina (id, codigo, nome, carga_horaria) VALUES (9, 'MOB', 'Desenvolvimento Mobile', 60);
INSERT INTO disciplina (id, codigo, nome, carga_horaria) VALUES (10, 'SEG', 'Segurança da Informação', 60);
INSERT INTO disciplina (id, codigo, nome, carga_horaria) VALUES (11, 'CAL', 'Cálculo I', 80);
INSERT INTO disciplina (id, codigo, nome, carga_horaria) VALUES (12, 'FIS', 'Física I', 80);
INSERT INTO disciplina (id, codigo, nome, carga_horaria) VALUES (13, 'EST', 'Estatística', 60);
INSERT INTO disciplina (id, codigo, nome, carga_horaria) VALUES (14, 'ADMG', 'Administração Geral', 60);
INSERT INTO disciplina (id, codigo, nome, carga_horaria) VALUES (15, 'DIREMP', 'Direito Empresarial', 60);

-- Coordenadores (3)
INSERT INTO coordenador (id, nome, email, keycloak_id) VALUES (1, 'Ana Costa', 'ana.costa@unifor.br', 'coord1');
INSERT INTO coordenador (id, nome, email, keycloak_id) VALUES (2, 'Bruno Lima', 'bruno.lima@unifor.br', 'coord2');
INSERT INTO coordenador (id, nome, email, keycloak_id) VALUES (3, 'Carla Souza', 'carla.souza@unifor.br', 'coord3');

-- Coordenador-Curso (relacionamento)
INSERT INTO coordenador_curso (coordenador_id, curso_id) VALUES (1, 1);
INSERT INTO coordenador_curso (coordenador_id, curso_id) VALUES (1, 2);
INSERT INTO coordenador_curso (coordenador_id, curso_id) VALUES (1, 3);
INSERT INTO coordenador_curso (coordenador_id, curso_id) VALUES (2, 4);
INSERT INTO coordenador_curso (coordenador_id, curso_id) VALUES (2, 5);
INSERT INTO coordenador_curso (coordenador_id, curso_id) VALUES (2, 6);
INSERT INTO coordenador_curso (coordenador_id, curso_id) VALUES (3, 7);
INSERT INTO coordenador_curso (coordenador_id, curso_id) VALUES (3, 8);
INSERT INTO coordenador_curso (coordenador_id, curso_id) VALUES (3, 9);

-- Alunos (5)
INSERT INTO aluno (id, matricula, nome, email, keycloak_id, curso_id) VALUES (1, '2024001', 'Felipe Rodrigues', 'felipe@edu.unifor.br', 'aluno1', 1);
INSERT INTO aluno (id, matricula, nome, email, keycloak_id, curso_id) VALUES (2, '2024002', 'Gabriela Costa', 'gabriela@edu.unifor.br', 'aluno2', 2);
INSERT INTO aluno (id, matricula, nome, email, keycloak_id, curso_id) VALUES (3, '2024003', 'Henrique Lima', 'henrique@edu.unifor.br', 'aluno3', 3);
INSERT INTO aluno (id, matricula, nome, email, keycloak_id, curso_id) VALUES (4, '2024004', 'Isabella Souza', 'isabella@edu.unifor.br', 'aluno4', 7);
INSERT INTO aluno (id, matricula, nome, email, keycloak_id, curso_id) VALUES (5, '2024005', 'João Ferreira', 'joao.f@edu.unifor.br', 'aluno5', 8);

-- Reset sequences for Hibernate (Individual sequences created by Quarkus/Hibernate)
SELECT setval('aluno_SEQ', 100);
SELECT setval('coordenador_SEQ', 100);
SELECT setval('curso_SEQ', 100);
SELECT setval('disciplina_SEQ', 100);
SELECT setval('horario_SEQ', 100);
SELECT setval('matricula_SEQ', 100);
SELECT setval('matriz_curricular_SEQ', 100);
SELECT setval('professor_SEQ', 100);
