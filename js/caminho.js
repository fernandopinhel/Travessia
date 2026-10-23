/* Travessia: simulador de caminho, uma pergunta por vez, e o resultado com documentos. */
(function () {
  'use strict';

  const T = window.TRV;
  const D = T.data;
  const h = T.h;

  T.init();

  const caixa = document.getElementById('wizard');
  const tituloBase = 'Simulador de caminho | Travessia';

  const estado = T.store.get('simulador', { respostas: {}, passo: 0, fim: false });

  function salvar() { T.store.set('simulador', estado); }

  function focar(el) { window.requestAnimationFrame(() => el.focus()); }

  /* --------------------------------------------------- Pergunta */

  function pergunta() {
    const total = D.perguntas.length;
    const p = D.perguntas[estado.passo];
    const tituloId = 'q-' + p.id;
    const dicaId = p.dica ? 'q-' + p.id + '-dica' : null;
    document.title = 'Pergunta ' + (estado.passo + 1) + ' de ' + total + ' | ' + tituloBase;

    const barra = h('div', { class: 'progress__bar' });
    barra.style.width = Math.round((estado.passo / total) * 100) + '%';

    const titulo = h('h2', { id: tituloId, tabindex: '-1', text: p.titulo });

    const grupo = h('fieldset', {
      class: 'choice-group', 'data-required-group': '',
      'aria-describedby': dicaId,
      'data-msg-required': 'Escolha uma opção para continuar.'
    },
    h('legend', { class: 'sr-only', text: p.titulo }),
    h('div', { class: 'choices' + (p.opcoes.length > 4 ? ' choices--2' : '') },
      p.opcoes.map((o) => {
        const id = 'op-' + p.id + '-' + o.v;
        return h('label', { class: 'choice', for: id },
          h('input', { type: 'radio', name: p.id, id, value: o.v, checked: estado.respostas[p.id] === o.v }),
          h('span', { class: 'choice__box' },
            h('span', { class: 'choice__text' },
              h('span', { class: 'choice__title', text: o.t }),
              o.d ? h('span', { class: 'choice__desc', text: o.d }) : null)));
      })));

    const voltar = estado.passo > 0
      ? h('button', { class: 'btn btn--ghost', type: 'button', onclick: () => ir(estado.passo - 1) }, T.icon('arrow-left'), 'Voltar')
      : h('span');
    const ultimo = estado.passo === total - 1;

    const form = h('form', { class: 'wizard__question', novalidate: true },
      h('div', { class: 'wizard__progress' },
        h('p', { class: 'wizard__progress-label' },
          h('span', { text: 'Pergunta ' + (estado.passo + 1) + ' de ' + total }),
          h('span', { text: Math.round((estado.passo / total) * 100) + '% concluído' })),
        h('div', { class: 'progress', 'aria-hidden': 'true' }, barra)),
      titulo,
      p.dica ? h('p', { class: 'muted', id: dicaId, text: p.dica }) : null,
      grupo,
      h('div', { class: 'wizard__nav' }, voltar,
        h('button', { class: 'btn btn--primary', type: 'submit' }, ultimo ? 'Ver meu resultado' : 'Continuar', T.icon('arrow-right', 'icon-move'))));

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      if (!T.validate(form)) return;
      estado.respostas[p.id] = form.querySelector('input:checked').value;
      if (ultimo) { estado.fim = true; salvar(); resultado(true); return; }
      ir(estado.passo + 1);
    });

    caixa.replaceChildren(form);
    return titulo;
  }

  function ir(passo) {
    estado.passo = passo;
    estado.fim = false;
    salvar();
    focar(pergunta());
  }

  /* ---------------------------------------------------- Resultado */

  function listaDocumentos(c) {
    return h('ol', { class: 'doc-list' },
      c.documentos.map((d) => h('li', null, h('div', null, h('strong', { text: d[1] }), h('small', { text: d[2] })))));
  }

  function detalhe(c, opcoes) {
    const titulo = h('h2', { tabindex: '-1', text: c.nome });
    const blocos = [
      h('div', { class: 'result-head' },
        h('span', { class: 'path-card__icon' }, T.icon(c.icone)),
        h('div', null,
          opcoes.selo ? h('p', { class: 'match' }, T.icon('sparkle'), opcoes.selo) : null,
          titulo,
          h('p', { class: 'muted', text: c.resumo }))),
      opcoes.motivos && opcoes.motivos.length
        ? h('div', null, h('h3', { class: 'sr-only', text: 'Por que este caminho' }),
          h('ul', { class: 'reasons' }, opcoes.motivos.map((m) => h('li', null, T.icon('check-circle'), h('span', { text: m })))))
        : null,
      h('dl', { class: 'summary-list' },
        h('div', null, h('dt', { text: 'Para quem é' }), h('dd', { text: c.paraQuem })),
        h('div', null, h('dt', { text: 'Prazo de exemplo' }), h('dd', { text: c.prazo + ', a depender do órgão e do seu caso' }))),
      h('div', { class: 'block' },
        h('h3', { text: 'Documentos que você vai precisar' }),
        listaDocumentos(c)),
      h('div', { class: 'form-actions no-print' },
        h('a', { class: 'btn btn--primary', href: 'agendar.html?caminho=' + c.id }, T.icon('calendar'), 'Agendar conversa sobre este caminho'),
        h('button', { class: 'btn btn--ghost', type: 'button', onclick: () => window.print() }, T.icon('print'), 'Imprimir a lista'))
    ];
    return { titulo, blocos };
  }

  function resultado(mover) {
    const ranking = D.avaliar(estado.respostas);
    document.title = 'Seu resultado | ' + tituloBase;

    if (!ranking.length) {
      const titulo = h('h2', { tabindex: '-1', text: 'Vamos olhar o seu caso com calma' });
      caixa.replaceChildren(
        titulo,
        h('p', { class: 'lead', text: 'Pelas respostas, nenhum caminho se destacou. Isso é mais comum do que parece, e quase sempre tem uma saída. Na reunião inicial, que não tem custo, a equipe olha a sua história com você.' }),
        h('div', { class: 'form-actions' },
          h('a', { class: 'btn btn--primary', href: 'agendar.html' }, T.icon('calendar'), 'Agendar conversa'),
          h('button', { class: 'btn btn--ghost', type: 'button', onclick: refazer }, T.icon('refresh'), 'Refazer o simulador')));
      if (mover) focar(titulo);
      return;
    }

    const melhor = ranking[0];
    const d = detalhe(melhor.caminho, { selo: 'O caminho que mais combina com você', motivos: melhor.motivos });
    const outros = ranking.slice(1, 4);

    caixa.replaceChildren(
      ...d.blocos,
      outros.length ? h('div', { class: 'block no-print' },
        h('h3', { text: 'Também vale conversar sobre' }),
        h('ul', { class: 'alt-paths' }, outros.map((r) => h('li', null,
          h('span', { class: 'path-card__icon' }, T.icon(r.caminho.icone)),
          h('div', null, h('strong', { text: r.caminho.nome }), h('br'), h('small', { class: 'muted', text: r.caminho.paraQuem })),
          h('a', { class: 'btn btn--sm btn--soft', href: 'caminho.html?ver=' + r.caminho.id },
            'Ver', h('span', { class: 'sr-only', text: ' ' + r.caminho.nome })))))) : null,
      h('div', { class: 'block no-print' },
        h('button', { class: 'btn btn--ghost', type: 'button', onclick: refazer }, T.icon('refresh'), 'Refazer o simulador')));
    if (mover) focar(d.titulo);
  }

  function refazer() {
    estado.respostas = {};
    ir(0);
  }

  /* -------------------------------- Caminho escolhido pelo link */

  function verCaminho(c) {
    document.title = c.nome + ' | ' + tituloBase;
    const d = detalhe(c, {});
    caixa.replaceChildren(
      ...d.blocos,
      h('div', { class: 'block no-print notice' }, T.icon('sparkle'),
        h('p', null, 'Não tem certeza de que este é o seu caminho? ',
          h('a', { href: 'caminho.html', onclick(ev) { ev.preventDefault(); history.replaceState(null, '', 'caminho.html'); refazer(); } }, 'Faça o simulador'),
          ' e compare com os outros.')));
  }

  const ver = D.porId(T.param('ver') || '');
  if (ver) verCaminho(ver);
  else if (estado.fim) resultado(false);
  else pergunta(); // quem volta continua de onde parou, sem mover o foco
})();
