import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // 1. Estados da Aplicação (Navegação e Dados)
  const [telaAtiva, setTelaAtiva] = useState('alunos');
  const [alunos, setAlunos] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [turmas, setTurmas] = useState([]);

  // Filtros e Seleção
  const [busca, setBusca] = useState('');
  const [filtroTurma, setFiltroTurma] = useState('');
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  
  // Estados - Modais
  const [modalAberto, setModalAberto] = useState(false);
  const [historicoAberto, setHistoricoAberto] = useState(false); // NOVO ESTADO: Controla o modal de histórico
  const [novoNome, setNovoNome] = useState('');
  const [novoEmail, setNovoEmail] = useState('');
  const [novaTurma, setNovaTurma] = useState('');

  const [modalProfAberto, setModalProfAberto] = useState(false);
  const [profNome, setProfNome] = useState('');
  const [profEmail, setProfEmail] = useState('');
  const [profArea, setProfArea] = useState('');

  const [modalCursoAberto, setModalCursoAberto] = useState(false);
  const [cursoNome, setCursoNome] = useState('');
  const [cursoArea, setCursoArea] = useState('');
  const [cursoCarga, setCursoCarga] = useState('');

  const [modalTurmaAberto, setModalTurmaAberto] = useState(false);
  const [turmaNome, setTurmaNome] = useState('');
  const [turmaTurno, setTurmaTurno] = useState('');
  const [turmaPeriodo, setTurmaPeriodo] = useState('');
  const [turmaCapacidade, setTurmaCapacidade] = useState('');
  const [turmaIdCurso, setTurmaIdCurso] = useState('');
  const [turmaIdProf, setTurmaIdProf] = useState('');

  // 2. Funções de Busca (GET)
  const carregarAlunos = () => fetch('http://localhost:3000/api/alunos').then(res => res.json()).then(setAlunos).catch(console.error);
  const carregarProfessores = () => fetch('http://localhost:3000/api/professores').then(res => res.json()).then(setProfessores).catch(console.error);
  const carregarCursos = () => fetch('http://localhost:3000/api/cursos').then(res => res.json()).then(setCursos).catch(console.error);
  const carregarTurmas = () => fetch('http://localhost:3000/api/turmas').then(res => res.json()).then(setTurmas).catch(console.error);

  useEffect(() => {
    carregarAlunos();
    carregarProfessores();
    carregarCursos();
    carregarTurmas();
  }, []);

  // 3. Funções de Cadastro (POST)
  const handleCadastrarAluno = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:3000/api/alunos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: novoNome, email: novoEmail, turma_nome: novaTurma })
        });
        if (response.ok) {
            setModalAberto(false); setNovoNome(''); setNovoEmail(''); setNovaTurma('');
            carregarAlunos(); alert("Aluno cadastrado com sucesso!");
        }
    } catch (error) { console.error(error); }
  };

  const handleCadastrarProfessor = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:3000/api/professores', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: profNome, email: profEmail, area: profArea })
        });
        if (response.ok) {
            setModalProfAberto(false); setProfNome(''); setProfEmail(''); setProfArea('');
            carregarProfessores(); alert("Professor cadastrado!");
        }
    } catch (error) { console.error(error); }
  };

  const handleCadastrarCurso = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:3000/api/cursos', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: cursoNome, area: cursoArea, carga_horaria: cursoCarga })
        });
        if (response.ok) {
            setModalCursoAberto(false); setCursoNome(''); setCursoArea(''); setCursoCarga('');
            carregarCursos(); alert("Curso cadastrado!");
        }
    } catch (error) { console.error(error); }
  };

  const handleCadastrarTurma = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://localhost:3000/api/turmas', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              nome_turma: turmaNome, turno: turmaTurno, periodo: turmaPeriodo, 
              capacidade: turmaCapacidade, id_curso: turmaIdCurso, id_professor: turmaIdProf 
            })
        });
        if (response.ok) {
            setModalTurmaAberto(false); setTurmaNome(''); setTurmaTurno(''); setTurmaPeriodo('');
            setTurmaCapacidade(''); setTurmaIdCurso(''); setTurmaIdProf('');
            carregarTurmas(); alert("Turma cadastrada!");
        }
    } catch (error) { console.error(error); }
  };

  // 4. Filtros e Cálculos de Relatórios
  const alunosFiltrados = alunos.filter(aluno => {
    const termoBusca = busca.toLowerCase();
    const correspondeBusca = aluno.nome_aluno.toLowerCase().includes(termoBusca) || aluno.email.toLowerCase().includes(termoBusca) || aluno.id_matricula.toString().includes(termoBusca);
    const correspondeTurma = filtroTurma === '' || aluno.turma === filtroTurma;
    return correspondeBusca && correspondeTurma;
  });
  
  const turmasUnicas = [...new Set(alunos.map(a => a.turma))];

  const dadosRelatorioTurmas = turmasUnicas.map(turmaNome => {
    const alunosNaTurma = alunos.filter(a => a.turma === turmaNome);
    const mediaTurma = alunosNaTurma.reduce((acc, a) => acc + parseFloat(a.media_final || 0), 0) / (alunosNaTurma.length || 1);
    const turmaInfo = turmas.find(t => t.nome_turma === turmaNome);
    const capacidade = turmaInfo ? turmaInfo.capacidade : 0;
    const ocupacao = capacidade > 0 ? Math.round((alunosNaTurma.length / capacidade) * 100) : 0;

    return {
      turma: turmaNome,
      quantidade: alunosNaTurma.length,
      capacidade: capacidade > 0 ? capacidade : 'N/A',
      ocupacao: ocupacao,
      media: mediaTurma.toFixed(2)
    };
  });

  // 5. Interface
  return (
    <div className="dashboard-layout">
      {/* --- SIDEBAR --- */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h2>Portal Acadêmico</h2>
          <span>SECRETARIA & COORDENAÇÃO</span>
        </div>
        <nav className="sidebar-menu">
          <p>NAVEGAÇÃO</p>
          <a href="#" className={telaAtiva === 'alunos' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTelaAtiva('alunos'); }}>Consulta de Alunos</a>
          <a href="#" className={telaAtiva === 'professores' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTelaAtiva('professores'); }}>Professores</a>
          <a href="#" className={telaAtiva === 'cursos' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTelaAtiva('cursos'); }}>Cursos e Turmas</a>
          <a href="#" className={telaAtiva === 'relatorios' ? 'active' : ''} onClick={(e) => { e.preventDefault(); setTelaAtiva('relatorios'); }}>Relatórios de Matrícula</a>
        </nav>
      </aside>

      {/* --- TELA 1: ALUNOS --- */}
      {telaAtiva === 'alunos' && (
        <>
          <main className="main-content">
            <header className="top-header">
              <div>
                <h1>Consulta de Alunos Matriculados</h1>
                <p>Visualização e acompanhamento acadêmico</p>
              </div>
              <button className="btn-novo-aluno" onClick={() => setModalAberto(true)}>+ Novo Aluno</button>
            </header>

            <section className="kpi-cards">
              <div className="card"><span>TOTAL DE MATRICULADOS</span><h3>{alunos.length}</h3></div>
              <div className="card"><span>MÉDIA GERAL (ESCOLA)</span><h3>{(alunos.reduce((acc, curr) => acc + parseFloat(curr.media_final || 0), 0) / (alunos.length || 1)).toFixed(2)}</h3></div>
            </section>

            <section className="filters-section">
              <input type="text" placeholder="Buscar por Nome, Matrícula ou E-mail..." value={busca} onChange={(e) => setBusca(e.target.value)} className="search-input" />
              <select value={filtroTurma} onChange={(e) => setFiltroTurma(e.target.value)} className="filter-select">
                <option value="">Todas as Turmas</option>
                {turmasUnicas.map(turma => <option key={turma} value={turma}>{turma}</option>)}
              </select>
            </section>

            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Matrícula</th><th>Nome do Aluno</th><th>Turma</th><th>Data Matrícula</th></tr>
                </thead>
                <tbody>
                  {alunosFiltrados.map((aluno) => (
                    <tr key={aluno.id_matricula} onClick={() => setAlunoSelecionado(aluno)} className={alunoSelecionado?.id_matricula === aluno.id_matricula ? 'row-selected' : ''}>
                      <td>{aluno.id_matricula}</td>
                      <td className="aluno-nome"><div className="avatar">{aluno.nome_aluno.substring(0, 2).toUpperCase()}</div>{aluno.nome_aluno}</td>
                      <td>{aluno.turma}</td><td>{new Date(aluno.data_matricula).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>

          {alunoSelecionado && (
            <aside className="right-panel">
              <div className="panel-header"><h3>Ficha Rápida do Aluno</h3><button onClick={() => setAlunoSelecionado(null)}>X</button></div>
              <div className="panel-profile"><div className="avatar-large">{alunoSelecionado.nome_aluno.substring(0, 2).toUpperCase()}</div><h4>{alunoSelecionado.nome_aluno}</h4><span className="badge">Matrícula: {alunoSelecionado.id_matricula}</span></div>
              <div className="panel-stats"><div className="stat-box"><span>Média Final</span><strong style={{ color: alunoSelecionado.media_final >= 7 ? '#00e676' : '#ff5252' }}>{alunoSelecionado.media_final}</strong></div><div className="stat-box"><span>Turma</span><strong>{alunoSelecionado.turma}</strong></div></div>
              <div className="panel-details"><p><strong>Notas Parciais:</strong> {alunoSelecionado.notas}</p><p><strong>E-mail:</strong> {alunoSelecionado.email}</p><p><strong>Entrada:</strong> {new Date(alunoSelecionado.data_matricula).toLocaleDateString('pt-BR')}</p></div>
              
              {/* NOVO: Botão agora abre o modal de Histórico */}
              <button className="btn-ficha-completa" onClick={() => setHistoricoAberto(true)}>Ver Histórico Completo</button>
            </aside>
          )}

          {/* NOVO: MODAL DE HISTÓRICO COMPLETO (BOLETIM) */}
          {historicoAberto && alunoSelecionado && (
            <div className="modal-overlay">
              <div className="modal-content" style={{ width: '600px' }}>
                <div id="area-impressao">
                  <div style={{ textAlign: 'center', borderBottom: '2px solid #1a237e', paddingBottom: '15px', marginBottom: '20px' }}>
                    <h2 style={{ color: '#1a237e', margin: 0 }}>Portal Acadêmico</h2>
                    <h3 style={{ color: '#424242', margin: '5px 0' }}>Histórico Escolar Oficial</h3>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '25px', fontSize: '14px' }}>
                    <div><strong>Aluno:</strong> {alunoSelecionado.nome_aluno}</div>
                    <div><strong>Matrícula:</strong> {alunoSelecionado.id_matricula}</div>
                    <div><strong>Turma:</strong> {alunoSelecionado.turma}</div>
                    <div><strong>Data de Ingresso:</strong> {new Date(alunoSelecionado.data_matricula).toLocaleDateString('pt-BR')}</div>
                  </div>

                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f4f7fa' }}>
                        <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>Nota 1</th>
                        <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>Nota 2</th>
                        <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center' }}>Nota 3</th>
                        <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'center', backgroundColor: '#e8eaf6' }}>Média Final</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {/* Divide a string "X | Y | Z" em colunas separadas */}
                        {alunoSelecionado.notas.split('|').map((nota, idx) => (
                          <td key={idx} style={{ border: '1px solid #ddd', padding: '15px', textAlign: 'center', fontSize: '16px' }}>{nota.trim()}</td>
                        ))}
                        <td style={{ border: '1px solid #ddd', padding: '15px', textAlign: 'center', fontWeight: 'bold', fontSize: '16px', backgroundColor: '#f9fafb' }}>
                          {alunoSelecionado.media_final}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  <div style={{ textAlign: 'center', padding: '15px', backgroundColor: alunoSelecionado.media_final >= 7 ? '#e8f5e9' : '#ffebee', borderRadius: '8px' }}>
                    <h3 style={{ margin: 0, color: alunoSelecionado.media_final >= 7 ? '#2e7d32' : '#c62828' }}>
                      SITUAÇÃO: {alunoSelecionado.media_final >= 7 ? 'APROVADO' : 'REPROVADO'}
                    </h3>
                  </div>
                </div>

                <div className="modal-actions" style={{ marginTop: '30px' }}>
                  <button type="button" className="btn-cancel" onClick={() => setHistoricoAberto(false)}>Fechar</button>
                  <button type="button" className="btn-save" onClick={() => window.print()}>🖨️ Imprimir Histórico</button>
                </div>
              </div>
            </div>
          )}

          {/* MODAL MATRICULAR ALUNO */}
          {modalAberto && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Matricular Novo Aluno</h2>
                <form onSubmit={handleCadastrarAluno}>
                  <div className="form-group">
                    <label>Nome Completo</label>
                    <input type="text" value={novoNome} onChange={e => setNovoNome(e.target.value)} required minLength="3" maxLength="50" pattern="[A-Za-zÀ-ÿ\s]+" title="Apenas letras e espaços são permitidos" />
                  </div>
                  <div className="form-group"><label>E-mail</label><input type="email" value={novoEmail} onChange={e => setNovoEmail(e.target.value)} required /></div>
                  <div className="form-group">
                    <label>Turma</label>
                    <select value={novaTurma} onChange={e => setNovaTurma(e.target.value)} required>
                      <option value="">Selecione...</option>{turmasUnicas.map(turma => <option key={turma} value={turma}>{turma}</option>)}
                    </select>
                  </div>
                  <div className="modal-actions"><button type="button" className="btn-cancel" onClick={() => setModalAberto(false)}>Cancelar</button><button type="submit" className="btn-save">Salvar</button></div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* --- TELA 2: PROFESSORES --- */}
      {telaAtiva === 'professores' && (
        <>
          <main className="main-content">
            <header className="top-header">
              <div><h1>Gestão de Professores</h1><p>Cadastro e visualização do corpo docente</p></div>
              <button className="btn-novo-aluno" onClick={() => setModalProfAberto(true)}>+ Novo Professor</button>
            </header>
            
            <div className="table-container">
              <table>
                <thead><tr><th>ID</th><th>Nome do Professor</th><th>E-mail</th><th>Área de Atuação</th></tr></thead>
                <tbody>
                  {professores.map(prof => (
                    <tr key={prof.id_professor}>
                      <td>{prof.id_professor}</td>
                      <td className="aluno-nome"><div className="avatar" style={{backgroundColor: '#00897b'}}>{prof.nome.substring(0, 2).toUpperCase()}</div>{prof.nome}</td>
                      <td>{prof.email}</td><td>{prof.area}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>

          {modalProfAberto && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Cadastrar Professor</h2>
                <form onSubmit={handleCadastrarProfessor}>
                  <div className="form-group">
                    <label>Nome</label>
                    <input type="text" value={profNome} onChange={e => setProfNome(e.target.value)} required minLength="3" maxLength="50" pattern="[A-Za-zÀ-ÿ\s]+" title="Apenas letras e espaços são permitidos" />
                  </div>
                  <div className="form-group"><label>E-mail</label><input type="email" value={profEmail} onChange={e => setProfEmail(e.target.value)} required /></div>
                  <div className="form-group">
                    <label>Área de Atuação</label>
                    <select value={profArea} onChange={e => setProfArea(e.target.value)} required>
                      <option value="">Selecione uma área...</option>
                      <option value="Desenvolvimento Web">Desenvolvimento Web</option>
                      <option value="Banco de Dados">Banco de Dados</option>
                      <option value="Infraestrutura">Infraestrutura</option>
                      <option value="Segurança da Informação">Segurança da Informação</option>
                      <option value="Programação">Programação</option>
                    </select>
                  </div>
                  <div className="modal-actions"><button type="button" className="btn-cancel" onClick={() => setModalProfAberto(false)}>Cancelar</button><button type="submit" className="btn-save">Salvar</button></div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* --- TELA 3: CURSOS E TURMAS --- */}
      {telaAtiva === 'cursos' && (
        <>
          <main className="main-content">
            <header className="top-header">
              <div><h1>Cursos e Turmas</h1><p>Estrutura acadêmica e grade</p></div>
              <div style={{display: 'flex', gap: '10px'}}>
                <button className="btn-novo-aluno" style={{backgroundColor: '#424242'}} onClick={() => setModalCursoAberto(true)}>+ Novo Curso</button>
                <button className="btn-novo-aluno" onClick={() => setModalTurmaAberto(true)}>+ Nova Turma</button>
              </div>
            </header>

            <div className="table-container" style={{ marginBottom: '20px' }}>
              <h3 style={{ padding: '15px', borderBottom: '1px solid #e0e0e0', color: '#1a237e', backgroundColor: '#f9fafb', margin: 0 }}>Catálogo de Cursos</h3>
              <table>
                <thead><tr><th>ID</th><th>Nome do Curso</th><th>Área</th><th>Carga Horária</th></tr></thead>
                <tbody>
                  {cursos.map(curso => (
                    <tr key={curso.id_curso}>
                      <td>{curso.id_curso}</td><td><strong>{curso.nome}</strong></td><td>{curso.area}</td><td>{curso.carga_horaria}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-container">
              <h3 style={{ padding: '15px', borderBottom: '1px solid #e0e0e0', color: '#1a237e', backgroundColor: '#f9fafb', margin: 0 }}>Grade de Turmas</h3>
              <table>
                <thead><tr><th>Turma</th><th>Curso</th><th>Turno / Período</th><th>Professor Responsável</th><th>Vagas</th></tr></thead>
                <tbody>
                  {turmas.map(turma => (
                    <tr key={turma.id_turma}>
                      <td><strong>{turma.nome_turma}</strong></td><td>{turma.nome_curso}</td><td>{turma.turno} / {turma.periodo}</td><td>{turma.nome_professor}</td><td>{turma.capacidade} alunos</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </main>

          {modalCursoAberto && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Cadastrar Curso</h2>
                <form onSubmit={handleCadastrarCurso}>
                  <div className="form-group">
                    <label>Nome do Curso</label>
                    <input type="text" value={cursoNome} onChange={e => setCursoNome(e.target.value)} required minLength="4" maxLength="50" />
                  </div>
                  <div className="form-group">
                    <label>Área</label>
                    <select value={cursoArea} onChange={e => setCursoArea(e.target.value)} required>
                      <option value="">Selecione uma área...</option>
                      <option value="Desenvolvimento Web">Desenvolvimento Web</option>
                      <option value="Banco de Dados">Banco de Dados</option>
                      <option value="Infraestrutura">Infraestrutura</option>
                      <option value="Segurança da Informação">Segurança da Informação</option>
                      <option value="Programação">Programação</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Carga Horária (horas)</label>
                    <input type="number" value={cursoCarga} onChange={e => setCursoCarga(e.target.value)} required min="10" max="2000" title="Carga horária deve ser entre 10h e 2000h" />
                  </div>
                  <div className="modal-actions"><button type="button" className="btn-cancel" onClick={() => setModalCursoAberto(false)}>Cancelar</button><button type="submit" className="btn-save">Salvar</button></div>
                </form>
              </div>
            </div>
          )}

          {modalTurmaAberto && (
            <div className="modal-overlay">
              <div className="modal-content">
                <h2>Cadastrar Turma</h2>
                <form onSubmit={handleCadastrarTurma}>
                  <div className="form-group">
                    <label>Nome da Turma (Ex: LOG-02)</label>
                    <input type="text" value={turmaNome} onChange={e => setTurmaNome(e.target.value)} required minLength="4" maxLength="15" pattern="[A-Z0-9-]+" title="Apenas letras maiúsculas, números e traços. Ex: LOG-02" />
                  </div>
                  <div style={{display: 'flex', gap: '10px'}}>
                    <div className="form-group" style={{flex: 1}}>
                      <label>Turno</label>
                      <select value={turmaTurno} onChange={e => setTurmaTurno(e.target.value)} required>
                        <option value="">Selecione...</option><option value="Manhã">Manhã</option><option value="Tarde">Tarde</option><option value="Noite">Noite</option>
                      </select>
                    </div>
                    <div className="form-group" style={{flex: 1}}>
                      <label>Período</label>
                      <input type="text" placeholder="Ex: 2026.1" value={turmaPeriodo} onChange={e => setTurmaPeriodo(e.target.value)} required pattern="20[2-9][0-9]\.[1-2]" title="O formato deve ser AAAA.S (Ex: 2026.1 ou 2027.2)" />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Capacidade (Vagas)</label>
                    <input type="number" value={turmaCapacidade} onChange={e => setTurmaCapacidade(e.target.value)} required min="5" max="100" />
                  </div>
                  <div className="form-group">
                    <label>Curso</label>
                    <select value={turmaIdCurso} onChange={e => setTurmaIdCurso(e.target.value)} required>
                      <option value="">Selecione o Curso...</option>{cursos.map(c => <option key={c.id_curso} value={c.id_curso}>{c.nome}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Professor Responsável</label>
                    <select value={turmaIdProf} onChange={e => setTurmaIdProf(e.target.value)} required>
                      <option value="">Selecione o Professor...</option>{professores.map(p => <option key={p.id_professor} value={p.id_professor}>{p.nome}</option>)}
                    </select>
                  </div>
                  <div className="modal-actions"><button type="button" className="btn-cancel" onClick={() => setModalTurmaAberto(false)}>Cancelar</button><button type="submit" className="btn-save">Salvar</button></div>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* --- TELA 4: RELATÓRIOS DE MATRÍCULA --- */}
      {telaAtiva === 'relatorios' && (
        <main className="main-content">
          <header className="top-header">
            <div>
              <h1>Relatórios de Matrícula</h1>
              <p>Análise gerencial e desempenho das turmas</p>
            </div>
          </header>

          <div className="table-container" style={{ marginBottom: '20px' }}>
            <h3 style={{ padding: '15px', borderBottom: '1px solid #e0e0e0', color: '#1a237e', backgroundColor: '#f9fafb', margin: 0 }}>Ocupação e Desempenho por Turma</h3>
            <table>
              <thead>
                <tr>
                  <th>Turma</th>
                  <th>Alunos Matriculados</th>
                  <th>Capacidade Total</th>
                  <th>Taxa de Ocupação</th>
                  <th>Média da Turma</th>
                </tr>
              </thead>
              <tbody>
                {dadosRelatorioTurmas.map((dado, index) => (
                  <tr key={index}>
                    <td><strong>{dado.turma}</strong></td>
                    <td>{dado.quantidade} alunos</td>
                    <td>{dado.capacidade} vagas</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '100px', backgroundColor: '#e0e0e0', borderRadius: '4px', height: '8px' }}>
                          <div style={{ 
                            width: `${Math.min(dado.ocupacao, 100)}%`, 
                            backgroundColor: dado.ocupacao >= 90 ? '#ff5252' : '#00e676', 
                            height: '100%', 
                            borderRadius: '4px' 
                          }}></div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{dado.ocupacao}%</span>
                      </div>
                    </td>
                    <td>
                      <strong style={{ color: dado.media >= 7 ? '#00e676' : '#ff5252' }}>{dado.media}</strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      )}
    </div>
  );
}

export default App;