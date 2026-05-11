// ============================================================
// github.js — Persistência via GitHub API
// ============================================================
// O sistema usa o próprio repositório GitHub como banco de dados.
// Os arquivos data/estoque.json e data/historico.json são lidos
// e escritos via GitHub Contents API usando um Personal Access Token
// configurado pelo usuário na primeira vez que acessa o sistema.
// ============================================================

const GH = (() => {
  const STORAGE_KEY = 'portocel_gh_config';

  function getConfig() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null'); }
    catch { return null; }
  }

  function saveConfig(cfg) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  }

  function isConfigured() {
    const c = getConfig();
    return c && c.token && c.owner && c.repo;
  }

  function apiBase() {
    const c = getConfig();
    return `https://api.github.com/repos/${c.owner}/${c.repo}`;
  }

  function headers() {
    const c = getConfig();
    return {
      'Authorization': `token ${c.token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json'
    };
  }

  async function getFile(path) {
    const res = await fetch(`${apiBase()}/contents/${path}`, { headers: headers() });
    if (!res.ok) throw new Error(`Erro ao ler ${path}: ${res.status}`);
    const data = await res.json();
  const content = new TextDecoder("utf-8").decode(Uint8Array.from(atob(data.content), c => c.charCodeAt(0)));
    return { content: JSON.parse(content), sha: data.sha };
  }

  async function putFile(path, content, sha, message) {
    const body = {
      message: message || `[inventario] atualiza ${path}`,
      content: btoa(unescape(encodeURIComponent(JSON.stringify(content, null, 2)))),
      sha
    };
    const res = await fetch(`${apiBase()}/contents/${path}`, {
      method: 'PUT', headers: headers(), body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || `Erro ao salvar ${path}`);
    }
    return await res.json();
  }

  async function testConnection() {
    const res = await fetch(`${apiBase()}`, { headers: headers() });
    if (!res.ok) throw new Error('Token inválido ou repositório não encontrado');
    return await res.json();
  }

  return { getConfig, saveConfig, isConfigured, getFile, putFile, testConnection };
})();

// ============================================================
// Estado global da aplicação
// ============================================================
const APP = {
  estoque: null,       // { items, equipe, emails }
  estoqueSha: null,
  historico: null,     // array de registros
  historicoSha: null,

  async carregar() {
    const [e, h] = await Promise.all([
      GH.getFile('data/estoque.json'),
      GH.getFile('data/historico.json')
    ]);
    this.estoque = e.content;
    this.estoqueSha = e.sha;
    this.historico = h.content;
    this.historicoSha = h.sha;
  },

  async salvarEstoque(msg) {
    const r = await GH.putFile('data/estoque.json', this.estoque, this.estoqueSha, msg);
    this.estoqueSha = r.content.sha;
  },

  async salvarHistorico(msg) {
    const r = await GH.putFile('data/historico.json', this.historico, this.historicoSha, msg);
    this.historicoSha = r.content.sha;
  },

  async salvarTudo(registro) {
    // Salva estoque atualizado e adiciona registro ao histórico
    this.historico.unshift(registro);
    if (this.historico.length > 200) this.historico = this.historico.slice(0, 200);
    await Promise.all([
      this.salvarEstoque(`Inventário ${registro.data} - Turno ${registro.turno} - ${registro.colaborador}`),
      this.salvarHistorico(`Histórico atualizado ${registro.data}`)
    ]);
  }
};
