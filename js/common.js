/*
 * Travessia: utilitários compartilhados por todas as páginas.
 * JavaScript puro, sem dependências. Nada é enviado a servidor:
 * os dados do protótipo ficam só no sessionStorage do navegador.
 */
(function () {
  'use strict';

  const PREFIXO = 'trv:';

  // sessionStorage pode lançar exceção (modo privado, cota, bloqueio de cookies).
  const store = {
    get(chave, padrao) {
      try {
        const bruto = window.sessionStorage.getItem(PREFIXO + chave);
        return bruto === null ? padrao : JSON.parse(bruto);
      } catch (e) {
        return padrao;
      }
    },
    set(chave, valor) {
      try {
        window.sessionStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
      } catch (e) { /* sem persistência: o protótipo segue funcionando na página atual */ }
    },
    remove(chave) {
      try { window.sessionStorage.removeItem(PREFIXO + chave); } catch (e) { /* idem */ }
    },
    clear() {
      try {
        Object.keys(window.sessionStorage)
          .filter((k) => k.indexOf(PREFIXO) === 0)
          .forEach((k) => window.sessionStorage.removeItem(k));
      } catch (e) { /* idem */ }
    }
  };

  /* ------------------------------------------------------------- DOM */

  // Monta elementos sem innerHTML: todo texto entra como textContent.
  function h(tag, props, ...filhos) {
    const el = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach((k) => {
        const v = props[k];
        if (v === undefined || v === null || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'text') el.textContent = v;
        else if (k === 'dataset') Object.assign(el.dataset, v);
        else if (k.indexOf('on') === 0 && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (k === 'value') el.value = v;
        else if (k === 'checked' || k === 'disabled' || k === 'hidden' || k === 'required') el[k] = !!v;
        else el.setAttribute(k, v === true ? '' : String(v));
      });
    }
    append(el, filhos);
    return el;
  }

  function append(el, filhos) {
    filhos.flat(Infinity).forEach((f) => {
      if (f === null || f === undefined || f === false) return;
      el.appendChild(typeof f === 'string' || typeof f === 'number' ? document.createTextNode(String(f)) : f);
    });
    return el;
  }

  function icon(nome, classe) {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('class', 'icon' + (classe ? ' ' + classe : ''));
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    const use = document.createElementNS(ns, 'use');
    use.setAttribute('href', 'img/icons.svg#i-' + nome);
    svg.appendChild(use);
    return svg;
  }

  let seq = 0;
  function uid(prefixo) { seq += 1; return (prefixo || 'id') + '-' + seq; }

  function param(nome) { return new URLSearchParams(window.location.search).get(nome); }

  const reduzMovimento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------- Formatação */

  const fmt = {
    int: (n) => new Intl.NumberFormat('pt-BR').format(n || 0),
    date(iso) {
      if (!iso) return '';
      const p = String(iso).slice(0, 10).split('-');
      return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : String(iso);
    },
    // "quinta-feira, 30 de outubro"
    dateLong(iso) {
      const d = new Date(String(iso).slice(0, 10) + 'T12:00:00');
      return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
    },
    dateTime(iso) {
      if (!iso) return '';
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    },
    time(iso) {
      return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    },
    bytes(n) {
      if (n < 1024 * 1024) return Math.max(1, Math.round(n / 1024)) + ' KB';
      return (n / (1024 * 1024)).toFixed(1).replace('.', ',') + ' MB';
    },
    plural: (n, um, varios) => fmt.int(n) + ' ' + (n === 1 ? um : varios)
  };

  function hoje() {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }
  function somaDias(iso, dias) {
    const d = new Date(iso + 'T12:00:00');
    d.setDate(d.getDate() + dias);
    return d.toISOString().slice(0, 10);
  }
  function agoraISO() {
    const d = new Date();
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 19);
  }

  function normaliza(txt) {
    return String(txt || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
  }
  const digitos = (txt) => String(txt || '').replace(/\D/g, '');

  /* -------------------------------------------------------- Máscaras */

  const masks = {
    // Aceita números do Brasil e de Portugal: só dígitos, espaço, +, ( ) e hífen.
    telefone: (v) => String(v).replace(/[^\d+()\s-]/g, '').slice(0, 20),
    protocolo(v) {
      const s = String(v).toUpperCase().replace(/[^A-Z0-9]/g, '');
      const corpo = s.replace(/^TRV/, '');
      if (!corpo) return s.slice(0, 3);
      const d = corpo.replace(/\D/g, '').slice(0, 6);
      return 'TRV-' + d.slice(0, 2) + (d.length > 2 ? '-' + d.slice(2) : '');
    }
  };

  function applyMasks(raiz) {
    (raiz || document).querySelectorAll('[data-mask]').forEach((campo) => {
      const m = masks[campo.dataset.mask];
      if (!m) return;
      campo.addEventListener('input', () => {
        const fim = campo.selectionStart === campo.value.length;
        campo.value = m(campo.value);
        if (fim) campo.setSelectionRange(campo.value.length, campo.value.length);
      });
    });
  }

  /* ----------------------------------------------------- Validação */

  const regras = {
    email: (v) => (!v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? '' : 'Digite um e-mail no formato nome@exemplo.com.'),
    nome: (v) => (!v || v.trim().split(/\s+/).length >= 2 ? '' : 'Digite o nome e o sobrenome.'),
    telefone: (v) => (!v || (digitos(v).length >= 9 && digitos(v).length <= 15) ? '' : 'Digite o telefone com DDD ou código do país, por exemplo +55 11 91234-5678.'),
    protocolo: (v) => (!v || /^TRV-\d{2}-\d{4}$/.test(v) ? '' : 'O protocolo tem o formato TRV-00-0000. Ele está no e-mail de confirmação.')
  };

  function rotulo(campo) {
    if (campo.dataset.label) return campo.dataset.label;
    const lab = campo.id && document.querySelector('label[for="' + campo.id + '"]');
    return lab ? lab.textContent.replace(/\s*\(opcional\)\s*/i, '').trim() : 'este campo';
  }

  function mensagemObrigatorio(campo) {
    if (campo.dataset.msgRequired) return campo.dataset.msgRequired;
    if (campo.type === 'checkbox') return 'Marque esta opção para continuar.';
    const r = rotulo(campo);
    return 'Preencha ' + r.charAt(0).toLowerCase() + r.slice(1) + '.';
  }

  function erroDoCampo(campo) {
    if (campo.disabled) return '';
    const v = campo.type === 'checkbox' ? campo.checked : campo.value.trim();
    if (campo.required && !v) return mensagemObrigatorio(campo);
    const lista = (campo.dataset.rules || '').split(/\s+/).filter(Boolean);
    for (let i = 0; i < lista.length; i += 1) {
      const msg = regras[lista[i]] && regras[lista[i]](campo.value.trim());
      if (msg) return msg;
    }
    return '';
  }

  // Grupos de rádio obrigatórios: <fieldset data-required-group data-msg-required="...">
  function erroDoGrupo(fs) {
    return fs.querySelector('input:checked') ? '' : (fs.dataset.msgRequired || 'Escolha uma opção.');
  }

  // Num grupo, o link do resumo leva à primeira opção; sem opções, ao próprio grupo.
  function alvoDoErro(el) {
    if (el.tagName !== 'FIELDSET') return el;
    const alvo = el.querySelector('input, button:not([disabled])');
    if (alvo) return alvo;
    el.setAttribute('tabindex', '-1');
    return el;
  }

  function marcarErro(el, msg) {
    const id = (el.id || uid('campo')) + '-erro';
    if (!el.id) el.id = id.replace(/-erro$/, '');
    let p = document.getElementById(id);
    const descr = (el.getAttribute('aria-describedby') || '').split(/\s+/).filter((x) => x && x !== id);
    if (!msg) {
      if (p) p.remove();
      el.removeAttribute('aria-invalid');
      el.closest('.field, .choice-group')?.classList.remove('is-invalid');
      if (descr.length) el.setAttribute('aria-describedby', descr.join(' '));
      else el.removeAttribute('aria-describedby');
      return;
    }
    if (!p) {
      p = h('p', { class: 'field__error', id }, icon('alert'), h('span'));
      const caixa = el.closest('.field, .choice-group');
      if (el.tagName === 'FIELDSET') el.querySelector('legend').after(p);
      else if (caixa) caixa.appendChild(p);
      else el.after(p);
    }
    p.querySelector('span').textContent = msg;
    if (el.tagName !== 'FIELDSET') el.setAttribute('aria-invalid', 'true');
    el.closest('.field, .choice-group')?.classList.add('is-invalid');
    el.setAttribute('aria-describedby', descr.concat(id).join(' '));
  }

  /*
   * Valida o formulário e mostra os erros no campo e num resumo no topo.
   * "extra" recebe o form e devolve [{ el, msg }] com regras de negócio.
   * Depois da primeira tentativa, o erro some enquanto a pessoa corrige.
   */
  function validate(form, extra) {
    const erros = [];
    form.querySelectorAll('input, select, textarea').forEach((c) => {
      if (c.type === 'radio' || c.type === 'file' || c.type === 'hidden' || c.closest('[hidden]')) return;
      const msg = erroDoCampo(c);
      marcarErro(c, msg);
      if (msg) erros.push({ el: c, msg });
    });
    form.querySelectorAll('fieldset[data-required-group]').forEach((fs) => {
      if (fs.closest('[hidden]')) return;
      const msg = erroDoGrupo(fs);
      marcarErro(fs, msg);
      if (msg) erros.push({ el: fs, msg });
    });
    if (extra) {
      extra(form).forEach((e) => {
        if (erros.some((x) => x.el === e.el)) return;
        marcarErro(e.el, e.msg);
        erros.push(e);
      });
    }
    resumoDeErros(form, erros);

    if (!form.dataset.tentou) {
      form.dataset.tentou = '1';
      form.addEventListener('input', (ev) => {
        const c = ev.target;
        const fs = c.closest('fieldset[data-required-group]');
        if (fs && c.type === 'radio') { if (!erroDoGrupo(fs)) marcarErro(fs, ''); return; }
        if (c.getAttribute('aria-invalid') === 'true' && !erroDoCampo(c)) marcarErro(c, '');
      });
      form.addEventListener('change', (ev) => {
        const c = ev.target;
        if (c.type === 'checkbox' && c.getAttribute('aria-invalid') === 'true' && !erroDoCampo(c)) marcarErro(c, '');
      });
    }
    return erros.length === 0;
  }

  function resumoDeErros(form, erros) {
    let caixa = form.querySelector('.error-summary');
    if (!erros.length) { if (caixa) caixa.remove(); return; }
    if (!caixa) {
      caixa = h('div', { class: 'error-summary', tabindex: '-1', role: 'alert', 'aria-labelledby': uid('resumo') });
      form.prepend(caixa);
    }
    const tituloId = caixa.getAttribute('aria-labelledby');
    caixa.replaceChildren(
      h('h2', { id: tituloId, class: 'error-summary__title' }, icon('alert'),
        erros.length === 1 ? 'Falta corrigir 1 campo' : 'Falta corrigir ' + erros.length + ' campos'),
      h('ul', null, erros.map((e) => {
        const alvo = alvoDoErro(e.el);
        if (!alvo.id) alvo.id = uid('campo');
        return h('li', null, h('a', {
          href: '#' + alvo.id,
          onclick(ev) { ev.preventDefault(); alvo.focus(); },
          text: e.msg
        }));
      }))
    );
    caixa.focus();
  }

  /* ---------------------------------------------- Avisos e anúncios */

  let regiao;
  function announce(mensagem) {
    if (!regiao) {
      regiao = h('div', { class: 'sr-only', 'aria-live': 'polite', 'aria-atomic': 'true' });
      document.body.appendChild(regiao);
    }
    regiao.textContent = '';
    window.setTimeout(() => { regiao.textContent = mensagem; }, 60);
  }

  let toastTimer;
  function toast(mensagem, tipo) {
    document.querySelectorAll('.toast').forEach((t) => t.remove());
    window.clearTimeout(toastTimer);
    const el = h('div', { class: 'toast toast--' + (tipo || 'info'), role: 'status' },
      icon(tipo === 'erro' ? 'alert' : 'check-circle'), h('span', { text: mensagem }));
    document.body.appendChild(el);
    toastTimer = window.setTimeout(() => el.remove(), 5000);
  }

  // Mensagem que sobrevive a uma troca de página.
  function flash(mensagem, tipo) { store.set('flash', { mensagem, tipo }); }
  function takeFlash() {
    const f = store.get('flash', null);
    store.remove('flash');
    return f;
  }

  /* ------------------------------------------------- Arquivos */

  function download(nome, conteudo, tipo) {
    const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
    const a = h('a', { href: url, download: nome, hidden: true });
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Convite de calendário (.ics) para a reunião inicial.
  function ics(reuniao, local) {
    const inicio = reuniao.data.replace(/-/g, '') + 'T' + reuniao.hora.replace(':', '') + '00';
    const fimH = String(parseInt(reuniao.hora, 10) + 1).padStart(2, '0');
    const fim = reuniao.data.replace(/-/g, '') + 'T' + fimH + reuniao.hora.slice(3).replace(':', '') + '00';
    const escapa = (t) => String(t).replace(/[\\,;]/g, (c) => '\\' + c);
    return [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Travessia//Prototipo//PT',
      'BEGIN:VEVENT',
      'UID:' + reuniao.data + reuniao.hora + '@travessia.example',
      'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z',
      'DTSTART:' + inicio, 'DTEND:' + fim,
      'SUMMARY:' + escapa('Reunião inicial com a Travessia'),
      'LOCATION:' + escapa(local),
      'DESCRIPTION:' + escapa('Conversa de 40 minutos sobre o seu caminho para Portugal. Protótipo: evento de exemplo.'),
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
  }

  /* ------------------------------------------- Processos (o "banco") */

  const db = {
    load() {
      let dados = store.get('db', null);
      if (!dados) {
        const demo = window.TRV.data.processoDemo();
        dados = { processos: { [demo.protocolo]: demo } };
        store.set('db', dados);
      }
      return dados;
    },
    get(protocolo) { return db.load().processos[protocolo] || null; },
    save(processo) {
      const dados = db.load();
      dados.processos[processo.protocolo] = processo;
      store.set('db', dados);
    },
    findByEmail(email) {
      const alvo = normaliza(email);
      return Object.values(db.load().processos).find((p) => normaliza(p.email) === alvo) || null;
    },
    novoProtocolo() {
      const ano = String(new Date().getFullYear()).slice(2);
      let p;
      do { p = 'TRV-' + ano + '-' + String(1000 + Math.floor(Math.random() * 9000)); } while (db.get(p));
      return p;
    },
    reset() { store.remove('db'); }
  };

  const sessao = {
    get() { return store.get('sessao', null); },
    entrar(protocolo) { store.set('sessao', protocolo); },
    sair() { store.remove('sessao'); }
  };

  /* --------------------------------------------- Cabeçalho e rodapé */

  function initHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    const botao = header.querySelector('.nav-toggle');
    const menu = document.getElementById(botao ? botao.getAttribute('aria-controls') : '');

    const setMenu = (abrir) => {
      if (!botao) return;
      botao.setAttribute('aria-expanded', String(abrir));
      botao.setAttribute('aria-label', abrir ? 'Fechar menu' : 'Abrir menu');
      botao.querySelector('use').setAttribute('href', 'img/icons.svg#i-' + (abrir ? 'close' : 'menu'));
      header.classList.toggle('is-open', abrir);
    };

    if (botao && menu) {
      botao.addEventListener('click', () => setMenu(botao.getAttribute('aria-expanded') !== 'true'));
      menu.addEventListener('click', (ev) => { if (ev.target.closest('a')) setMenu(false); });
      document.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape' && header.classList.contains('is-open')) { setMenu(false); botao.focus(); }
      });
      window.matchMedia('(min-width: 1120px)').addEventListener('change', (mq) => { if (mq.matches) setMenu(false); });
    }

    // Cabeçalho ganha fundo sólido depois que a página rola.
    const marcar = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
    marcar();
    window.addEventListener('scroll', marcar, { passive: true });

    // Quem está com a sessão aberta vê "Meu processo" no lugar de "Área do cliente".
    const cta = header.querySelector('[data-area-cliente]');
    if (cta && sessao.get() && db.get(sessao.get())) {
      cta.href = 'portal.html';
      cta.querySelector('span').textContent = 'Meu processo';
    }
  }

  function initFooter() {
    document.querySelectorAll('[data-ano]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
    document.querySelectorAll('[data-restaurar]').forEach((b) => b.addEventListener('click', () => {
      store.clear();
      flash('Pronto: os dados de exemplo foram restaurados.');
      window.location.href = 'index.html';
    }));
  }

  // Elementos com [data-reveal] aparecem suavemente ao entrar na tela.
  function initReveal() {
    const els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;
    if (reduzMovimento() || !('IntersectionObserver' in window)) return;
    document.documentElement.classList.add('has-reveal');
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
  }

  /* ---------------------------------------------------------- Chat */

  // Assistente com respostas prontas. Não usa IA nem servidor: procura palavras-chave.
  function initChat() {
    if (document.body.dataset.chat === 'off') return;
    const D = window.TRV.data;
    const painelId = 'chat-painel';
    const tituloId = 'chat-titulo';

    const abrir = h('button', { class: 'chat-fab', type: 'button', 'aria-expanded': 'false', 'aria-controls': painelId },
      icon('chat'), h('span', { text: 'Dúvidas? Fale com a Lia' }));

    const log = h('div', { class: 'chat__log', role: 'log', 'aria-live': 'polite', 'aria-label': 'Conversa com a Lia', tabindex: '0' });
    const campo = h('input', { class: 'chat__input', type: 'text', id: 'chat-campo', autocomplete: 'off', maxlength: '300', placeholder: 'Escreva sua dúvida' });
    const form = h('form', { class: 'chat__form', novalidate: true },
      h('label', { class: 'sr-only', for: 'chat-campo', text: 'Sua mensagem para a Lia' }),
      campo,
      h('button', { class: 'btn btn--icon btn--primary', type: 'submit', 'aria-label': 'Enviar mensagem' }, icon('send')));
    const sugestoes = h('div', { class: 'chat__chips', role: 'group', 'aria-label': 'Assuntos sugeridos' });

    const fechar = h('button', { class: 'btn btn--icon btn--ghost', type: 'button', 'aria-label': 'Fechar conversa' }, icon('close'));
    const painel = h('section', { class: 'chat', id: painelId, role: 'dialog', 'aria-modal': 'false', 'aria-labelledby': tituloId, hidden: true },
      h('div', { class: 'chat__head' },
        h('span', { class: 'chat__avatar', 'aria-hidden': 'true', text: 'L' }),
        h('div', null,
          h('h2', { id: tituloId, class: 'chat__title', text: 'Lia, assistente da Travessia' }),
          h('p', { class: 'chat__sub', text: 'Respostas automáticas. Para o seu caso, fale com a equipe.' })),
        fechar),
      log, sugestoes, form);

    document.body.append(abrir, painel);

    const historico = store.get('chat', []);

    function bolha(msg) {
      const item = h('div', { class: 'chat__msg chat__msg--' + msg.de },
        h('span', { class: 'sr-only', text: msg.de === 'lia' ? 'Lia: ' : 'Você: ' }),
        h('p', { text: msg.texto }));
      if (msg.acoes) {
        item.appendChild(h('div', { class: 'chat__actions' },
          msg.acoes.map((a) => h('a', { class: 'btn btn--sm btn--soft', href: a[1] }, a[0], icon('arrow-right')))));
      }
      log.appendChild(item);
      log.scrollTop = log.scrollHeight;
    }

    function responder(texto) {
      const n = normaliza(texto);
      const intent = D.chat.find((i) => i.chaves.some((k) => n.indexOf(k) >= 0));
      return intent
        ? { de: 'lia', texto: intent.resposta, acoes: intent.acoes }
        : { de: 'lia', texto: D.chatPadrao, acoes: [['Agendar uma conversa', 'agendar.html']] };
    }

    function enviar(texto) {
      const t = texto.trim();
      if (!t) return;
      const minha = { de: 'voce', texto: t };
      historico.push(minha);
      bolha(minha);
      const digitando = h('div', { class: 'chat__typing', 'aria-hidden': 'true' }, h('span'), h('span'), h('span'));
      log.appendChild(digitando);
      log.scrollTop = log.scrollHeight;
      window.setTimeout(() => {
        digitando.remove();
        const r = responder(t);
        historico.push(r);
        store.set('chat', historico.slice(-40));
        bolha(r);
      }, reduzMovimento() ? 150 : 650);
    }

    D.chatSugestoes.forEach((s) => sugestoes.appendChild(
      h('button', { class: 'chip', type: 'button', text: s, onclick: () => enviar(s) })));

    if (!historico.length) {
      historico.push({ de: 'lia', texto: 'Oi, eu sou a Lia! Posso tirar dúvidas rápidas sobre os caminhos para Portugal, documentos e prazos. Sobre o que você quer saber?' });
    }
    historico.forEach(bolha);

    const setAberto = (sim) => {
      painel.hidden = !sim;
      abrir.setAttribute('aria-expanded', String(sim));
      abrir.classList.toggle('is-hidden', sim);
      if (sim) { campo.focus(); log.scrollTop = log.scrollHeight; } else abrir.focus();
    };

    abrir.addEventListener('click', () => setAberto(true));
    fechar.addEventListener('click', () => setAberto(false));
    painel.addEventListener('keydown', (ev) => { if (ev.key === 'Escape') setAberto(false); });
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      enviar(campo.value);
      campo.value = '';
    });
    document.querySelectorAll('[data-abrir-chat]').forEach((b) => b.addEventListener('click', () => setAberto(true)));
  }

  /* -------------------------------------------------------- Início */

  function init() {
    initHeader();
    initFooter();
    initReveal();
    initChat();
    const f = takeFlash();
    if (f) window.setTimeout(() => toast(f.mensagem, f.tipo), 150);
  }

  window.TRV = Object.assign(window.TRV || {}, {
    store, h, append, icon, uid, param, reduzMovimento, fmt, hoje, somaDias, agoraISO,
    normaliza, digitos, masks, applyMasks, validate, marcarErro, announce, toast, flash, takeFlash, download, ics,
    db, sessao, init
  });
})();
