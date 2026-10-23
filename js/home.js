/* Travessia: página inicial (caminhos, números, dúvidas e contato). */
(function () {
  'use strict';

  const T = window.TRV;
  const D = T.data;
  const h = T.h;

  T.init();

  /* ------------------------------------------------------ Caminhos */

  const lista = document.getElementById('lista-caminhos');
  const filtros = document.getElementById('filtros-caminhos');

  function cartao(c) {
    const tituloId = 'caminho-' + c.id;
    return h('li', null,
      h('article', { class: 'path-card', 'aria-labelledby': tituloId },
        h('span', { class: 'path-card__icon' }, T.icon(c.icone)),
        h('h3', { id: tituloId, text: c.nome }),
        h('p', { text: c.resumo }),
        h('p', { class: 'path-card__meta' }, T.icon('clock'), 'Prazo de exemplo: ' + c.prazo),
        h('a', { class: 'path-card__link', href: 'caminho.html?ver=' + c.id },
          'Ver documentos', h('span', { class: 'sr-only', text: ' de ' + c.nome }), T.icon('arrow-right', 'icon-move'))));
  }

  function mostrar(grupo) {
    const itens = D.caminhos.filter((c) => !grupo || c.grupo === grupo);
    lista.replaceChildren(...itens.map(cartao));
    return itens.length;
  }

  mostrar('');
  filtros.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-grupo]');
    if (!b) return;
    filtros.querySelectorAll('[data-grupo]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    const n = mostrar(b.dataset.grupo);
    T.announce(T.fmt.plural(n, 'caminho exibido', 'caminhos exibidos'));
  });

  /* -------------------------------------------- Contador animado */

  const numeros = document.querySelectorAll('[data-count]');
  if (numeros.length && !T.reduzMovimento() && 'IntersectionObserver' in window) {
    const animar = (el) => {
      const alvo = parseInt(el.dataset.count, 10);
      const inicio = performance.now();
      const duracao = 1400;
      const passo = (agora) => {
        const t = Math.min(1, (agora - inicio) / duracao);
        el.textContent = T.fmt.int(Math.round(alvo * (1 - Math.pow(1 - t, 3))));
        if (t < 1) window.requestAnimationFrame(passo);
      };
      window.requestAnimationFrame(passo);
    };
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        if (!e.isIntersecting) return;
        animar(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: .6 });
    numeros.forEach((el) => io.observe(el));
  }

  /* --------------------------------------------------------- Dúvidas */

  const faq = document.getElementById('faq');
  const busca = document.getElementById('faq-busca');
  const contagem = document.getElementById('faq-contagem');

  // Destaca o termo buscado sem usar innerHTML.
  function realce(texto, termo) {
    if (!termo) return [texto];
    const base = T.normaliza(texto);
    const partes = [];
    let i = 0;
    let pos = base.indexOf(termo);
    while (pos >= 0) {
      if (pos > i) partes.push(texto.slice(i, pos));
      partes.push(h('mark', { text: texto.slice(pos, pos + termo.length) }));
      i = pos + termo.length;
      pos = base.indexOf(termo, i);
    }
    partes.push(texto.slice(i));
    return partes;
  }

  function renderFaq() {
    const termo = T.normaliza(busca.value);
    const itens = D.faq.filter((q) => !termo || T.normaliza(q[0] + ' ' + q[1]).indexOf(termo) >= 0);
    if (!itens.length) {
      faq.replaceChildren(h('p', { class: 'empty' }, 'Nenhuma dúvida fala de “' + busca.value.trim() + '”. ',
        h('button', { class: 'link-button link-button--paper', type: 'button', 'data-abrir-chat': '', text: 'Pergunte para a Lia', onclick: () => document.querySelector('.chat-fab').click() })));
    } else {
      faq.replaceChildren(...itens.map((q) => h('details', { open: !!termo },
        h('summary', null, h('span', null, realce(q[0], termo)), T.icon('chevron-down')),
        h('div', null, h('p', null, realce(q[1], termo))))));
    }
    contagem.textContent = termo ? T.fmt.plural(itens.length, 'dúvida encontrada', 'dúvidas encontradas') : '';
  }

  let espera;
  busca.addEventListener('input', () => {
    window.clearTimeout(espera);
    espera = window.setTimeout(renderFaq, 200);
  });
  renderFaq();

  /* --------------------------------------------------------- Contato */

  const form = document.getElementById('contato-form');
  const caixa = document.getElementById('contato-caixa');
  T.applyMasks(form);

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (!T.validate(form)) return;

    const dados = Object.fromEntries(new FormData(form));
    const contatos = T.store.get('contatos', []);
    contatos.push(Object.assign(dados, { em: T.agoraISO() }));
    T.store.set('contatos', contatos);

    const primeiroNome = dados.nome.trim().split(/\s+/)[0];
    const titulo = h('h3', { tabindex: '-1', text: 'Mensagem recebida, ' + primeiroNome + '!' });
    caixa.replaceChildren(h('div', { class: 'confirm' },
      h('div', { class: 'confirm__seal' }, T.icon('check-circle')),
      titulo,
      h('p', { class: 'muted', text: 'Vamos responder em até 1 dia útil no e-mail ' + dados.email + '. Enquanto isso, que tal descobrir o seu caminho?' }),
      h('div', { class: 'confirm__actions' },
        h('a', { class: 'btn btn--primary', href: 'caminho.html' }, 'Fazer o simulador'),
        h('a', { class: 'btn btn--ghost', href: 'agendar.html' }, 'Agendar conversa'))));
    titulo.focus();
  });
})();
