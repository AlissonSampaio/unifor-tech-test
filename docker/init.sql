-- Cursos (9)
INSERT INTO curso (id, codigo, nome) VALUES
(1, 'CC', 'Ciência da Computação'),
(2, 'SI', 'Sistemas de Informação'),
(3, 'ES', 'Engenharia de Software'),
(4, 'EC', 'Engenharia Civil'),
(5, 'EM', 'Engenharia Mecânica'),
(6, 'EE', 'Engenharia Elétrica'),
(7, 'ADM', 'Administração'),
(8, 'DIR', 'Direito'),
(9, 'MED', 'Medicina');

-- Professores (5)
INSERT INTO professor (id, nome, email) VALUES
(1, 'Dr. João Silva', 'joao.silva@unifor.br'),
(2, 'Dra. Maria Santos', 'maria.santos@unifor.br'),
(3, 'Dr. Pedro Oliveira', 'pedro.oliveira@unifor.br'),
(4, 'Dra. Julia Ferreira', 'julia.ferreira@unifor.br'),
(5, 'Dr. Lucas Almeida', 'lucas.almeida@unifor.br');

-- Horarios (9)
INSERT INTO horario (id, dia_semana, hora_inicio, hora_fim, periodo) VALUES
(1, 0, '07:30', '09:10', 0), -- SEGUNDA, MANHA
(2, 0, '09:20', '11:00', 0), -- SEGUNDA, MANHA
(3, 0, '11:10', '12:50', 0), -- SEGUNDA, MANHA
(4, 1, '13:30', '15:10', 1), -- TERCA, TARDE
(5, 1, '15:20', '17:00', 1), -- TERCA, TARDE
(6, 1, '17:10', '18:50', 1), -- TERCA, TARDE
(7, 2, '19:00', '20:40', 2), -- QUARTA, NOITE
(8, 2, '20:50', '22:30', 2), -- QUARTA, NOITE
(9, 3, '19:00', '20:40', 2); -- QUINTA, NOITE

-- Disciplinas (15)
INSERT INTO disciplina (id, codigo, nome, carga_horaria) VALUES
(1, 'ALG', 'Algoritmos', 60),
(2, 'BD', 'Banco de Dados', 60),
(3, 'POO', 'Programação Orientada a Objetos', 60),
(4, 'ENGSOFT', 'Engenharia de Software', 60),
(5, 'RC', 'Redes de Computadores', 60),
(6, 'SO', 'Sistemas Operacionais', 60),
(7, 'IA', 'Inteligência Artificial', 60),
(8, 'WEB', 'Desenvolvimento Web', 60),
(9, 'MOB', 'Desenvolvimento Mobile', 60),
(10, 'SEG', 'Segurança da Informação', 60),
(11, 'CAL', 'Cálculo I', 80),
(12, 'FIS', 'Física I', 80),
(13, 'EST', 'Estatística', 60),
(14, 'ADMG', 'Administração Geral', 60),
(15, 'DIREMP', 'Direito Empresarial', 60);

-- Coordenadores (3)
INSERT INTO coordenador (id, nome, email, keycloak_id) VALUES
(1, 'Ana Costa', 'ana.costa@unifor.br', 'coord1'),
(2, 'Bruno Lima', 'bruno.lima@unifor.br', 'coord2'),
(3, 'Carla Souza', 'carla.souza@unifor.br', 'coord3');

-- Coordenador-Curso (relacionamento)
INSERT INTO coordenador_curso (coordenador_id, curso_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 4), (2, 5), (2, 6),
(3, 7), (3, 8), (3, 9);

-- Alunos (5)
INSERT INTO aluno (id, matricula, nome, email, keycloak_id, curso_id) VALUES
(1, '2024001', 'Felipe Rodrigues', 'felipe@edu.unifor.br', 'aluno1', 1),
(2, '2024002', 'Gabriela Costa', 'gabriela@edu.unifor.br', 'aluno2', 2),
(3, '2024003', 'Henrique Lima', 'henrique@edu.unifor.br', 'aluno3', 3),
(4, '2024004', 'Isabella Souza', 'isabella@edu.unifor.br', 'aluno4', 7),
(5, '2024005', 'João Ferreira', 'joao.f@edu.unifor.br', 'aluno5', 8);

-- Sequences (necessário para que novos inserts funcionem corretamente)
SELECT setval('next_val', 100); -- Simplificado, Quarkus usa hibernate_sequence por padrão se não especificado
