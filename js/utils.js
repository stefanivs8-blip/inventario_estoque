// ============================================================
// utils.js — Funções utilitárias compartilhadas
// ============================================================

const LOGO_B64 = 'iVBORw0KGgoAAAANSUhEUgAAAjoAAAEvCAYAAABMtLLDAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA';
// Logo será carregado dinamicamente do arquivo

function catKey(cat) {
  const c = (cat || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (c === 'epi') return 'epi';
  if (c === 'estrutura') return 'estrutura';
  if (c.includes('oper')) return 'operacional';
  if (c.includes('sinal')) return 'sinalizacao';
  if (c === 'sistema') return 'sistema';
  if (c.includes('amento') || c.includes('ament')) return 'icamento';
  if (c.includes('segu')) return 'seguranca';
  if (c === 'limpeza') return 'limpeza';
  return 'outro';
}

function getStatus(item) {
  if (!item.min) return 'ok';
  if (item.qty <= 0) return 'crit';
  if (item.qty < item.min) return 'crit';
  return 'ok';
}

function statusLabel(s) {
  if (s === 'crit') return '<span class="status-crit">⚠ Crítico</span>';
  if (s === 'low')  return '<span class="status-low">↓ Baixo</span>';
  return '<span class="status-ok">✓ Normal</span>';
}

function getTurnoAtual() {
  const h = new Date().getHours();
  if (h >= 7  && h < 13) return { key: '07 x 13', label: '07:00 – 13:00' };
  if (h >= 13 && h < 19) return { key: '13 x 19', label: '13:00 – 19:00' };
  if (h >= 19)            return { key: '19 x 01', label: '19:00 – 01:00' };
  return { key: '01 x 07', label: '01:00 – 07:00' };
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric' });
}
function formatDateTime(d) {
  return new Date(d).toLocaleString('pt-BR', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}
function nowISO() { return new Date().toISOString(); }

function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = type;
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 3000);
}

function showLoading(msg = 'Carregando...') {
  document.getElementById('loading').style.display = 'flex';
  const lt = document.querySelector('#loading .loading-text');
  if (lt) lt.textContent = msg;
}

function hideLoading() {
  document.getElementById('loading').style.display = 'none';
}

function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Signature canvas helper
function initSignature(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  let drawing = false;
  const ctx = canvas.getContext('2d');
  ctx.strokeStyle = '#004A99';
  ctx.lineWidth = 2.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  function resize() {
    const w = canvas.parentElement.clientWidth;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    canvas.width = w;
    canvas.height = 160;
    ctx.strokeStyle = '#004A99'; ctx.lineWidth = 2.5;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  }

  function getXY(e) {
    const r = canvas.getBoundingClientRect();
    const sx = canvas.width / r.width, sy = canvas.height / r.height;
    if (e.touches) return { x: (e.touches[0].clientX - r.left) * sx, y: (e.touches[0].clientY - r.top) * sy };
    return { x: (e.clientX - r.left) * sx, y: (e.clientY - r.top) * sy };
  }

  resize();
  window.addEventListener('resize', resize);

  canvas.addEventListener('mousedown',  e => { drawing = true; const p = getXY(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); });
  canvas.addEventListener('mousemove',  e => { if (!drawing) return; const p = getXY(e); ctx.lineTo(p.x, p.y); ctx.stroke(); });
  canvas.addEventListener('mouseup',    () => drawing = false);
  canvas.addEventListener('mouseleave', () => drawing = false);
  canvas.addEventListener('touchstart', e => { e.preventDefault(); drawing = true; const p = getXY(e); ctx.beginPath(); ctx.moveTo(p.x, p.y); }, { passive: false });
  canvas.addEventListener('touchmove',  e => { e.preventDefault(); if (!drawing) return; const p = getXY(e); ctx.lineTo(p.x, p.y); ctx.stroke(); }, { passive: false });
  canvas.addEventListener('touchend',   () => drawing = false);

  return {
    clear: () => ctx.clearRect(0, 0, canvas.width, canvas.height),
    getData: () => canvas.toDataURL(),
    isEmpty: () => !ctx.getImageData(0, 0, canvas.width, canvas.height).data.some(c => c !== 0)
  };
}

// Nav highlight
function setActiveNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.site-header nav a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === page || a.getAttribute('href') === './' && page === 'index.html');
  });
}

// Mobile nav toggle
function initNavToggle() {
  const btn = document.getElementById('nav-toggle');
  const nav = document.querySelector('.site-header nav');
  if (!btn || !nav) return;
  btn.addEventListener('click', () => nav.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (!btn.contains(e.target) && !nav.contains(e.target)) nav.classList.remove('open');
  });
}
