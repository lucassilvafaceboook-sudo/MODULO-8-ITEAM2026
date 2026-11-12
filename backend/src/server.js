const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const app = express();
app.use(cors()); // Permite que o React consuma esta API
app.use(express.json());

// Rota principal para buscar os alunos e suas notas
app.get('/api/alunos', async (req, res) => {
    try {
        const query = `
            SELECT 
                a.nome AS nome_aluno, 
                a.email, 
                m.id_matricula, 
                t.nome_turma AS turma, 
                m.data_matricula, 
                CONCAT(n.nota1, ' | ', n.nota2, ' | ', n.nota3) AS notas, 
                n.media AS media_final
            FROM alunos a
            JOIN matriculas m ON a.id_aluno = m.id_aluno 
            JOIN turmas t ON m.id_turma = t.id_turma
            JOIN notas n ON m.id_matricula = n.id_matricula
            ORDER BY t.nome_turma ASC, a.nome ASC;
        `;
        
        const [rows] = await db.query(query);
        res.json(rows); // Envia os dados no formato JSON para o React
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar dados no banco de dados' });
    }
});

const PORT = process.env.PORT || 3000;

// Rota POST para cadastrar um Novo Aluno (O Diferencial do Projeto)
app.post('/api/alunos', async (req, res) => {
    const { nome, email, turma_nome } = req.body;

    try {
        // 1. Descobrir o id_turma com base no nome da turma recebido
        const [turmaResult] = await db.query('SELECT id_turma FROM turmas WHERE nome_turma = ? LIMIT 1', [turma_nome]);
        
        if (turmaResult.length === 0) {
            return res.status(404).json({ erro: 'Turma não encontrada' });
        }
        const id_turma = turmaResult[0].id_turma;

        // 2. Inserir na tabela de alunos
        const [alunoResult] = await db.query('INSERT INTO alunos (nome, email) VALUES (?, ?)', [nome, email]);
        const id_aluno = alunoResult.insertId;

        // 3. Inserir na tabela de matriculas (Data atual e status Ativa)
        const [matResult] = await db.query('INSERT INTO matriculas (id_aluno, id_turma, data_matricula, status) VALUES (?, ?, CURDATE(), "Ativa")', [id_aluno, id_turma]);
        const id_matricula = matResult.insertId;

        // 4. Inserir na tabela de notas (Zerar as notas iniciais)
        await db.query('INSERT INTO notas (id_matricula, nota1, nota2, nota3, media) VALUES (?, 0, 0, 0, 0)', [id_matricula]);

        res.status(201).json({ message: 'Aluno matriculado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao cadastrar novo aluno no banco de dados' });
    }
});

// Rota GET para listar Professores
app.get('/api/professores', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM professores ORDER BY nome ASC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar professores' });
    }
});

// Rota GET para listar Cursos
app.get('/api/cursos', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM cursos ORDER BY nome ASC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar cursos' });
    }
});

// Rota GET para listar Turmas
app.get('/api/turmas', async (req, res) => {
    try {
        // Fazemos JOIN para mostrar o nome do curso e do professor em vez de apenas os IDs
        const query = `
            SELECT t.id_turma, t.nome_turma, t.turno, t.periodo, t.capacidade,
                   c.nome AS nome_curso, p.nome AS nome_professor
            FROM turmas t
            LEFT JOIN cursos c ON t.id_curso = c.id_curso
            LEFT JOIN professores p ON t.id_professor = p.id_professor
            ORDER BY t.nome_turma ASC
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao buscar turmas' });
    }
});

// ==========================================
// 1. Rota POST para cadastrar NOVO CURSO
// ==========================================
app.post('/api/cursos', async (req, res) => {
    const { nome, carga_horaria, area } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO cursos (nome, carga_horaria, area) VALUES (?, ?, ?)', 
            [nome, carga_horaria, area]
        );
        res.status(201).json({ message: 'Curso cadastrado com sucesso!', id_curso: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao cadastrar novo curso' });
    }
});

// ==========================================
// 2. Rota POST para cadastrar NOVO PROFESSOR
// ==========================================
app.post('/api/professores', async (req, res) => {
    const { nome, email, area } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO professores (nome, email, area) VALUES (?, ?, ?)', 
            [nome, email, area]
        );
        res.status(201).json({ message: 'Professor cadastrado com sucesso!', id_professor: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao cadastrar novo professor' });
    }
});

// ==========================================
// 3. Rota POST para cadastrar NOVA TURMA
// ==========================================
app.post('/api/turmas', async (req, res) => {
    // Nota: id_laboratorio pode ser null conforme vimos na sua tabela
    const { id_curso, id_professor, nome_turma, turno, periodo, capacidade, id_laboratorio } = req.body;

    try {
        const [result] = await db.query(
            'INSERT INTO turmas (id_curso, id_professor, nome_turma, turno, periodo, capacidade, id_laboratorio) VALUES (?, ?, ?, ?, ?, ?, ?)', 
            [id_curso, id_professor, nome_turma, turno, periodo, capacidade, id_laboratorio || null]
        );
        res.status(201).json({ message: 'Turma cadastrada com sucesso!', id_turma: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ erro: 'Erro ao cadastrar nova turma' });
    }
});
app.listen(PORT, () => {
    console.log(`Servidor Back-end rodando na porta ${PORT}`);
});