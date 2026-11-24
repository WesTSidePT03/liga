'use strict';
/* LIGA — protótipo de videointerpretação em LGP (app para PC).
   Interface sem dependências externas: o estado vive em objetos simples e
   cada alteração volta a desenhar o ecrã ativo. */

const raiz = document.getElementById('root');

/* ---------------- utilitários ---------------- */
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmt = (x) => String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0');
const acao = (nome, ...args) => `data-on="${esc([nome, ...args].join('|'))}"`;
const pressed = (b) => `aria-pressed="${b ? 'true' : 'false'}"`;
const se = (cond, html) => (cond ? html : '');
const cada = (lista, fn) => lista.map(fn).join('');

const ICONES = {
  definicoes: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"></path>',
  casa: '<path d="M3 10.5L12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"></path>',
  relogio: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
  pessoa: '<circle cx="12" cy="8" r="4"></circle><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"></path>',
  seta: '<path d="M9 18l6-6-6-6"></path>',
  voltar: '<path d="M15 18l-6-6 6-6"></path>',
  video: '<path d="M23 7l-7 5 7 5V7z"></path><rect x="1" y="5" width="15" height="14" rx="2"></rect>',
  semVideo: '<path d="M1 1l22 22"></path><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5 0h4a2 2 0 0 1 2 2v3.3l1 1L23 7v10"></path>',
  chat: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>',
  desligar: '<path d="M3 15.5c5-4.7 13-4.7 18 0l-2.4 2.4a1 1 0 0 1-1.3.1l-2.3-1.6a1 1 0 0 1-.4-.9l.2-1.8a12 12 0 0 0-5.6 0l.2 1.8a1 1 0 0 1-.4.9L6.7 18a1 1 0 0 1-1.3-.1z"></path>',
  visto: '<path d="M20 6L9 17l-5-5"></path>',
  calendario: '<rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path>',
  calendarioOk: '<rect x="3" y="4" width="18" height="18" rx="2"></rect><path d="M16 2v4M8 2v4M3 10h18"></path><path d="M9 16l2 2 4-4"></path>',
  aviso: '<path d="M12 9v4M12 17h.01"></path><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"></path>',
  mao: '<path d="M18 11V6a2 2 0 0 0-4 0v5"></path><path d="M14 10V4a2 2 0 0 0-4 0v6"></path><path d="M10 10.5V6a2 2 0 0 0-4 0v8"></path><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15"></path>',
  fechar: '<path d="M18 6L6 18M6 6l12 12"></path>',
  enviar: '<path d="M22 2L11 13"></path><path d="M22 2l-7 20-4-9-9-4z"></path>',
  sino: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.7 21a2 2 0 0 1-3.4 0"></path>',
  grupo: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"></path>',
  reforco: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M19 8v6M22 11h-6"></path>',
  cafe: '<path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><path d="M6 1v3M10 1v3M14 1v3"></path>',
  ecra: '<rect x="2" y="3" width="20" height="14" rx="2"></rect><path d="M8 21h8M12 17v4"></path>',
  telemovel: '<rect x="6" y="2" width="12" height="20" rx="2"></rect><path d="M11 18h2"></path>',
  ponte: '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>',
  saude: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7z"></path><path d="M3.2 12h4.3l1.5-3 3 6 1.5-3h7.3"></path>',
  banco: '<path d="M3 22h18"></path><path d="M6 18v-7M10 18v-7M14 18v-7M18 18v-7"></path><path d="M12 2l9 5H3z"></path>',
  publico: '<rect x="4" y="2" width="16" height="20" rx="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01M12 6h.01M16 6h.01M8 10h.01M12 10h.01M16 10h.01M8 14h.01M12 14h.01M16 14h.01"></path>',
  carro: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-2.7-3.6A2 2 0 0 0 13.7 6H8.3a2 2 0 0 0-1.6.8L4 10l-1.6.6A2 2 0 0 0 1 12.5V16c0 .6.4 1 1 1h2"></path><circle cx="7" cy="17" r="2"></circle><circle cx="17" cy="17" r="2"></circle><path d="M9 17h6"></path>',
  telefone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"></path>',
  escudo: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>',
  raio: '<path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>'
};
/* logótipo: elo (ligação) dentro de um quadrado arredondado */
const logo = (tam) => `<img class="logo" src="logo-mao.png" alt="" aria-hidden="true" width="${tam}" height="${tam}" style="width:${tam}px;height:${tam}px;border-radius:${Math.round(tam * 0.28)}px">`;
const marca = (tam, sub) => `<span class="marca">${logo(tam)}<span class="marca-txt"><span class="marca-nome" style="font-size:${Math.round(tam * 0.62)}px">LIGA</span>${sub ? '<span class="marca-sub">Linha de Interpretação Gestual Acessível</span>' : ''}</span></span>`;
const ic = (nome, tam = 24, extra = '') =>
  `<svg aria-hidden="true" width="${tam}" height="${tam}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${extra}>${ICONES[nome]}</svg>`;
const estrela = (cheia) =>
  `<svg aria-hidden="true" width="34" height="34" viewBox="0 0 24 24" fill="${cheia ? '#E8A317' : 'none'}" stroke="${cheia ? '#9A6412' : '#6B7A77'}" stroke-width="1.8" stroke-linejoin="round"><path d="M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2 6.4 20.2l1.1-6.3L2.9 9.5l6.3-.9z"></path></svg>`;

/* ---------------- dados partilhados ---------------- */
const GLOSSARIO = {
  'Banco': ['IBAN', 'NIF', 'Cartão de débito', 'Código PIN', 'Transferência'],
  'Saúde': ['Número de utente', 'Médico de família', 'Receita', 'Análises'],
  'Táxi e transportes': ['Morada de recolha', 'Hora', 'Nº de passageiros'],
  'Serviços públicos': ['NIF', 'IRS', 'Cartão de Cidadão', 'Chave Móvel Digital'],
  'Outro número': ['Nome do contacto', 'Assunto']
};

/* =================================================================
   ESTADO GLOBAL
   ================================================================= */
const app = { vista: 'menu' };

const U = {
  ecra: 'boasvindas', tab: 'inicio', destino: '', fila: 2, seg: 0, legIdx: 0,
  chat: false, nota: 0, tags: {},
  msgs: [{ eu: false, texto: 'Olá! Pode escrever aqui se preferir confirmar algum número ou nome.' }],
  rascunho: '', interpreteEscreve: false,
  termos: false, novidades: false, avisoTermos: false,
  legendas: true, vibrar: true, textoGrande: false,
  agDestino: 'Saúde', agDia: 'Amanhã', agHora: '10:00', agendamento: null,
  historico: [
    { destino: 'Saúde', data: '28 out · 10:12', dur: '06:04' },
    { destino: 'Táxi e transportes', data: '25 out · 18:40', dur: '02:31' },
    { destino: 'Banco', data: '19 out · 15:05', dur: '09:47' }
  ],
  t: {}
};

const C = {
  tab: 'atendimento', disponivel: true, fase: 'livre', ativo: null, voz: 'idle', mudo: false,
  seg: 0, trIdx: 0, tick: 0, atendidas: 7, nextId: 4,
  categoria: '', resolvido: '', tecnico: false,
  pausaSeg: 0, ultimoNovo: -99, msgsUser: [], rascunho: '', aEscrever: false,
  supervisor: false, reforco: false, emergencia: false, passos: {}, prepId: null, notas: '', prepNotas: '',
  fila: [
    { id: 1, nome: 'Utilizador #4821', destino: 'Banco', motivo: 'Cartão bloqueado', esperaSeg: 104, primeira: false },
    { id: 2, nome: 'Utilizador #3307', destino: 'Saúde', motivo: 'Marcar consulta', esperaSeg: 58, primeira: true },
    { id: 3, nome: 'Utilizador #5190', destino: 'Táxi e transportes', motivo: 'Pedir táxi', esperaSeg: 21, primeira: false }
  ],
  t: {}
};

const limpa = (obj, ...nomes) => nomes.forEach((n) => { clearTimeout(obj.t[n]); delete obj.t[n]; });

/* =================================================================
   CÂMARAS
   Cada parte (utilizador U e intérprete C) liga ou desliga a sua câmara.
   Neste protótipo as duas partes estão no mesmo computador, por isso
   partilham a mesma câmara física: cada lado vê a sua imagem pequena e a
   da outra parte em grande, tal como numa videochamada real.
   ================================================================= */
const cam = { stream: null, erro: '', aPedir: false, U: false, C: false };
const videos = {};

async function obterCamara() {
  if (cam.stream) return true;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    cam.erro = 'Este navegador não permite usar a câmara.';
    return false;
  }
  cam.aPedir = true; desenha();
  try {
    cam.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
    cam.erro = '';
    cam.stream.getVideoTracks().forEach((t) => t.addEventListener('ended', () => { cam.stream = null; cam.U = false; cam.C = false; cam.erro = 'A câmara foi desligada ou ficou indisponível.'; desenha(); }));
    return true;
  } catch (e) {
    const n = e && e.name;
    cam.erro = n === 'NotAllowedError' ? 'O acesso à câmara foi recusado. Autorize a câmara quando o pedido aparecer, ou nas definições do Windows (Privacidade › Câmara).'
      : n === 'NotFoundError' || n === 'OverconstrainedError' ? 'Não foi encontrada nenhuma câmara neste computador.'
      : n === 'NotReadableError' ? 'A câmara está a ser usada por outro programa. Feche-o e tente de novo.'
      : 'Não foi possível ligar a câmara.';
    return false;
  } finally {
    cam.aPedir = false;
  }
}

function libertaCamara() {
  if (cam.U || cam.C || !cam.stream) return;
  cam.stream.getTracks().forEach((t) => t.stop());
  cam.stream = null;
  Object.values(videos).forEach((v) => { v.srcObject = null; });
}

async function alternaCamara(lado) {
  if (cam[lado]) { cam[lado] = false; libertaCamara(); return; }
  if (await obterCamara()) cam[lado] = true;
}

/* desenho: um <video> por posição, reaproveitado entre redesenhos para não piscar */
const camLigada = (lado) => cam[lado] && !!cam.stream;
const slotCam = (chave, espelho, rotulo, fonte) =>
  `<div class="cam-slot${espelho ? ' espelho' : ''}" data-cam-slot="${chave}" data-fonte="${fonte || 'local'}"></div>${rotulo ? `<span class="cam-rotulo">${rotulo}</span>` : ''}`;

/* =================================================================
   LIGAÇÃO REAL ENTRE APARELHOS
   - Pedidos, mensagens e avisos passam por um serviço público de
     mensagens (MQTT sobre WebSocket seguro), que funciona em qualquer
     rede porque os dois aparelhos só falam com o servidor.
   - O vídeo é uma ligação direta (WebRTC, via PeerJS, com servidores
     STUN/TURN). Se a rede a bloquear, a chamada continua por mensagens.
   A consola fica disponível com um código (ex.: K7M2QX); o telemóvel
   liga-se a esse código. Sem internet, a app funciona em demonstração.
   ================================================================= */
const LS = {
  get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sem armazenamento */ } }
};
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const novoCodigo = () => Array.from({ length: 6 }, () => ALFABETO[Math.floor(Math.random() * ALFABETO.length)]).join('');
const limpaCodigo = (s) => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
const aleatorio = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
const BROKERS = ['wss://broker.emqx.io:8084/mqtt', 'wss://broker.hivemq.com:8884/mqtt'];
const topico = (cod) => 'liga-pt/v2/' + cod;
const PEER_CFG = { config: { iceServers: [
  { urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478' },
  { urls: ['turn:eu-0.turn.peerjs.com:3478', 'turn:us-0.turn.peerjs.com:3478'], username: 'peerjs', credential: 'peerjsp' }
] } };

const real = {
  meuCodigo: '', redeC: null, peerC: null, estadoC: 'off', erroC: '',
  codigo: limpaCodigo(LS.get('liga.codigo')), uid: aleatorio(), redeU: null, peerU: null, estadoU: 'off', erroU: '', consolaOnline: null,
  chamada: null, remoto: null, qr: {}
};
const redeDisponivel = () => !!(window.mqtt && typeof window.mqtt.connect === 'function');
const peerDisponivel = () => typeof window.Peer === 'function';
const sobreHttps = () => location.protocol === 'https:';

function streamVazio() {
  const c = document.createElement('canvas'); c.width = 320; c.height = 240;
  const g = c.getContext('2d'); g.fillStyle = '#1E2B29'; g.fillRect(0, 0, 320, 240);
  return c.captureStream ? c.captureStream(1) : new MediaStream();
}
const textoSeguro = (v, max) => String(v == null ? '' : v).slice(0, max);

/* liga-se aos dois servidores ao mesmo tempo (se um falhar, o outro serve); mensagens repetidas são ignoradas */
function criaRede(topicos, aoReceber, will, aoLigar) {
  const r = { clientes: [], vistos: new Set(), ligado: false, onEstado: null };
  const atualiza = () => { const l = r.clientes.some((c) => c.connected); if (l !== r.ligado) { r.ligado = l; if (r.onEstado) r.onEstado(); } };
  BROKERS.forEach((url) => {
    let c;
    try { c = window.mqtt.connect(url, { clientId: 'liga_' + aleatorio(), clean: true, connectTimeout: 10000, reconnectPeriod: 3000, keepalive: 30, will }); } catch (e) { return; }
    c.on('connect', () => { c.subscribe(topicos, { qos: 1 }); if (aoLigar) aoLigar(c); atualiza(); });
    c.on('close', atualiza); c.on('offline', atualiza); c.on('error', () => {});
    c.on('message', (t, payload) => {
      let d; try { d = JSON.parse(payload.toString()); } catch (e) { return; }
      if (!d || typeof d !== 'object' || !d.mid || r.vistos.has(d.mid)) return;
      r.vistos.add(d.mid); aoReceber(t, d);
    });
    r.clientes.push(c);
  });
  r.envia = (t, obj, opts) => {
    const txt = JSON.stringify(Object.assign({ mid: aleatorio() }, obj));
    r.clientes.forEach((c) => { if (c.connected) { try { c.publish(t, txt, Object.assign({ qos: 1 }, opts || {})); } catch (e) { /* tenta no outro */ } } });
  };
  r.fecha = () => r.clientes.forEach((c) => { try { c.end(true); } catch (e) { /* já fechado */ } });
  return r;
}

/* ---------- lado do intérprete ---------- */
function iniciaConsolaReal() {
  if (!redeDisponivel() || real.redeC) return;
  if (!real.meuCodigo) { real.meuCodigo = limpaCodigo(LS.get('liga.meuCodigo')) || novoCodigo(); LS.set('liga.meuCodigo', real.meuCodigo); }
  const b = topico(real.meuCodigo);
  real.estadoC = 'a-ligar'; real.erroC = '';
  const will = { topic: b + '/estado', payload: JSON.stringify({ mid: 'off-' + aleatorio(), online: false }), retain: true, qos: 1 };
  const rede = criaRede([b + '/consola'], (t, d) => recebeC(d), will,
    (c) => c.publish(b + '/estado', JSON.stringify({ mid: 'on-' + aleatorio(), online: true }), { retain: true, qos: 1 }));
  real.redeC = rede;
  rede.onEstado = () => { if (real.redeC !== rede) return; real.estadoC = rede.ligado ? 'pronto' : 'a-ligar'; if (rede.ligado) real.erroC = ''; desenha(); };
  setTimeout(() => { if (real.redeC === rede && !rede.ligado) { real.estadoC = 'erro'; real.erroC = 'Sem ligação ao serviço de mensagens. Verifique a internet ou experimente outra rede.'; desenha(); } }, 15000);
  if (peerDisponivel() && !real.peerC) {
    const p = new window.Peer(PEER_CFG);
    real.peerC = p;
    p.on('error', () => {});
    p.on('disconnected', () => { if (real.peerC === p && !p.destroyed) { try { p.reconnect(); } catch (e) { /* tenta mais tarde */ } } });
  }
}
function novoCodigoConsola() {
  if (real.redeC) { try { real.redeC.envia(topico(real.meuCodigo) + '/estado', { online: false }, { retain: true }); } catch (e) { /* ignora */ } setTimeout(((r) => () => r.fecha())(real.redeC), 500); }
  real.redeC = null;
  C.fila = C.fila.filter((x) => !x.real);
  real.meuCodigo = novoCodigo(); LS.set('liga.meuCodigo', real.meuCodigo);
  iniciaConsolaReal();
}
function recebeC(d) {
  const de = textoSeguro(d.de, 40);
  if (!de) return;
  const id = 'r-' + de;
  const ativo = C.ativo && C.ativo.id === id;
  if (d.tipo === 'pedido') {
    const item = C.fila.find((x) => x.id === id);
    if (item) { item.ultimo = Date.now(); if (d.peerId) item.peerId = textoSeguro(d.peerId, 80); }
    else if (!ativo) {
      C.fila.unshift({ id, real: true, uid: de, peerId: textoSeguro(d.peerId, 80), nome: textoSeguro(d.nome, 40) || 'Utilizador da app', destino: textoSeguro(d.destino, 40) || 'Outro número', motivo: 'Pedido feito na app', esperaSeg: 0, primeira: false, ultimo: Date.now() });
      C.ultimoNovo = C.tick;
    } else if (d.peerId && !C.ativo.peerId) { C.ativo.peerId = textoSeguro(d.peerId, 80); }
    if (real.redeC) real.redeC.envia(topico(real.meuCodigo) + '/u/' + de, { tipo: ativo ? 'atendido' : 'recebido' });
  } else if (d.tipo === 'msg') {
    if (ativo) { C.msgsUser.push({ eu: false, texto: textoSeguro(d.texto, 500) }); C.aEscrever = false; }
  } else if (d.tipo === 'cancelar') {
    C.fila = C.fila.filter((x) => x.id !== id);
  } else if (d.tipo === 'fim') {
    fimConsolaReal(id);
  } else if (d.tipo === 'peer' && ativo && d.peerId) {
    C.ativo.peerId = textoSeguro(d.peerId, 80);
  }
  desenha();
}
function fechaChamadaReal() {
  if (real.chamada) { try { real.chamada.close(); } catch (e) { /* já fechada */ } }
  real.chamada = null; real.remoto = null;
}
function fimConsolaReal(id) {
  if (!(C.ativo && C.ativo.id === id && C.fase === 'chamada')) return;
  fechaChamadaReal();
  limpa(C, 'v', 'r', 'video');
  C.fase = 'fecho'; C.emergencia = false; C.aEscrever = false; cam.C = false; libertaCamara();
}
function enviaC(obj) {
  if (!(C.ativo && C.ativo.real && real.redeC)) return;
  real.redeC.envia(topico(real.meuCodigo) + '/u/' + C.ativo.uid, obj);
}
/* vídeo: o intérprete liga para o telemóvel; se não ligar em 20 s, avisa e continua por mensagens */
function ligaVideoC(c) {
  if (!(real.peerC && c.peerId && C.ativo === c && C.fase === 'chamada')) return;
  fechaChamadaReal();
  const call = real.peerC.call(c.peerId, cam.stream || streamVazio());
  if (!call) return;
  real.chamada = call;
  call.on('stream', (s) => { if (real.chamada === call) { real.remoto = s; C.semVideo = false; desenha(); } });
  call.on('close', () => { if (real.chamada === call) { real.chamada = null; real.remoto = null; desenha(); } });
  call.on('error', () => {});
  limpa(C, 'video');
  C.t.video = setTimeout(() => { if (C.ativo === c && C.fase === 'chamada' && !real.remoto) { C.semVideo = true; desenha(); } }, 20000);
}

/* ---------- lado do utilizador ---------- */
function iniciaUtilizadorReal() {
  if (!redeDisponivel() || real.redeU || !real.codigo) return;
  const b = topico(real.codigo);
  real.estadoU = 'a-ligar'; real.erroU = ''; real.consolaOnline = null;
  const rede = criaRede([b + '/u/' + real.uid, b + '/estado'], (t, d) => recebeU(t, d));
  real.redeU = rede;
  rede.onEstado = () => { if (real.redeU !== rede) return; real.estadoU = rede.ligado ? 'pronto' : 'a-ligar'; if (rede.ligado) real.erroU = ''; desenha(); };
  setTimeout(() => { if (real.redeU === rede && !rede.ligado) { real.estadoU = 'erro'; real.erroU = 'Sem ligação ao serviço de mensagens. Verifique a internet ou experimente outra rede.'; desenha(); } }, 15000);
  if (peerDisponivel() && !real.peerU) {
    const p = new window.Peer(PEER_CFG);
    real.peerU = p;
    p.on('open', (id) => { if (U.real) enviaU({ tipo: 'peer', peerId: id }); });
    p.on('call', atendeChamadaU);
    p.on('error', () => {});
    p.on('disconnected', () => { if (real.peerU === p && !p.destroyed) { try { p.reconnect(); } catch (e) { /* tenta mais tarde */ } } });
  }
}
function mudaCodigoUtilizador(cod) {
  real.codigo = limpaCodigo(cod); LS.set('liga.codigo', real.codigo);
  if (real.redeU) { const r = real.redeU; setTimeout(() => r.fecha(), 300); }
  real.redeU = null; real.estadoU = 'off'; real.erroU = ''; real.consolaOnline = null;
  iniciaUtilizadorReal();
}
const modoRealU = () => !!(real.codigo && real.redeU && real.estadoU === 'pronto');
function enviaU(obj) {
  if (!(real.redeU && real.codigo)) return;
  real.redeU.envia(topico(real.codigo) + '/consola', Object.assign({ de: real.uid }, obj));
}
function recebeU(t, d) {
  if (t.slice(-7) === '/estado') { real.consolaOnline = !!d.online; desenha(); return; }
  if (!U.real) return;
  if (d.tipo === 'recebido') { U.entregue = true; }
  else if (d.tipo === 'atendido') {
    U.entregue = true;
    if (!U.atendido) {
      U.atendido = true;
      limpa(U, 'pedido');
      // passa já para o ecrã da chamada (mensagens funcionam mesmo sem vídeo)
      U.ecra = 'chamada'; U.seg = 0; U.legendas = false;
      obterCamara().then((ok) => { if (ok) cam.U = true; desenha(); });
      limpa(U, 'video');
      U.t.video = setTimeout(() => { if (U.real && U.ecra === 'chamada' && !real.remoto) { U.semVideo = true; desenha(); } }, 20000);
    }
  }
  else if (d.tipo === 'msg') { U.msgs.push({ eu: false, texto: textoSeguro(d.texto, 500) }); U.interpreteEscreve = false; }
  else if (d.tipo === 'fim' && (U.ecra === 'chamada' || U.ecra === 'ligar')) { terminaU(false); }
  desenha();
}

async function atendeChamadaU(call) {
  if (!(U.real && (U.ecra === 'ligar' || U.ecra === 'chamada'))) { try { call.close(); } catch (e) { /* ignora */ } return; }
  if (real.chamada && real.chamada !== call) { try { real.chamada.close(); } catch (e) { /* ignora */ } }
  real.chamada = call;
  if (!cam.stream && await obterCamara()) cam.U = true;
  call.answer(cam.stream || streamVazio());
  call.on('stream', (s) => { if (real.chamada === call) { real.remoto = s; U.semVideo = false; desenha(); } });
  call.on('close', () => { if (real.chamada === call) { real.chamada = null; real.remoto = null; desenha(); } });
  call.on('error', () => {});
  if (U.ecra !== 'chamada') { U.ecra = 'chamada'; U.seg = 0; U.legendas = false; }
  desenha();
}
function terminaU(avisar) {
  if (U.real) {
    if (avisar) enviaU({ tipo: 'fim' });
    fechaChamadaReal();
  }
  limpa(U, 'r', 'pedido', 'video');
  U.historico.unshift({ destino: U.destino, data: 'Hoje · agora', dur: fmt(U.seg) });
  U.ecra = 'fim'; U.chat = false; U.interpreteEscreve = false; U.real = false; U.semVideo = false;
  cam.U = false; libertaCamara();
}

function colocaVideos() {
  raiz.querySelectorAll('[data-cam-slot]').forEach((slot) => {
    const chave = slot.dataset.camSlot;
    let v = videos[chave];
    if (!v) {
      v = document.createElement('video');
      v.muted = true; v.autoplay = true; v.playsInline = true;
      v.setAttribute('aria-hidden', 'true');
      videos[chave] = v;
    }
    const fonte = slot.dataset.fonte === 'remoto' ? real.remoto : cam.stream;
    if (v.srcObject !== fonte) v.srcObject = fonte;
    slot.appendChild(v);
    if (v.paused) v.play().catch(() => {});
  });
}

/* =================================================================
   AÇÕES
   ================================================================= */
const A = {
  /* ---- navegação geral ---- */
  irMenu() { app.vista = 'menu'; LS.set('liga.vista', 'menu'); },
  irConsola() { app.vista = 'consola'; LS.set('liga.vista', 'consola'); iniciaConsolaReal(); },
  irUtilizador() { app.vista = 'utilizador'; LS.set('liga.vista', 'utilizador'); iniciaUtilizadorReal(); },

  /* ---- utilizador ---- */
  uComecar() { U.ecra = 'registo'; },
  uVoltarBV() { U.ecra = 'boasvindas'; },
  uConsent(k) { U[k] = !U[k]; U.avisoTermos = false; },
  uCriarConta() { if (!U.termos) { U.avisoTermos = true; return; } U.ecra = 'app'; U.tab = 'inicio'; },
  uSemConta() { U.ecra = 'app'; U.tab = 'inicio'; },
  uTab(t) { U.ecra = 'app'; U.tab = t; },
  uLigar(nome) {
    limpa(U, 'a', 'b', 'r');
    Object.assign(U, { ecra: 'ligar', destino: nome, fila: 2, seg: 0, legIdx: 0, chat: false, nota: 0, tags: {}, interpreteEscreve: false, real: false });
    U.msgs = [{ eu: false, texto: 'Olá! Pode escrever aqui se preferir confirmar algum número ou nome.' }];
    if (modoRealU()) {
      Object.assign(U, { real: true, entregue: false, atendido: false, semVideo: false });
      real.erroU = '';
      const pedido = () => { if (U.real && U.ecra === 'ligar' && !U.atendido) { enviaU({ tipo: 'pedido', destino: nome, nome: U.nome || '', peerId: real.peerU && real.peerU.id }); U.t.pedido = setTimeout(pedido, 3000); } };
      pedido();
      return;
    }
    U.t.a = setTimeout(() => { U.fila = 1; desenha(); }, 1300);
    U.t.b = setTimeout(() => { U.ecra = 'chamada'; desenha(); }, 2700);
  },
  uCancelar() {
    limpa(U, 'a', 'b');
    limpa(U, 'pedido', 'video');
    if (U.real) { enviaU({ tipo: 'cancelar' }); fechaChamadaReal(); }
    U.real = false; U.ecra = 'app'; U.tab = 'inicio'; cam.U = false; libertaCamara();
  },
  uAgendar() { U.ecra = 'agendar'; },
  uChip(chave, valor) { U[chave] = valor; },
  uConfirmarAg() { U.agendamento = resumoAg(); U.ecra = 'agendado'; aviso('Agendamento confirmado'); },
  uOpcao(k) { U[k] = !U[k]; },
  uChat() { U.chat = !U.chat; },
  async uCamara() { await alternaCamara('U'); desenha(); },
  uLegendas() { U.legendas = !U.legendas; },
  uRapida(texto) { U.msgs.push({ eu: true, texto }); if (U.real) enviaU({ tipo: 'msg', texto }); },
  uEnviar() {
    const texto = U.rascunho.trim();
    if (!texto) return;
    U.msgs.push({ eu: true, texto }); U.rascunho = '';
    if (U.real) { enviaU({ tipo: 'msg', texto }); return; }
    U.interpreteEscreve = true;
    limpa(U, 'r');
    U.t.r = setTimeout(() => { U.interpreteEscreve = false; U.msgs.push({ eu: false, texto: 'Recebido! Vou transmitir agora.' }); desenha(); }, 2000);
  },
  uTerminar() { terminaU(true); },
  uGuardarCodigo() { mudaCodigoUtilizador(U.codigoRascunho != null ? U.codigoRascunho : real.codigo); U.codigoRascunho = null; U.codigoGuardado = true; aviso(real.codigo ? 'Código guardado · a ligar à consola' : 'Modo demonstração'); },
  uTirarCodigo() { mudaCodigoUtilizador(''); U.codigoRascunho = ''; },
  uNota(n) { U.nota = Number(n); },
  uTag(t) { U.tags[t] = !U.tags[t]; },
  uVoltar() { Object.assign(U, { ecra: 'app', tab: 'inicio', destino: '', nota: 0, tags: {} }); },

  /* ---- consola ---- */
  cTab(t) { C.tab = t; },
  cEstado() { C.disponivel = !C.disponivel; C.pausaSeg = 0; },
  async cAtender(id) {
    const c = C.fila.find((x) => String(x.id) === String(id));
    if (!c) return;
    Object.assign(C, { fase: 'chamada', ativo: c, voz: 'idle', mudo: false, seg: 0, trIdx: 0, msgsUser: [], supervisor: false, reforco: false, passos: {}, rascunho: '', aEscrever: false, notas: '' });
    C.fila = C.fila.filter((x) => x.id !== c.id);
    C.semVideo = false;
    if (c.real) {
      enviaC({ tipo: 'atendido' });
      desenha();
      if (await obterCamara()) cam.C = true;
      if (!(C.ativo === c && C.fase === 'chamada')) return;
      ligaVideoC(c);
      // se o telemóvel ainda não tinha o vídeo pronto, tenta de novo quando chegar o identificador
      limpa(C, 'repete');
      const repete = (n) => { C.t.repete = setTimeout(() => { if (C.ativo === c && C.fase === 'chamada' && !real.remoto && n > 0) { ligaVideoC(c); repete(n - 1); } }, 6000); };
      repete(3);
    }
  },
  cLigar() { C.voz = 'ringing'; limpa(C, 'v'); C.t.v = setTimeout(() => { if (C.voz === 'ringing') { C.voz = 'on'; desenha(); } }, 1500); },
  cMudo() { C.mudo = !C.mudo; },
  cEspera() { C.voz = C.voz === 'hold' ? 'on' : 'hold'; },
  cTerminar() {
    if (C.ativo && C.ativo.real) { enviaC({ tipo: 'fim' }); fechaChamadaReal(); }
    limpa(C, 'v', 'r', 'video', 'repete'); C.fase = 'fecho'; C.emergencia = false; C.aEscrever = false; cam.C = false; libertaCamara();
  },
  cNovoCodigo() { novoCodigoConsola(); aviso('Novo código criado'); },
  async cCamara() { await alternaCamara('C'); desenha(); },
  cChip(chave, valor) { C[chave] = valor; },
  cTecnico() { C.tecnico = !C.tecnico; },
  cConcluir(pausa) {
    Object.assign(C, { fase: 'livre', ativo: null, voz: 'idle', categoria: '', resolvido: '', tecnico: false, atendidas: C.atendidas + 1, pausaSeg: 0 });
    if (pausa === '1') C.disponivel = false;
    aviso(pausa === '1' ? 'Chamada registada · em pausa' : 'Chamada registada');
  },
  cRapida(texto) { C.msgsUser.push({ eu: true, texto }); if (C.ativo && C.ativo.real) enviaC({ tipo: 'msg', texto }); },
  cEnviar() {
    const texto = C.rascunho.trim();
    if (!texto) return;
    C.msgsUser.push({ eu: true, texto }); C.rascunho = '';
    if (C.ativo && C.ativo.real) { enviaC({ tipo: 'msg', texto }); return; }
    C.aEscrever = true;
    limpa(C, 'r');
    C.t.r = setTimeout(() => {
      if (C.fase !== 'chamada') return;
      C.aEscrever = false; C.msgsUser.push({ eu: false, texto: 'Ok, percebi. Obrigado!' }); desenha();
    }, 2200);
  },
  cSupervisor() { C.supervisor = !C.supervisor; if (C.supervisor) aviso('Supervisor notificado'); },
  cReforco() { C.reforco = !C.reforco; if (C.reforco) aviso('Pedido de reforço enviado'); },
  cAviso(texto) { aviso(texto); },
  cEmergencia() { C.emergencia = true; C.supervisor = true; },
  cFecharEmergencia() { C.emergencia = false; },
  cPasso(i) { C.passos[i] = !C.passos[i]; },
  cPrep(i) { i = Number(i); C.prepId = C.prepId === i ? null : i; }
};

/* =================================================================
   VISTA: MENU
   ================================================================= */
function vMenu() {
  const recurso = (icone, titulo, texto) => `
    <li class="recurso"><span class="recurso-ic" aria-hidden="true">${ic(icone, 22)}</span><span><strong>${titulo}</strong><br><span style="color:var(--suave)">${texto}</span></span></li>`;
  return `
  <main class="menu">
    <header class="menu-topo">${marca(96, true)}<span class="selo" style="background:var(--acc-claro);color:var(--acc-escuro)">Protótipo · v1.0</span></header>
    <section class="menu-heroi">
      <div class="menu-texto">
        <p class="sobretitulo">Videointerpretação em Língua Gestual Portuguesa</p>
        <h1 class="menu-h1">Qualquer serviço, na sua língua.</h1>
        <p class="menu-lead">A LIGA liga pessoas surdas a um intérprete de LGP por videochamada. O intérprete acompanha a conversa com o serviço público e traduz em tempo real.</p>
        <ul class="recursos">
          ${recurso('video', 'Videochamada em LGP', 'Câmara dos dois lados, em direto')}
          ${recurso('chat', 'Mensagens escritas', 'Para confirmar números, nomes e datas')}
          ${recurso('calendario', 'Agendamento', 'Marque um intérprete para mais tarde')}
          ${recurso('escudo', 'Privacidade', 'Chamadas não gravadas, notas apagadas no fim')}
        </ul>
      </div>
      <div class="menu-cartoes">
        <button class="menu-cartao" ${acao('irUtilizador')}>
          <span class="menu-cartao-ic" aria-hidden="true">${ic('telemovel', 28)}</span>
          <span class="menu-cartao-tit">Sou utilizador surdo</span>
          <span class="menu-cartao-txt">Abrir a app: escolher o serviço, ligar ao intérprete, agendar e ver o histórico.</span>
          <span class="menu-cartao-acao">Abrir a app ${ic('seta', 18)}</span>
        </button>
        <button class="menu-cartao" ${acao('irConsola')}>
          <span class="menu-cartao-ic" aria-hidden="true">${ic('ecra', 28)}</span>
          <span class="menu-cartao-tit">Sou intérprete</span>
          <span class="menu-cartao-txt">Abrir a consola: fila de chamadas, vídeo com o utilizador, mensagens e protocolo de emergência.</span>
          <span class="menu-cartao-acao">Abrir a consola ${ic('seta', 18)}</span>
        </button>
      </div>
    </section>
    <footer class="menu-rodape">LIGA — Linha de Interpretação Gestual Acessível · Protótipo académico · Os dados apresentados são de demonstração</footer>
  </main>`;
}

/* =================================================================
   VISTA: UTILIZADOR (telemóvel)
   ================================================================= */
const resumoAg = () => U.agDestino + ' · ' + U.agDia + ', ' + U.agHora;
const tamTitulo = () => (U.textoGrande ? '32px' : '28px');
const tamCorpo = () => (U.textoGrande ? '20px' : '17px');
const LEGENDAS = [
  'Bom dia, fala com o apoio ao cliente. Em que posso ajudar?',
  'Certo. Pode indicar-me o seu nome completo, por favor?',
  'Obrigado. Vou verificar no sistema, um momento.',
  'Já está resolvido. Precisa de mais alguma coisa?'
];
const DESTINOS = [
  { letra: 'S', icone: 'saude', nome: 'Saúde', desc: 'Centro de saúde, hospital, farmácia' },
  { letra: 'B', icone: 'banco', nome: 'Banco', desc: 'Apoio ao cliente do seu banco' },
  { letra: 'P', icone: 'publico', nome: 'Serviços públicos', desc: 'Finanças, Segurança Social, Câmara' },
  { letra: 'T', icone: 'carro', nome: 'Táxi e transportes', desc: 'Pedir táxi, horários, reservas' },
  { letra: '#', icone: 'telefone', nome: 'Outro número', desc: 'Família, amigos, empregador' }
];

const emTelemovel = () => window.innerWidth < 600;

function vUtilizador() {
  const ecras = { boasvindas: uBoasVindas, registo: uRegisto, app: uApp, agendar: uAgendar, agendado: uAgendado, ligar: uLigar, chamada: uChamada, fim: uFim };
  if (emTelemovel()) return `<div class="tel tel-movel">${ecras[U.ecra]()}</div>`;
  return `
  <div class="u-palco">
    <div class="u-barra">
      <button class="btn" ${acao('irMenu')}>${ic('voltar', 20)} Menu</button>
      <span class="etq" style="text-align:center">App do utilizador · pré-visualização de telemóvel<br>Neste protótipo, as duas partes usam a câmara deste computador</span>
      <button class="btn" ${acao('irConsola')}>${ic('ecra', 20)} Consola</button>
    </div>
    <div class="moldura"><div class="tel">${ecras[U.ecra]()}</div></div>
  </div>`;
}

function uBoasVindas() {
  const passo = (n, t) => `
    <div style="display:flex;gap:14px;align-items:flex-start">
      <span aria-hidden="true" style="flex:none;width:36px;height:36px;border-radius:18px;background:var(--acc-claro);color:var(--acc);display:flex;align-items:center;justify-content:center;font-weight:700">${n}</span>
      <span style="font-size:16px;line-height:1.45;padding-top:6px">${t}</span>
    </div>`;
  return `
  <div class="scr" style="padding:48px 28px 28px;gap:22px;overflow:auto">
    <div style="display:flex;align-items:center;gap:12px">
      <img src="logo-liga.jpg" alt="LIGA — Linha de Interpretação Gestual Acessível" width="240" height="240" style="width:240px;height:240px;align-self:center;border-radius:40px;box-shadow:0 8px 24px rgba(0,80,95,.18)">
    </div>
    <h1 style="font-size:30px;line-height:1.15">Fale com qualquer pessoa, na sua língua.</h1>
    <p style="font-size:18px;line-height:1.5;color:var(--suave)">Um intérprete de Língua Gestual Portuguesa liga por si e traduz a conversa em tempo real.</p>
    <div style="display:flex;flex-direction:column;gap:18px">
      ${passo(1, 'Escolha para onde quer ligar')}${passo(2, 'Fale em LGP com o intérprete por vídeo')}${passo(3, 'O intérprete fala por voz com a outra pessoa')}
    </div>
    <div style="flex:1"></div>
    <button class="btn btn-acc btn-full" ${acao('uComecar')}>Começar</button>
    <span style="text-align:center;font-size:14px;color:var(--suave)">Serviço gratuito para pessoas surdas</span>
  </div>`;
}

function uRegisto() {
  const cons = [
    ['termos', 'Aceito os termos de utilização e a política de privacidade (obrigatório)'],
    ['novidades', 'Quero receber novidades sobre o serviço']
  ];
  return `
  <div class="scr">
    <header style="padding:52px 16px 8px;display:flex;align-items:center;gap:8px">
      <button class="voltar" aria-label="Voltar" ${acao('uVoltarBV')}>${ic('voltar')}</button>
    </header>
    <div style="flex:1;overflow:auto;padding:8px 24px 20px;display:flex;flex-direction:column;gap:20px">
      <h1 style="font-size:30px;line-height:1.15">Criar conta</h1>
      <button class="destino" style="min-height:64px;padding:10px 14px">
        <span aria-hidden="true" style="flex:none;width:44px;height:44px;border-radius:12px;background:var(--tinta);color:#fff;display:flex;align-items:center;justify-content:center"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg></span>
        <span style="display:flex;flex-direction:column;gap:2px"><span style="font-size:16px;font-weight:700">Ver explicação em LGP</span><span style="font-size:14px;color:var(--suave)">Vídeo de 1 minuto</span></span>
      </button>
      <div style="display:flex;flex-direction:column;gap:8px">
        <label for="reg-nome" style="font-size:16px;font-weight:700">Nome</label>
        <input id="reg-nome" class="campo" style="min-height:52px;font-size:17px" type="text" autocomplete="name" placeholder="Como quer ser tratado" data-bind="U.nome" value="${esc(U.nome)}">
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <label for="reg-tel" style="font-size:16px;font-weight:700">Telemóvel</label>
        <input id="reg-tel" class="campo" style="min-height:52px;font-size:17px" type="tel" autocomplete="tel" placeholder="9XX XXX XXX" data-bind="U.tel" value="${esc(U.tel)}">
        <span class="etq">Recebe um código por SMS para confirmar. Nunca ligamos para este número.</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${cada(cons, ([k, label]) => `
          <button ${acao('uConsent', k)} ${pressed(U[k])} style="display:flex;align-items:flex-start;gap:12px;min-height:48px;padding:6px 0;border:none;background:transparent;color:var(--tinta);text-align:left;font-size:15px;line-height:1.45">
            <span class="check" aria-hidden="true">${U[k] ? '✓' : ''}</span>${label}
          </button>`)}
      </div>
    </div>
    <div style="padding:14px 24px 32px;background:#fff;border-top:1px solid var(--linha);display:flex;flex-direction:column;gap:10px">
      <button class="btn btn-full ${U.termos ? 'btn-acc' : ''}" style="${U.termos ? '' : 'background:var(--linha);border-color:var(--linha);color:#3A4644'}" aria-disabled="${!U.termos}" ${acao('uCriarConta')}>Criar conta</button>
      ${se(U.avisoTermos, '<span role="alert" style="text-align:center;font-size:14px;color:#B42318">Aceite os termos e a política de privacidade para continuar.</span>')}
      <button ${acao('uSemConta')} style="min-height:44px;border:none;background:transparent;color:var(--tinta);font-size:15px;text-decoration:underline">Já tenho conta · Entrar</button>
    </div>
  </div>`;
}

function uApp() {
  const corpo = U.tab === 'historico' ? uHistorico() : U.tab === 'perfil' ? uPerfil() : uInicio();
  const nav = (t, icone, label) => `<button ${acao('uTab', t)} aria-current="${U.tab === t ? 'page' : 'false'}">${ic(icone)}${label}</button>`;
  return `
  <div class="scr">
    <div style="flex:1;min-height:0;display:flex;flex-direction:column">${corpo}</div>
    <nav class="nav" aria-label="Navegação principal">${nav('inicio', 'casa', 'Início')}${nav('historico', 'relogio', 'Histórico')}${nav('perfil', 'pessoa', 'Perfil')}</nav>
  </div>`;
}

function uInicio() {
  return `
    <header style="padding:56px 24px 14px;display:flex;flex-direction:column;gap:6px">
      <span style="font-size:15px;color:var(--suave)">Olá${U.nome ? ', ' + esc(U.nome) : ''}</span>
      <h1 style="font-size:${tamTitulo()};line-height:1.15">Com quem quer falar hoje?</h1>
    </header>
    <div style="flex:1;overflow:auto;padding:4px 24px 20px;display:flex;flex-direction:column;gap:12px">
      ${estadoLigacaoU()}
      ${se(U.agendamento, `
        <div style="padding:16px;border-radius:16px;background:var(--tinta);color:#fff;display:flex;flex-direction:column;gap:6px">
          <span style="font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#B9C7C4">Próximo agendamento</span>
          <span style="font-size:18px;font-weight:700">${esc(U.agendamento)}</span>
          <span style="font-size:14px;color:#DCE5E3">O intérprete liga-lhe à hora marcada.</span>
        </div>`)}
      ${cada(DESTINOS, (d) => `
        <button class="destino" ${acao('uLigar', d.nome)}>
          <span class="letra" aria-hidden="true">${ic(d.icone, 22)}</span>
          <span style="display:flex;flex-direction:column;gap:3px;flex:1">
            <span style="font-size:${tamCorpo()};font-weight:700">${d.nome}</span>
            <span style="font-size:14px;color:var(--suave)">${d.desc}</span>
          </span>
          <span style="color:var(--suave)">${ic('seta', 20)}</span>
        </button>`)}
      <button ${acao('uAgendar')} style="display:flex;align-items:center;justify-content:center;gap:10px;min-height:56px;border-radius:16px;border:2px dashed var(--linha-forte);background:transparent;color:var(--tinta);font-size:16px;font-weight:700">${ic('calendario', 22)} Agendar intérprete para mais tarde</button>
      <div style="padding:14px 16px;border-radius:14px;background:var(--ambar-claro);display:flex;gap:12px;align-items:flex-start;color:#5C3306">
        <span style="flex:none;color:#8A4B0A;margin-top:2px">${ic('aviso', 22)}</span>
        <span style="font-size:14px;line-height:1.45">Em emergência, contacte o 112 pela app MAI112. Este serviço não substitui a linha de emergência.</span>
      </div>
    </div>`;
}

function estadoLigacaoU() {
  let cor = 'var(--linha-forte)', fundo = '#EEF0EF', texto = 'Modo demonstração · ligue-se a um intérprete no Perfil';
  if (real.codigo && !redeDisponivel()) { texto = 'Sem internet · modo demonstração'; }
  else if (real.codigo && real.estadoU === 'pronto' && real.consolaOnline === false) { cor = '#E8A317'; fundo = 'var(--ambar-claro)'; texto = 'A consola ' + real.codigo + ' está fechada · abra-a no PC'; }
  else if (real.codigo && real.estadoU === 'pronto' && real.consolaOnline) { cor = 'var(--verde)'; fundo = 'var(--acc-claro)'; texto = 'Ligado à consola ' + real.codigo + ' · intérprete online'; }
  else if (real.codigo && real.estadoU === 'pronto') { cor = 'var(--verde)'; fundo = 'var(--acc-claro)'; texto = 'Ligado · à procura da consola ' + real.codigo + '…'; }
  else if (real.codigo && real.estadoU === 'a-ligar') { cor = '#E8A317'; fundo = 'var(--ambar-claro)'; texto = 'A ligar ao serviço de chamadas…'; }
  else if (real.codigo && real.estadoU === 'erro') { cor = 'var(--vermelho)'; fundo = '#FDECEA'; texto = 'Sem ligação · modo demonstração'; }
  return `
    <div role="status" style="padding:12px 16px;border-radius:14px;background:${fundo};display:flex;align-items:center;gap:10px;font-size:15px">
      <span class="ponto" aria-hidden="true" style="background:${cor}"></span><span>${esc(texto)}</span>
    </div>
    ${se(real.erroU, `<div role="alert" class="cam-erro">${esc(real.erroU)}</div>`)}`;
}

function uHistorico() {
  return `
    <header style="padding:56px 24px 14px"><h1 style="font-size:${tamTitulo()}">Histórico</h1></header>
    <div style="flex:1;overflow:auto;padding:4px 24px 20px;display:flex;flex-direction:column;gap:12px">
      ${cada(U.historico, (h) => `
        <div style="padding:16px;border-radius:16px;background:#fff;border:1px solid var(--linha);display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline">
            <span style="font-size:${tamCorpo()};font-weight:700">${esc(h.destino)}</span>
            <span style="font-size:14px;color:var(--suave)">${esc(h.dur)}</span>
          </div>
          <span style="font-size:14px;color:var(--suave)">${esc(h.data)} · Intérprete: Marta Silva</span>
          <button class="btn btn-pill" style="align-self:flex-start;min-height:44px;border-color:var(--acc);color:var(--acc)" ${acao('uLigar', h.destino)}>${ic('video', 18)} Ligar outra vez</button>
        </div>`)}
      <p style="font-size:13px;line-height:1.45;color:var(--suave)">As chamadas não são gravadas. Só guardamos o destino, a data e a duração.</p>
    </div>`;
}

function uPerfil() {
  const ops = [
    ['legendas', 'Legendas do ouvinte', 'Mostrar em texto o que a outra pessoa diz'],
    ['textoGrande', 'Texto maior', 'Aumentar o tamanho da letra na app'],
    ['vibrar', 'Vibrar ao ligar', 'Aviso por vibração e luz do ecrã']
  ];
  const ligacao = (t, extra = '') => `<a href="#" onclick="return false" style="display:flex;align-items:center;justify-content:space-between;min-height:56px;padding:0 16px;border-radius:16px;background:#fff;border:1px solid var(--linha);text-decoration:none;color:var(--tinta);font-size:16px">${t}${extra}</a>`;
  return `
    <header style="padding:56px 24px 14px;display:flex;align-items:center;gap:16px">
      <span aria-hidden="true" style="width:64px;height:64px;border-radius:32px;background:var(--acc-claro);color:var(--acc);display:flex;align-items:center;justify-content:center;font-size:24px;font-weight:700">${esc((U.nome || '?').trim().charAt(0).toUpperCase() || '?')}</span>
      <div style="display:flex;flex-direction:column;gap:4px">
        <h1 style="font-size:24px">${esc(U.nome || 'O meu perfil')}</h1>
        <span style="font-size:14px;color:var(--suave)">${esc(U.tel || 'Telemóvel não indicado')}</span>
      </div>
    </header>
    <div style="flex:1;overflow:auto;padding:4px 24px 20px;display:flex;flex-direction:column;gap:10px">
      <h2 style="margin:8px 0 2px;font-size:15px;letter-spacing:.06em;text-transform:uppercase;color:var(--suave)">Preferências</h2>
      ${cada(ops, ([k, label, desc]) => `
        <button class="opcao" ${acao('uOpcao', k)} ${pressed(U[k])}>
          <span style="display:flex;flex-direction:column;gap:3px;flex:1">
            <span style="font-size:${tamCorpo()};font-weight:700">${label}</span>
            <span style="font-size:14px;color:var(--suave)">${desc}</span>
          </span>
          <span class="interruptor" aria-hidden="true"><span></span></span>
        </button>`)}
      <h2 style="margin:14px 0 2px;font-size:15px;letter-spacing:.06em;text-transform:uppercase;color:var(--suave)">Ligação ao intérprete</h2>
      <form data-submit="uGuardarCodigo" style="padding:16px;border-radius:16px;background:#fff;border:1px solid var(--linha);display:flex;flex-direction:column;gap:10px">
        <label for="codigo-consola" style="font-size:16px;font-weight:700">Código da consola</label>
        <span class="etq" style="line-height:1.45">O código aparece na consola do intérprete. Também pode ler o QR code com a câmara do telemóvel.</span>
        <div style="display:flex;gap:8px">
          <input id="codigo-consola" class="campo" style="flex:1;min-width:0;font-size:20px;font-weight:700;letter-spacing:.15em;text-transform:uppercase" maxlength="6" autocomplete="off" autocapitalize="characters" placeholder="ABC123" data-bind="U.codigoRascunho" value="${esc(U.codigoRascunho != null ? U.codigoRascunho : real.codigo)}">
          <button type="submit" class="btn btn-acc">Guardar</button>
        </div>
        ${se(real.codigo, `<button type="button" ${acao('uTirarCodigo')} style="align-self:flex-start;min-height:44px;border:none;background:transparent;color:var(--tinta);font-size:14px;text-decoration:underline;padding:0">Usar modo demonstração</button>`)}
        ${estadoLigacaoU()}
      </form>
      <h2 style="margin:14px 0 2px;font-size:15px;letter-spacing:.06em;text-transform:uppercase;color:var(--suave)">Conta</h2>
      ${ligacao('Intérprete preferido', '<span style="color:var(--suave)">Marta Silva</span>')}
      ${ligacao('Privacidade e dados')}
      ${ligacao('Ajuda em LGP (vídeo)')}
      <button class="btn" style="min-height:52px;border-radius:16px;justify-content:flex-start" ${acao('irMenu')}>${ic('ecra', 20)} Abrir menu (consola do intérprete)</button>
    </div>`;
}

function uAgendar() {
  const chips = (lista, chave) => cada(lista, (v) => `<button class="chip" ${acao('uChip', chave, v)} ${pressed(U[chave] === v)}>${v}</button>`);
  return `
  <div class="scr">
    <header style="padding:52px 16px 12px;display:flex;align-items:center;gap:8px">
      <button class="voltar" aria-label="Voltar" ${acao('uTab', 'inicio')}>${ic('voltar')}</button>
      <h1 style="font-size:24px">Agendar intérprete</h1>
    </header>
    <div style="flex:1;overflow:auto;padding:8px 24px 20px;display:flex;flex-direction:column;gap:22px">
      <div style="display:flex;flex-direction:column;gap:10px"><span style="font-size:16px;font-weight:700">Para onde vai ligar?</span>
        <div style="display:flex;flex-wrap:wrap;gap:8px">${chips(['Saúde', 'Banco', 'Serviços públicos', 'Outro'], 'agDestino')}</div></div>
      <div style="display:flex;flex-direction:column;gap:10px"><span style="font-size:16px;font-weight:700">Dia</span>
        <div style="display:flex;flex-wrap:wrap;gap:8px">${chips(['Hoje', 'Amanhã', 'Qui, 5 nov'], 'agDia')}</div></div>
      <div style="display:flex;flex-direction:column;gap:10px"><span style="font-size:16px;font-weight:700">Hora</span>
        <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px">${cada(['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'], (v) => `<button class="chip" style="border-radius:12px;padding:0" ${acao('uChip', 'agHora', v)} ${pressed(U.agHora === v)}>${v}</button>`)}</div></div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <label for="motivo" style="font-size:16px;font-weight:700">Assunto (opcional)</label>
        <textarea id="motivo" class="campo" style="resize:none" placeholder="Ex.: marcar consulta de rotina" data-bind="U.motivo">${esc(U.motivo)}</textarea>
        <span class="etq">Ajuda o intérprete a preparar vocabulário específico.</span>
      </div>
    </div>
    <div style="padding:14px 24px 32px;background:#fff;border-top:1px solid var(--linha)">
      <button class="btn btn-acc btn-full" ${acao('uConfirmarAg')}>Confirmar · ${esc(resumoAg())}</button>
    </div>
  </div>`;
}

function uAgendado() {
  return `
  <div class="scr" style="padding:24px;align-items:center;justify-content:center;gap:24px;text-align:center">
    <span aria-hidden="true" style="width:88px;height:88px;border-radius:44px;background:var(--acc-claro);color:var(--acc);display:flex;align-items:center;justify-content:center">${ic('calendarioOk', 44)}</span>
    <h1 style="font-size:28px">Agendado</h1>
    <p style="font-size:18px;line-height:1.45;color:var(--suave)">${esc(U.agendamento)}<br>Vai receber uma notificação 10 minutos antes.</p>
    <button class="btn btn-acc btn-full" ${acao('uTab', 'inicio')}>Voltar ao início</button>
  </div>`;
}

function uLigar() {
  return `
  <div class="scr" style="padding:24px;align-items:center;justify-content:center;gap:28px;text-align:center">
    <div style="position:relative;width:132px;height:132px">
      <span class="pulso" aria-hidden="true" style="position:absolute;inset:0;border-radius:66px;background:var(--acc)"></span>
      <span aria-hidden="true" style="position:relative;width:132px;height:132px;border-radius:66px;background:var(--acc);color:#fff;display:flex;align-items:center;justify-content:center">${ic('mao', 56, 'stroke-width="1.8"')}</span>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <h1 style="font-size:28px;line-height:1.2">A ligar a um intérprete</h1>
      <p style="font-size:17px;color:var(--suave)">Destino: <strong style="color:var(--tinta)">${esc(U.destino)}</strong></p>
    </div>
    <div role="status" style="padding:10px 20px;border-radius:999px;background:#fff;border:1px solid var(--linha);font-size:16px;font-weight:700">${U.real ? (U.atendido ? 'O intérprete atendeu — a abrir o vídeo…' : U.entregue ? '✓ Pedido entregue · à espera que o intérprete atenda…' : real.consolaOnline === false ? 'A consola ' + esc(real.codigo) + ' está fechada' : 'A enviar o pedido à consola…') : U.fila > 1 ? 'Posição na fila: ' + U.fila : 'É o próximo — a ligar…'}</div>
    ${se(U.real, '<span class="etq">Chamada real · consola ' + esc(real.codigo) + '</span>')}
    <div style="width:100%;padding:16px;border-radius:16px;background:#fff;border:1px solid var(--linha);font-size:15px;line-height:1.45;color:var(--suave);text-align:left">Dica: tenha à mão documentos ou números de que possa precisar (cartão de cidadão, número de utente, NIF).</div>
    <button class="btn btn-pill" style="min-height:52px;padding:0 32px;border:2px solid var(--tinta);background:transparent;font-size:17px" ${acao('uCancelar')}>Cancelar</button>
  </div>`;
}

function uChamada() {
  const rapidas = ['Pode repetir?', 'Mais devagar, por favor', 'Vou escrever um número', 'Obrigado'];
  return `
  <div class="scr" style="background:var(--escuro);color:#fff">
    <div style="padding:52px 20px 14px;display:flex;justify-content:space-between;align-items:center;gap:12px">
      <div style="display:flex;flex-direction:column;gap:4px">
        <span style="font-size:17px;font-weight:700">Marta Silva · Intérprete de LGP</span>
        <span style="font-size:14px;color:#B9C7C4">Em linha com ${esc(U.destino)}</span>
      </div>
      <span role="timer" style="display:flex;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:var(--escuro-2);font-size:15px;font-variant-numeric:tabular-nums">
        <span class="ponto" aria-hidden="true" style="width:8px;height:8px;background:#3CCB8C"></span><span data-relogio="u-seg">${fmt(U.seg)}</span>
      </span>
    </div>
    <div style="flex:1;min-height:0;margin:0 12px;border-radius:24px;background:var(--escuro-2);position:relative;display:flex;align-items:center;justify-content:center;overflow:hidden">
      ${U.real ? (real.remoto ? slotCam('u-main', false, '', 'remoto') : '') : camLigada('C') ? slotCam('u-main', false, '') : ''}
      <div style="display:flex;flex-direction:column;align-items:center;gap:12px;color:#B9C7C4;text-align:center;padding:0 24px">
        <svg role="img" aria-label="Vídeo do intérprete" width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${ICONES.pessoa}</svg>
        <span style="font-size:15px;line-height:1.45">${U.real ? (U.semVideo ? 'O vídeo não ligou nesta rede. Podem continuar por mensagens (botão de mensagens em baixo).' : 'A ligar o vídeo do intérprete…') : 'O intérprete ainda não ligou a câmara'}</span>
      </div>
      <div style="position:absolute;right:14px;top:14px;width:100px;height:136px;border-radius:16px;overflow:hidden;background:var(--escuro-3);border:2px solid var(--escuro);display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:6px;padding-bottom:8px;font-size:13px;color:#DCE5E3">
        ${camLigada('U') ? slotCam('u-pip', true, 'Você') : ic('semVideo', 26) + (cam.aPedir ? 'A ligar…' : 'Câmara desligada')}
      </div>
      ${se(cam.erro, `<div role="alert" class="cam-erro" style="position:absolute;left:14px;right:126px;top:14px">${esc(cam.erro)}</div>`)}
      ${se(U.legendas && !U.chat && !U.real, `
        <div aria-live="polite" style="position:absolute;left:14px;right:14px;bottom:14px;padding:12px 14px;border-radius:14px;background:rgba(14,23,22,.88);display:flex;flex-direction:column;gap:4px">
          <span style="font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#B9C7C4">Legendas do ouvinte</span>
          <span style="font-size:${tamCorpo()};line-height:1.35">${LEGENDAS[U.legIdx]}</span>
        </div>`)}
      ${se(U.chat, `
        <div style="position:absolute;inset:0;background:var(--fundo);color:var(--tinta);display:flex;flex-direction:column">
          <div style="padding:14px 16px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--linha)">
            <span style="font-size:17px;font-weight:700">Mensagens ao intérprete</span>
            <button class="voltar" style="width:44px;height:44px" aria-label="Fechar mensagens" ${acao('uChat')}>${ic('fechar', 22)}</button>
          </div>
          <div id="u-msgs" style="flex:1;overflow:auto;padding:14px 16px;display:flex;flex-direction:column;gap:10px">
            ${cada(U.msgs, (m) => `<div class="bolha ${m.eu ? 'eu' : 'outro'}" style="${m.eu ? '' : 'background:#fff'}">${esc(m.texto)}</div>`)}
          </div>
          <div style="padding:10px 12px;display:flex;flex-wrap:wrap;gap:8px;border-top:1px solid var(--linha)">
            ${cada(rapidas, (r) => `<button class="chip" style="font-size:14px;padding:0 14px" ${acao('uRapida', r)}>${r}</button>`)}
          </div>
          ${se(U.interpreteEscreve, '<span aria-live="polite" style="padding:0 16px 6px;font-size:13px;color:var(--suave)">O intérprete está a escrever…</span>')}
          <form data-submit="uEnviar" style="display:flex;gap:8px;padding:0 12px 12px">
            <label for="msg-utilizador" class="sr">Escrever mensagem ao intérprete</label>
            <input id="msg-utilizador" class="campo" style="flex:1;min-width:0;border-radius:24px;font-size:16px" type="text" autocomplete="off" placeholder="Escreva aqui…" data-bind="U.rascunho" value="${esc(U.rascunho)}">
            <button type="submit" aria-label="Enviar mensagem" style="flex:none;width:48px;height:48px;border-radius:24px;border:none;background:var(--acc);color:#fff;display:flex;align-items:center;justify-content:center">${ic('enviar', 20)}</button>
          </form>
        </div>`)}
    </div>
    <div style="padding:18px 20px 34px;display:flex;justify-content:space-between;align-items:center">
      <button class="redondo" ${acao('uCamara')} aria-label="${cam.U ? 'Desligar a minha câmara' : 'Ligar a minha câmara'}" ${pressed(cam.U)}>${ic(cam.U ? 'video' : 'semVideo', 26)}</button>
      <button class="redondo" ${acao('uChat')} aria-label="Mensagens ao intérprete" ${pressed(U.chat)}>${ic('chat', 26)}</button>
      <button class="redondo" ${acao('uLegendas')} aria-label="Legendas" ${pressed(U.legendas)}>CC</button>
      <button class="redondo" style="width:76px;background:var(--vermelho)" ${acao('uTerminar')} aria-label="Terminar chamada">${ic('desligar', 28)}</button>
    </div>
  </div>`;
}

function uFim() {
  return `
  <div class="scr" style="padding:56px 24px 32px;align-items:center;gap:22px;text-align:center">
    <span aria-hidden="true" style="width:80px;height:80px;border-radius:40px;background:var(--acc-claro);color:var(--acc);display:flex;align-items:center;justify-content:center">${ic('visto', 40, 'stroke-width="2.2"')}</span>
    <div style="display:flex;flex-direction:column;gap:8px">
      <h1 style="font-size:28px">Chamada terminada</h1>
      <p style="font-size:17px;color:var(--suave)">${esc(U.destino)} · ${fmt(U.seg)}</p>
    </div>
    <div style="width:100%;padding:20px;border-radius:18px;background:#fff;border:1px solid var(--linha);display:flex;flex-direction:column;align-items:center;gap:14px">
      <span style="font-size:17px;font-weight:700">Como correu a interpretação?</span>
      <div style="display:flex;gap:4px">
        ${cada([1, 2, 3, 4, 5], (n) => `<button ${acao('uNota', n)} aria-label="Dar ${n} de 5 estrelas" style="width:48px;height:48px;border:none;background:transparent;display:flex;align-items:center;justify-content:center">${estrela(n <= U.nota)}</button>`)}
      </div>
      ${se(U.nota > 0, `
        <div style="display:flex;flex-direction:column;gap:10px;align-items:center">
          <span style="font-size:15px;color:var(--suave)">O que correu bem?</span>
          <div style="display:flex;flex-wrap:wrap;justify-content:center;gap:8px">
            ${cada(['Clareza', 'Rapidez', 'Simpatia', 'Vocabulário'], (t) => `<button class="chip chip-suave" style="font-size:14px;padding:0 14px" ${acao('uTag', t)} ${pressed(!!U.tags[t])}>${t}</button>`)}
          </div>
        </div>`)}
    </div>
    <button style="min-height:44px;border:none;background:transparent;color:var(--tinta);font-size:15px;text-decoration:underline">Reportar um problema</button>
    <div style="flex:1"></div>
    <button class="btn btn-acc btn-full" ${acao('uVoltar')}>Voltar ao início</button>
  </div>`;
}

/* =================================================================
   VISTA: CONSOLA DO INTÉRPRETE
   ================================================================= */
function vConsola() {
  const tabs = [['atendimento', 'Atendimento'], ['agendados', 'Agendados'], ['equipa', 'Equipa'], ['turno', 'O meu turno']];
  const corpo = { atendimento: cAtendimento, agendados: cAgendados, equipa: cEquipa, turno: cTurno }[C.tab]();
  return `
  <header class="c-topo">
    <div style="display:flex;align-items:center;gap:20px;flex-wrap:wrap">
      <button class="btn" style="min-height:44px;padding:0 12px" ${acao('irMenu')} aria-label="Voltar ao menu">${ic('voltar', 20)}</button>
      <div style="display:flex;align-items:center;gap:12px">${marca(60, false)}<span class="c-sep" aria-hidden="true"></span><span style="font-size:15px;color:var(--suave)">Consola do intérprete</span></div>
      <nav aria-label="Secções" style="display:flex;gap:4px;flex-wrap:wrap">
        ${cada(tabs, ([k, l]) => `<button class="c-tab" ${acao('cTab', k)} aria-current="${C.tab === k ? 'page' : 'false'}">${l}</button>`)}
      </nav>
    </div>
    <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap">
      <span style="font-size:14px;color:var(--suave)">Atendidas hoje: <strong style="color:var(--tinta)">${C.atendidas}</strong></span>
      <button class="estado-btn" style="background:${C.disponivel ? 'var(--acc-claro)' : 'var(--ambar-claro)'}" ${acao('cEstado')} ${pressed(C.disponivel)}>
        <span class="ponto" aria-hidden="true" style="background:${C.disponivel ? 'var(--verde)' : 'var(--ambar)'}"></span>
        <span data-relogio="c-pausa">${C.disponivel ? 'Disponível' : 'Em pausa · ' + fmt(C.pausaSeg)}</span>
      </button>
      <span style="display:flex;align-items:center;gap:10px"><span aria-hidden="true" class="avatar">MS</span><span style="display:flex;flex-direction:column;line-height:1.2"><strong style="font-size:14px">Marta Silva</strong><span style="font-size:12px;color:var(--suave)">Intérprete de LGP</span></span></span>
    </div>
  </header>
  ${corpo}
  ${C.emergencia && C.fase === 'chamada' ? cEmergencia() : ''}`;
}

function cAtendimento() {
  const corEspera = (s) => (s >= 180 ? '#B42318' : s >= 90 ? 'var(--ambar)' : 'var(--suave)');
  const fila = `
    <aside class="c-fila" aria-label="Fila de chamadas">
      <div style="display:flex;justify-content:space-between;align-items:baseline">
        <h2 style="font-size:20px">Fila de espera</h2>
        <span aria-live="polite" style="font-size:14px;color:var(--suave)">${C.fila.length} em espera</span>
      </div>
      ${cartaoLigacaoC()}
      ${se(C.fase === 'livre' && C.disponivel && C.tick - C.ultimoNovo < 5, `
        <div role="alert" class="chega" style="padding:14px 16px;border-radius:12px;background:var(--acc);color:#fff;display:flex;align-items:center;gap:12px;font-size:15px;font-weight:700">${ic('sino', 22)} Nova chamada na fila</div>`)}
      ${se(!C.disponivel, '<div style="padding:14px 16px;border-radius:12px;background:var(--ambar-claro);color:#5C3306;font-size:14px;line-height:1.45">Está em pausa. As chamadas são encaminhadas para outros intérpretes.</div>')}
      ${se(C.fila.length === 0, '<div style="padding:20px;border-radius:14px;border:1px dashed var(--linha-forte);font-size:15px;color:var(--suave)">Sem chamadas em espera.</div>')}
      ${cada(C.fila, (c) => `
        <div style="padding:16px;border-radius:14px;background:#fff;border:1px solid var(--linha);display:flex;flex-direction:column;gap:10px">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline">
            <span style="font-size:16px;font-weight:700">${esc(c.nome)}</span>
            <span style="font-size:15px;font-weight:700;font-variant-numeric:tabular-nums;color:${corEspera(c.esperaSeg)}" data-relogio="espera-${esc(c.id)}">${fmt(c.esperaSeg)}</span>
          </div>
          <span style="font-size:14px;color:var(--suave)">Para: ${esc(c.destino)} · ${esc(c.motivo)}</span>
          ${se(c.primeira, '<span class="selo" style="align-self:flex-start;background:#E8EEFB;color:#1E3A8A;font-size:12px">Primeira chamada</span>')}
          ${se(c.real, '<span class="selo" style="align-self:flex-start;background:var(--vermelho);color:#fff;font-size:12px">● Ao vivo · telemóvel</span>')}
          ${se(C.fase === 'livre' && C.disponivel, `<button class="btn btn-acc" style="min-height:44px;border-radius:10px" ${acao('cAtender', c.id)}>Atender</button>`)}
        </div>`)}
    </aside>`;

  let centro = '';
  if (C.fase === 'livre') {
    centro = `
      <div class="video" style="min-height:440px;padding:24px">
        <div style="max-width:360px;text-align:center;display:flex;flex-direction:column;gap:10px">
          <span style="font-size:20px;color:#fff;font-weight:700">Sem chamada ativa</span>
          <span style="font-size:15px;line-height:1.5">Atenda a chamada com mais tempo de espera. Novas chamadas entram na fila automaticamente.</span>
        </div>
      </div>`;
  } else if (C.fase === 'chamada') {
    centro = cChamada();
  } else {
    centro = cFecho();
  }
  return `<main class="c-main">${fila}<section class="c-centro" aria-label="Chamada">${centro}</section></main>`;
}

function qrPara(texto) {
  if (real.qr[texto]) return real.qr[texto];
  if (typeof window.QRCode !== 'function') return '';
  try {
    const tmp = document.createElement('div');
    new window.QRCode(tmp, { text: texto, width: 256, height: 256, colorDark: '#14211F', colorLight: '#FFFFFF', correctLevel: window.QRCode.CorrectLevel.M });
    const canvas = tmp.querySelector('canvas');
    real.qr[texto] = canvas ? canvas.toDataURL('image/png') : '';
  } catch (e) { real.qr[texto] = ''; }
  return real.qr[texto];
}

function cartaoLigacaoC() {
  if (!redeDisponivel()) {
    return '<div class="caixa" style="padding:16px;border-radius:14px;font-size:14px;line-height:1.45;color:var(--suave)"><strong style="color:var(--tinta)">Modo demonstração.</strong> Sem internet não é possível receber chamadas reais do telemóvel.</div>';
  }
  const est = { pronto: ['var(--verde)', 'Pronta a receber chamadas'], 'a-ligar': ['#E8A317', 'A ligar ao serviço…'], erro: ['var(--vermelho)', 'Sem ligação'], off: ['var(--linha-forte)', 'Desligada'] }[real.estadoC] || ['var(--linha-forte)', ''];
  const link = location.origin + location.pathname + '?consola=' + real.meuCodigo;
  const qr = sobreHttps() && real.meuCodigo ? qrPara(link) : '';
  return `
    <div class="caixa" style="padding:16px;border-radius:14px;display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:700"><span class="ponto" aria-hidden="true" style="background:${est[0]}"></span>${est[1]}</div>
      <span class="etq">Código desta consola</span>
      <span style="font-size:30px;font-weight:700;letter-spacing:.18em;font-variant-numeric:tabular-nums">${esc(real.meuCodigo || '······')}</span>
      ${qr ? `<img src="${qr}" alt="QR code para ligar o telemóvel a esta consola" width="168" height="168" style="align-self:flex-start;border-radius:8px;border:1px solid var(--linha);image-rendering:pixelated">` : ''}
      <span style="font-size:13px;line-height:1.45;color:var(--suave)">${qr ? 'Leia o QR com a câmara do telemóvel, ou escreva o código no Perfil da app.' : 'No telemóvel, escreva este código em Perfil › Ligação ao intérprete.'}</span>
      ${se(real.erroC, `<div role="alert" class="cam-erro">${esc(real.erroC)}</div>`)}
      <button class="btn" style="align-self:flex-start;min-height:40px;font-size:14px" ${acao('cNovoCodigo')}>Gerar código novo</button>
    </div>`;
}

function cChamada() {
  const a = C.ativo;
  const vozMap = { idle: ['O serviço ainda não está na chamada', 'var(--linha-forte)'], ringing: ['A juntar o serviço à chamada…', '#E8A317'], on: ['Serviço em linha · chamada a três', 'var(--verde)'], hold: ['Serviço em espera', 'var(--ambar)'] };
  const v = vozMap[C.voz];
  const linhas = [
    ['Intérprete', 'Bom dia. Esta chamada tem interpretação em Língua Gestual Portuguesa; sou a intérprete.'],
    ['Ouvinte', 'Bom dia. Em que posso ajudar?'],
    ['Intérprete', 'A pessoa gostaria de tratar de: ' + a.motivo.toLowerCase() + '.'],
    ['Ouvinte', 'Com certeza. Pode indicar o nome completo, por favor?'],
    ['Intérprete', 'O nome é ' + a.nome.replace(/^Utilizador #\d+$/, 'Ana Costa') + '.'],
    ['Ouvinte', 'Obrigado, um momento enquanto verifico.']
  ];
  const temTr = C.voz === 'on' || (C.voz === 'hold' && C.trIdx > 0);
  const ajuda = (on, fn, icone, txtOn, txtOff) => `
    <button class="btn" style="justify-content:flex-start;${on ? 'background:var(--acc-claro);color:var(--acc-escuro)' : ''}" ${acao(fn)} ${pressed(on)}>${ic(icone, 20)} ${on ? txtOn : txtOff}</button>`;
  return `
    <div class="linha">
      <div class="video" style="flex:2 1 400px;min-width:0;height:440px;overflow:hidden">
        ${a.real ? (real.remoto ? slotCam('c-main', false, '', 'remoto') : '') : camLigada('U') ? slotCam('c-main', false, '') : ''}
        <div style="display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center;padding:0 24px">
          <svg role="img" aria-label="Vídeo do utilizador surdo" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">${ICONES.pessoa}</svg>
          <span style="font-size:15px;line-height:1.45">${a.real ? (C.semVideo ? 'O vídeo não ligou nesta rede. Continue por mensagens, no painel abaixo.' : 'A ligar o vídeo do telemóvel…') : esc(a.nome) + ' ainda não ligou a câmara'}</span>
        </div>
        <span class="pill-escuro" style="left:16px;top:16px">${a.real ? '● Ao vivo · LGP' : 'Vídeo · LGP'}</span>
        <span class="pill-escuro" role="timer" style="right:16px;top:16px;font-size:14px"><span class="ponto" aria-hidden="true" style="width:8px;height:8px;background:#3CCB8C"></span><span data-relogio="c-seg">${fmt(C.seg)}</span></span>
        <div style="position:absolute;right:16px;bottom:16px;width:178px;height:100px;border-radius:12px;overflow:hidden;background:var(--escuro-3);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;font-size:13px;color:#DCE5E3">
          ${camLigada('C') ? slotCam('c-pip', true, 'A sua câmara') : ic('semVideo', 22) + (cam.aPedir ? 'A ligar…' : 'A sua câmara está desligada')}
        </div>
        <button class="cam-btn" ${acao('cCamara')} ${pressed(cam.C)}>${ic(cam.C ? 'semVideo' : 'video', 20)} ${cam.C ? 'Desligar a minha câmara' : 'Ligar a minha câmara'}</button>
        ${se(cam.erro, `<div role="alert" class="cam-erro" style="position:absolute;left:16px;right:210px;top:60px">${esc(cam.erro)}</div>`)}
      </div>
      <div class="caixa" style="flex:1 1 280px;min-width:0;display:flex;flex-direction:column;gap:14px">
        <h2 style="font-size:18px">Serviço contactado</h2>
        <div style="display:flex;flex-direction:column;gap:4px">
          <span style="font-size:17px;font-weight:700">${esc(a.destino)}</span>
          <span style="font-size:14px;color:var(--suave);line-height:1.45">O utilizador pediu este serviço. O intérprete junta-o à chamada e acompanha a conversa.</span>
        </div>
        <div role="status" style="display:flex;align-items:center;gap:10px;padding:12px 14px;border-radius:12px;background:var(--fundo)">
          <span class="ponto" aria-hidden="true" style="background:${v[1]}"></span><span style="font-size:15px;font-weight:700">${v[0]}</span>
        </div>
        ${se(C.voz === 'idle', `<button class="btn btn-acc" ${acao('cLigar')}>${ic('reforco', 20)} Juntar o serviço à chamada</button>`)}
        ${se(C.voz === 'on' || C.voz === 'hold', `
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn" style="flex:1 1 100px;${C.mudo ? 'background:var(--tinta);color:#fff' : ''}" ${acao('cMudo')} ${pressed(C.mudo)}>${C.mudo ? 'Microfone desligado' : 'Silenciar'}</button>
            <button class="btn" style="flex:1 1 100px;${C.voz === 'hold' ? 'background:var(--tinta);color:#fff' : ''}" ${acao('cEspera')} ${pressed(C.voz === 'hold')}>${C.voz === 'hold' ? 'Retomar' : 'Pôr em espera'}</button>
          </div>`)}
        <div style="flex:1"></div>
        <button class="btn" style="min-height:44px" ${acao('cAviso', 'Pedido de transferência enviado à coordenação')}>Transferir para outro intérprete</button>
        <button class="btn btn-perigo" ${acao('cTerminar')}>Terminar chamada</button>
      </div>
    </div>

    <div class="linha">
      <div class="caixa" style="flex:1 1 300px;min-width:0;display:flex;flex-direction:column;gap:12px">
        <h2 style="font-size:18px">Ficha do utilizador</h2>
        <dl style="margin:0;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 16px;font-size:15px">
          <div><dt class="etq">Utilizador</dt><dd style="margin:2px 0 0;font-weight:700">${esc(a.nome)}</dd></div>
          <div><dt class="etq">Assunto</dt><dd style="margin:2px 0 0;font-weight:700">${esc(a.motivo)}</dd></div>
          <div><dt class="etq">Legendas</dt><dd style="margin:2px 0 0;font-weight:700">Ligadas</dd></div>
          <div><dt class="etq">Chamadas anteriores</dt><dd style="margin:2px 0 0;font-weight:700">${a.primeira ? 'Nenhuma (primeira vez)' : a.real ? 'Sem registo' : (3 + (a.id % 5)) + ' chamadas'}</dd></div>
        </dl>
        <span class="etq" style="margin-top:4px">Vocabulário útil · ${esc(a.destino)}</span>
        <div style="display:flex;flex-wrap:wrap;gap:6px">${cada(GLOSSARIO[a.destino] || [], (t) => `<span class="termo">${t}</span>`)}</div>
      </div>
      <div class="caixa" style="flex:1 1 300px;min-width:0;display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
          <h2 style="font-size:18px">Transcrição de apoio</h2><span class="etq">Automática · pode ter erros</span>
        </div>
        ${temTr
          ? `<div aria-live="polite" style="display:flex;flex-direction:column;gap:10px;font-size:15px;line-height:1.45;max-height:180px;overflow:auto">${cada(linhas.slice(0, C.trIdx + 1), ([q, t]) => `<p><strong style="color:${q === 'Ouvinte' ? '#1E3A8A' : 'var(--acc-escuro)'}">${q}:</strong> ${esc(t)}</p>`)}</div>`
          : '<span style="font-size:15px;color:var(--suave)">Aparece quando a ligação de voz estiver ativa.</span>'}
        <label for="notas" style="font-size:15px;font-weight:700;margin-top:4px">Notas</label>
        <textarea id="notas" class="campo" style="min-height:72px" placeholder="Números, nomes ou datas para confirmar…" data-bind="C.notas">${esc(C.notas)}</textarea>
        <span class="etq">Notas e transcrição são apagadas no fim da chamada (RGPD).</span>
      </div>
    </div>

    <div class="linha">
      <div class="caixa" style="flex:2 1 380px;min-width:0;display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
          <h2 style="font-size:18px">Mensagens do utilizador</h2><span class="etq">Texto escrito na app</span>
        </div>
        ${se(C.msgsUser.length === 0, '<span style="font-size:15px;color:var(--suave)">Ainda sem mensagens. Útil para números, nomes e moradas.</span>')}
        <div id="c-msgs" aria-live="polite" style="display:flex;flex-direction:column;gap:8px;max-height:170px;overflow:auto">
          ${cada(C.msgsUser, (m) => `<div class="bolha ${m.eu ? 'eu' : 'outro'}">${esc(m.texto)}</div>`)}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:8px">
          ${cada(['Pode repetir o número?', 'Um momento, estou a falar com eles', 'Confirmado ✓'], (t) => `<button class="chip" style="font-size:14px;padding:0 14px" ${acao('cRapida', t)}>${t}</button>`)}
        </div>
        <form data-submit="cEnviar" style="display:flex;gap:8px">
          <label for="msg-interprete" class="sr">Escrever mensagem ao utilizador</label>
          <input id="msg-interprete" class="campo" style="flex:1;min-width:0" type="text" autocomplete="off" placeholder="Escreva uma mensagem ao utilizador…" data-bind="C.rascunho" value="${esc(C.rascunho)}">
          <button type="submit" aria-label="Enviar mensagem" style="flex:none;width:48px;height:48px;border-radius:12px;border:none;background:var(--acc);color:#fff;display:flex;align-items:center;justify-content:center">${ic('enviar', 20)}</button>
        </form>
        ${se(C.aEscrever, '<span aria-live="polite" class="etq">O utilizador está a escrever…</span>')}
      </div>
      <div class="caixa" style="flex:1 1 260px;min-width:0;display:flex;flex-direction:column;gap:10px">
        <h2 style="font-size:18px;margin-bottom:4px">Ajuda</h2>
        ${ajuda(C.supervisor, 'cSupervisor', 'grupo', 'Supervisor notificado', 'Pedir apoio ao supervisor')}
        ${ajuda(C.reforco, 'cReforco', 'reforco', 'Reforço a caminho', 'Pedir intérprete de reforço')}
        <button class="btn" style="justify-content:flex-start;border:2px solid var(--vermelho);color:#A3200F" ${acao('cEmergencia')}>${ic('aviso', 20)} Protocolo de emergência</button>
        <span style="font-size:13px;line-height:1.45;color:var(--suave)">Em chamadas longas ou muito técnicas, peça reforço para revezar a interpretação.</span>
      </div>
    </div>`;
}

function cFecho() {
  const a = C.ativo;
  const chips = (lista, chave) => cada(lista, (v) => `<button class="chip" ${acao('cChip', chave, v)} ${pressed(C[chave] === v)}>${v}</button>`);
  return `
    <div class="caixa" style="padding:28px;display:flex;flex-direction:column;gap:22px;max-width:720px">
      <div style="display:flex;flex-direction:column;gap:6px">
        <h2 style="font-size:22px">Fecho da chamada</h2>
        <span style="font-size:15px;color:var(--suave)">${esc(a.nome)} → ${esc(a.destino)} · duração ${fmt(C.seg)}</span>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px"><span style="font-size:16px;font-weight:700">Tipo de pedido</span>
        <div style="display:flex;flex-wrap:wrap;gap:8px">${chips(['Informação', 'Marcação', 'Reclamação', 'Outro'], 'categoria')}</div></div>
      <div style="display:flex;flex-direction:column;gap:10px"><span style="font-size:16px;font-weight:700">Ficou resolvido?</span>
        <div style="display:flex;flex-wrap:wrap;gap:8px">${chips(['Sim', 'Parcialmente', 'Não'], 'resolvido')}</div></div>
      <button ${acao('cTecnico')} ${pressed(C.tecnico)} style="align-self:flex-start;display:flex;align-items:center;gap:12px;min-height:44px;padding:0;border:none;background:transparent;color:var(--tinta);font-size:15px">
        <span class="check" aria-hidden="true">${C.tecnico ? '✓' : ''}</span> Houve problemas técnicos (vídeo, som, ligação)
      </button>
      <div style="display:flex;gap:12px;flex-wrap:wrap">
        <button class="btn btn-acc" style="min-height:52px;padding:0 24px" ${acao('cConcluir', '0')}>Concluir e ficar disponível</button>
        <button class="btn" style="min-height:52px;padding:0 24px" ${acao('cConcluir', '1')}>Concluir e fazer pausa</button>
      </div>
    </div>`;
}

const AGENDADOS = [
  { hora: '15:00', nome: 'Utilizador #2210', destino: 'Saúde', assunto: 'Consulta de rotina', estado: 'Em 25 min', f: 'var(--ambar-claro)', c: '#5C3306' },
  { hora: '15:30', nome: 'Utilizador #4108', destino: 'Serviços públicos', assunto: 'Segurança Social', estado: 'Confirmado', f: 'var(--acc-claro)', c: 'var(--acc-escuro)' },
  { hora: '16:30', nome: 'Utilizador #3307', destino: 'Banco', assunto: 'Crédito habitação', estado: 'Confirmado', f: 'var(--acc-claro)', c: 'var(--acc-escuro)' },
  { hora: '17:00', nome: 'Utilizador #5521', destino: 'Outro número', assunto: 'Entrevista de emprego', estado: 'Por confirmar', f: '#EEF0EF', c: '#3A4644' }
];

function cAgendados() {
  const p = C.prepId !== null ? AGENDADOS[C.prepId] : null;
  return `
  <main style="max-width:1200px;margin:0 auto;padding:24px;display:flex;flex-direction:column;gap:16px">
    <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px">
      <h2 style="font-size:22px">Agendamentos de hoje</h2><span style="font-size:14px;color:var(--suave)">O utilizador recebe aviso 10 min antes</span>
    </div>
    <div style="overflow-x:auto;border-radius:16px;border:1px solid var(--linha);background:#fff">
      <table>
        <thead><tr><th scope="col">Hora</th><th scope="col">Utilizador</th><th scope="col">Destino</th><th scope="col">Assunto</th><th scope="col">Estado</th><th scope="col"><span class="sr">Ações</span></th></tr></thead>
        <tbody>
          ${cada(AGENDADOS, (x, i) => `
            <tr>
              <td style="font-weight:700;font-variant-numeric:tabular-nums">${x.hora}</td>
              <td>${x.nome}</td><td>${x.destino}</td><td style="color:var(--suave)">${x.assunto}</td>
              <td><span class="selo" style="background:${x.f};color:${x.c}">${x.estado}</span></td>
              <td style="padding:10px 16px;text-align:right"><button class="btn" style="min-height:40px;padding:0 14px;border-radius:10px;font-size:14px" ${acao('cPrep', i)} aria-expanded="${C.prepId === i}">${C.prepId === i ? 'Fechar' : 'Preparar'}</button></td>
            </tr>`)}
        </tbody>
      </table>
    </div>
    ${p ? `
      <div class="caixa chega" style="border:2px solid var(--acc);display:flex;flex-wrap:wrap;gap:24px">
        <div style="flex:1 1 300px;min-width:0;display:flex;flex-direction:column;gap:10px">
          <h3 style="font-size:19px">Preparação · ${p.hora}</h3>
          <span style="font-size:16px">${p.nome} → <strong>${p.destino}</strong></span>
          <span style="font-size:15px;color:var(--suave)">Assunto: ${p.assunto}</span>
          <span class="etq" style="margin-top:8px">Vocabulário a rever</span>
          <div style="display:flex;flex-wrap:wrap;gap:6px">${cada(GLOSSARIO[p.destino] || [], (t) => `<span class="termo">${t}</span>`)}</div>
        </div>
        <div style="flex:1 1 300px;min-width:0;display:flex;flex-direction:column;gap:8px">
          <label for="prep-notas" style="font-size:15px;font-weight:700">Notas de preparação</label>
          <textarea id="prep-notas" class="campo" style="min-height:90px" placeholder="Termos a confirmar, gestos específicos, contexto…" data-bind="C.prepNotas">${esc(C.prepNotas)}</textarea>
          <div style="display:flex;gap:10px;flex-wrap:wrap">
            <button class="btn btn-acc">Ligar ao utilizador agora</button><button class="btn">Reagendar</button>
          </div>
        </div>
      </div>` : ''}
  </main>`;
}

function cEquipa() {
  const est = { 'Disponível': ['var(--acc-claro)', 'var(--acc-escuro)'], 'Em chamada': ['#E8EEFB', '#1E3A8A'], 'Em pausa': ['var(--ambar-claro)', '#5C3306'], 'Fora de turno': ['#EEF0EF', '#3A4644'] };
  const eq = [
    ['JF', 'João Ferreira', 'Em chamada', '12 min'], ['IC', 'Inês Costa', 'Disponível', '3 min'],
    ['RA', 'Rui Almeida', 'Em chamada', '4 min'], ['SP', 'Sofia Pinto', 'Em pausa', '8 min'],
    ['TM', 'Tiago Moreira', 'Disponível', '1 min'], ['BL', 'Beatriz Lopes', 'Fora de turno', 'entra às 18:00']
  ];
  const conta = (e) => eq.filter((x) => x[2] === e).length;
  return `
  <main style="max-width:1200px;margin:0 auto;padding:24px;display:flex;flex-direction:column;gap:20px">
    <div style="display:flex;justify-content:space-between;align-items:baseline;flex-wrap:wrap;gap:8px">
      <h2 style="font-size:22px">Equipa agora</h2>
      <span style="font-size:14px;color:var(--suave)">${conta('Disponível')} disponíveis · ${conta('Em chamada')} em chamada · ${conta('Em pausa')} em pausa</span>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px">
      ${cada(eq, ([ini, nome, e, desde]) => `
        <div style="padding:18px;border-radius:16px;background:#fff;border:1px solid var(--linha);display:flex;gap:14px;align-items:center">
          <span aria-hidden="true" style="flex:none;width:44px;height:44px;border-radius:22px;background:var(--acc-claro);color:var(--acc-escuro);display:flex;align-items:center;justify-content:center;font-weight:700">${ini}</span>
          <div style="display:flex;flex-direction:column;gap:6px;flex:1;min-width:0">
            <span style="font-size:16px;font-weight:700">${nome}</span>
            <span class="selo" style="align-self:flex-start;background:${est[e][0]};color:${est[e][1]}">${e} · ${desde}</span>
          </div>
        </div>`)}
    </div>
    <div class="caixa" style="display:flex;flex-direction:column;gap:12px;max-width:760px">
      <h3 style="font-size:17px">Avisos da coordenação</h3>
      <p style="font-size:15px;line-height:1.45"><strong>Quinta, 26 nov</strong> · Formação sobre vocabulário bancário para toda a equipa, às 17:00.</p>
      <p style="font-size:15px;line-height:1.45"><strong>Segunda, 23 nov</strong> · Novo glossário de serviços municipais disponível na ficha das chamadas.</p>
    </div>
  </main>`;
}

function cTurno() {
  const tile = (l, v) => `<div class="caixa" style="padding:20px;border-radius:16px;display:flex;flex-direction:column;gap:6px"><span style="font-size:14px;color:var(--suave)">${l}</span><span style="font-size:36px;font-weight:700">${v}</span></div>`;
  return `
  <main style="max-width:1200px;margin:0 auto;padding:24px;display:flex;flex-direction:column;gap:20px">
    <h2 style="font-size:22px">O meu turno</h2>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:16px">
      ${tile('Chamadas atendidas', C.atendidas)}${tile('Em fila agora', C.fila.length)}${tile('Duração média', '6 min 40 s')}${tile('Avaliação média', '4,8 / 5')}
    </div>
    <div style="padding:20px;border-radius:16px;background:var(--acc-claro);display:flex;gap:14px;align-items:flex-start;max-width:760px;color:var(--acc-escuro)">
      <span style="flex:none;margin-top:2px">${ic('cafe', 24)}</span>
      <div style="display:flex;flex-direction:column;gap:4px">
        <span style="font-size:16px;font-weight:700">Pausas</span>
        <span style="font-size:15px;line-height:1.45">Interpretação contínua é exigente. Recomendamos uma pausa de 10 minutos após 30 minutos de interpretação contínua. Use "Concluir e fazer pausa" no fecho de chamada.</span>
      </div>
    </div>
  </main>`;
}

function cEmergencia() {
  const passos = [
    'Confirmar com o utilizador o tipo de emergência',
    'Obter a localização exata (morada, pontos de referência)',
    'Ligar ao 112 e interpretar a chamada',
    'Manter a videochamada até indicação dos serviços de emergência'
  ];
  const feitos = passos.filter((_, i) => C.passos[i]).length;
  return `
  <div class="modal-fundo">
    <div role="dialog" aria-modal="true" aria-labelledby="em-titulo" class="chega" style="width:100%;max-width:580px;background:#fff;border-radius:20px;border-top:6px solid var(--vermelho);padding:28px;display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px">
        <div style="display:flex;flex-direction:column;gap:6px">
          <h2 id="em-titulo" style="font-size:22px;color:#A3200F">Protocolo de emergência</h2>
          <span style="font-size:15px;color:var(--suave)">${esc(C.ativo.nome)} · siga os passos por ordem</span>
        </div>
        <button class="voltar" style="width:44px;height:44px" aria-label="Fechar protocolo" ${acao('cFecharEmergencia')}>${ic('fechar', 22)}</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        ${cada(passos, (l, i) => `<button class="passo" ${acao('cPasso', i)} ${pressed(!!C.passos[i])}><span class="num" aria-hidden="true">${C.passos[i] ? '✓' : i + 1}</span>${l}</button>`)}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap">
        <span role="status" style="font-size:15px;font-weight:700">${feitos} de 4 concluídos</span>
        <button class="btn" style="background:var(--tinta);border-color:var(--tinta);color:#fff" ${acao('cFecharEmergencia')}>Voltar à chamada</button>
      </div>
      <span style="font-size:13px;line-height:1.45;color:var(--suave)">O supervisor é notificado automaticamente ao abrir este protocolo.</span>
    </div>
  </div>`;
}

/* =================================================================
   DESENHO E EVENTOS
   ================================================================= */
function ajustaZoom() {
  const z = Math.min(1, (window.innerHeight - 100) / 868, (window.innerWidth - 32) / 414);
  document.documentElement.style.setProperty('--zoom', String(Math.max(0.5, z)));
}

/* avisos breves no canto do ecrã (fora da área redesenhada) */
function aviso(texto) {
  let zona = document.getElementById('avisos');
  if (!zona) { zona = document.createElement('div'); zona.id = 'avisos'; zona.setAttribute('role', 'status'); zona.setAttribute('aria-live', 'polite'); document.body.appendChild(zona); }
  const el = document.createElement('div');
  el.className = 'aviso';
  el.innerHTML = ic('visto', 18) + '<span>' + esc(texto) + '</span>';
  zona.appendChild(el);
  setTimeout(() => { el.classList.add('sai'); setTimeout(() => el.remove(), 300); }, 2600);
}

let ultimoEcra = '';
function desenha() {
  // guarda o foco e a posição do cursor para não perder o que se está a escrever
  const ativo = document.activeElement;
  const idFoco = ativo && ativo.id ? ativo.id : null;
  const sel = idFoco && 'selectionStart' in ativo ? [ativo.selectionStart, ativo.selectionEnd] : null;
  const antes = raiz.getElementsByTagName('*');
  const scrolls = [];
  for (let i = 0; i < antes.length; i++) if (antes[i].scrollTop) scrolls.push([i, antes[i].scrollTop]);
  const scrollPagina = window.scrollY;

  raiz.innerHTML = app.vista === 'consola' ? vConsola() : app.vista === 'utilizador' ? vUtilizador() : vMenu();
  const ecra = [app.vista, U.ecra, U.tab, C.tab, C.fase].join('/');
  const mesmoEcra = ecra === ultimoEcra;
  if (!mesmoEcra) {
    const alvo = app.vista === 'utilizador' ? raiz.querySelector('.scr') : app.vista === 'consola' ? raiz.querySelector('main') : raiz.firstElementChild;
    if (alvo && ultimoEcra) alvo.classList.add('entra');
    ultimoEcra = ecra;
  }

  if (mesmoEcra) { const depois = raiz.getElementsByTagName('*'); scrolls.forEach(([i, t]) => { if (depois[i]) depois[i].scrollTop = t; }); }
  colocaVideos();
  ['u-msgs', 'c-msgs'].forEach((id) => { const el = document.getElementById(id); if (el && el.dataset.n !== String(el.children.length)) { el.scrollTop = el.scrollHeight; } });
  window.scrollTo(0, scrollPagina);
  if (idFoco) {
    const el = document.getElementById(idFoco);
    if (el) { el.focus({ preventScroll: true }); if (sel && el.setSelectionRange) { try { el.setSelectionRange(sel[0], sel[1]); } catch (e) { /* tipo sem seleção */ } } }
  }
}

const ESTADOS = { U, C };
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-on]');
  if (!el) return;
  const [nome, ...args] = el.dataset.on.split('|');
  if (!A[nome]) return;
  const mudouVista = nome.startsWith('ir');
  A[nome](...args);
  if (mudouVista) window.scrollTo(0, 0);
  desenha();
  // após uma ação por clique, devolve o foco ao botão equivalente (se ainda existir)
  const igual = raiz.querySelector(`[data-on="${CSS.escape(el.dataset.on)}"]`);
  if (igual && !mudouVista && document.activeElement === document.body) igual.focus({ preventScroll: true });
});
document.addEventListener('input', (e) => {
  const chave = e.target.dataset && e.target.dataset.bind;
  if (!chave) return;
  const [obj, campo] = chave.split('.');
  ESTADOS[obj][campo] = e.target.value; // guarda sem redesenhar, para não interromper a escrita
});
document.addEventListener('submit', (e) => {
  e.preventDefault();
  const nome = e.target.dataset.submit;
  if (A[nome]) { A[nome](); desenha(); }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && C.emergencia) { A.cFecharEmergencia(); desenha(); }
});
let ultimoModoTel = null;
window.addEventListener('resize', () => {
  ajustaZoom();
  if (ultimoModoTel !== emTelemovel()) { ultimoModoTel = emTelemovel(); desenha(); }
});

/* relógio: avança chamadas, filas e legendas uma vez por segundo */
let redesenhoPendente = false;
// ao sair de uma caixa de texto, mostra o que ficou por atualizar enquanto se escrevia
document.addEventListener('focusout', () => { setTimeout(() => { if (redesenhoPendente && !aEscrever()) { redesenhoPendente = false; desenha(); } }, 0); });
function atualizaRelogios() {
  raiz.querySelectorAll('[data-relogio]').forEach((el) => {
    const k = el.dataset.relogio;
    let v = null;
    if (k === 'u-seg') v = fmt(U.seg);
    else if (k === 'c-seg') v = fmt(C.seg);
    else if (k === 'c-pausa') v = C.disponivel ? 'Disponível' : 'Em pausa · ' + fmt(C.pausaSeg);
    else if (k.indexOf('espera-') === 0) { const c = C.fila.find((x) => 'espera-' + x.id === k); if (c) v = fmt(c.esperaSeg); }
    if (v !== null && el.textContent !== v) el.textContent = v;
  });
}
const aEscrever = () => { const a = document.activeElement; return !!a && (a.tagName === 'INPUT' || a.tagName === 'TEXTAREA' || a.isContentEditable); };

setInterval(() => {
  let mudou = false; // true quando algo além dos relógios muda no ecrã
  // utilizador
  if (U.ecra === 'chamada') {
    U.seg += 1;
    if (U.seg % 4 === 0) { U.legIdx = (U.legIdx + 1) % LEGENDAS.length; if (app.vista === 'utilizador' && U.legendas && !U.chat && !U.real) mudou = true; }
  }
  const vistaC = app.vista === 'consola';
  // consola
  C.tick += 1;
  C.fila.forEach((c) => { c.esperaSeg += 1; if (vistaC && (c.esperaSeg === 90 || c.esperaSeg === 180)) mudou = true; });
  const antesFila = C.fila.length;
  C.fila = C.fila.filter((c) => !c.real || Date.now() - c.ultimo < 15000);
  if (vistaC && C.fila.length !== antesFila) mudou = true;
  if (C.tick % 14 === 0 && C.fila.length < 5) {
    const novos = [
      { destino: 'Serviços públicos', motivo: 'Dúvida sobre IRS' }, { destino: 'Outro número', motivo: 'Falar com o empregador' },
      { destino: 'Saúde', motivo: 'Resultados de análises' }, { destino: 'Banco', motivo: 'Transferência' }
    ];
    const n = novos[C.nextId % novos.length];
    C.fila.push({ id: C.nextId, nome: 'Utilizador #' + (2000 + C.nextId * 137), destino: n.destino, motivo: n.motivo, esperaSeg: 0, primeira: C.nextId % 3 === 0 });
    C.nextId += 1; C.ultimoNovo = C.tick;
    if (vistaC) mudou = true;
  }
  if (vistaC && C.tick - C.ultimoNovo === 5) mudou = true; // o aviso de chamada nova desaparece
  if (!C.disponivel) C.pausaSeg += 1;
  if (C.fase === 'chamada') {
    C.seg += 1;
    if (C.voz === 'on' && C.tick % 4 === 0 && C.trIdx < 5) { C.trIdx += 1; if (vistaC) mudou = true; }
    if (C.seg === 10 && !(C.ativo && C.ativo.real)) { C.msgsUser.push({ eu: false, texto: 'O meu número de cliente é 4 1 2 7 9. Pode confirmar com eles?' }); if (vistaC) mudou = true; }
  }
  if (app.vista === 'menu') return;
  if (mudou) redesenhoPendente = true;
  if (redesenhoPendente && !aEscrever()) { redesenhoPendente = false; desenha(); }
  else atualizaRelogios();
}, 1000);

/* ---------- arranque ---------- */
(function arranque() {
  // ?consola=CODIGO (vindo do QR code) liga o telemóvel a essa consola
  let codigoUrl = '';
  try { codigoUrl = limpaCodigo(new URLSearchParams(location.search).get('consola')); } catch (e) { /* sem parâmetros */ }
  if (codigoUrl) {
    real.codigo = codigoUrl; LS.set('liga.codigo', codigoUrl);
    try { history.replaceState(null, '', location.pathname); } catch (e) { /* ignora */ }
    app.vista = 'utilizador';
  } else {
    const guardada = LS.get('liga.vista');
    if (guardada === 'consola' || guardada === 'utilizador') app.vista = guardada;
    else if (emTelemovel()) app.vista = 'utilizador';
  }
  if (app.vista === 'consola') iniciaConsolaReal();
  if (app.vista === 'utilizador') iniciaUtilizadorReal();

  // instalação no telemóvel (só funciona num site https)
  if ('serviceWorker' in navigator && sobreHttps()) {
    window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => {}); });
  }
  ultimoModoTel = emTelemovel();
  ajustaZoom();
  desenha();
  // ecrã de arranque com o logótipo
  setTimeout(() => { const a = document.getElementById('arranque'); if (a) { a.classList.add('sai'); setTimeout(() => a.remove(), 400); } }, 700);
})();
