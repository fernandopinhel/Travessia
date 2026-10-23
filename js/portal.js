/* Travessia: área do cliente (jornada, documentos, conversa e demonstração). */
(function () {
  'use strict';

  const T = window.TRV;
  const D = T.data;
  const h = T.h;

  // Sem sessão, volta para a entrada.
  const protocolo = T.sessao.get();
  let p = protocolo && T.db.get(protocolo);
  if (!p) {
    T.flash('Entre com o seu e-mail e protocolo para ver o processo.', 'info');
    window.location.replace('entrar.html');
    return;
  }

  T.init();

  const STATUS = {
    pendente: { t: 'Falta enviar', classe: '', icone: 'file' },
    'em-analise': { t: 'Em análise', classe: 'badge--info', icone: 'clock' },
    aprovado: { t: 'Aprovado', classe: 'badge--sucesso', icone: 'check-circle' },
    recusado: { t: 'Ajustar e reenviar', classe: 'badge--erro', icone: 'alert' }
  };
  const TIPOS = ['application/pdf', 'image/jpeg', 'image/png'];
  const LIMITE = 10 * 1024 * 1024;

  const arquivo = document.getElementById('arquivo');
  let docAlvo = null;

  const consultora = () => D.consultoras[p.consultora] || D.consultoras[0];
  const primeiroNome = (n) => n.trim().split(/\s+/)[0];

  function salvar() { T.db.save(p); }
  function registrar(texto) { p.historico.push({ em: T.agoraISO(), texto }); }

  /* --------------------------------------------------------- Topo */

  function renderTopo() {
    const c = D.porId(p.caminho);
    document.getElementById('portal-titulo').textContent = 'Olá, ' + primeiroNome(p.nome) + '!';
    document.getElementById('portal-meta').replaceChildren(
      h('li', null, T.icon('passport'), 'Protocolo ' + p.protocolo),
      h('li', null, T.icon('route'), c ? c.nome : 'Caminho definido na reunião inicial'),
      h('li', null, T.icon('user'), 'Consultora: ' + consultora().nome));
  }

  /* ------------------------------------------------------- Jornada */

  function renderJornada() {
    document.getElementById('jornada-etapa').textContent = p.etapa >= 4 && p.concluido
      ? 'Concluído'
      : 'Etapa ' + (p.etapa + 1) + ' de ' + D.etapas.length;
    document.getElementById('jornada').replaceChildren(...D.etapas.map((e, i) => {
      const feita = i < p.etapa || (i === 4 && p.concluido);
      const atual = i === p.etapa && !feita;
      return h('li', { class: feita ? 'is-done' : atual ? 'is-current' : '', 'aria-current': atual ? 'step' : null },
        h('span', { class: 'journey__dot', 'aria-hidden': 'true' }),
        h('strong', { text: e.titulo }),
        h('small', { text: e.texto }),
        h('span', { class: 'journey__state', text: feita ? 'Concluída' : atual ? 'Agora' : 'A seguir' }));
    }));
  }

  /* ---------------------------------------------------- Documentos */

  const podeEnviar = () => p.etapa <= 1 && p.caminho;

  function renderDocs(focoId) {
    const alvo = document.getElementById('docs-conteudo');
    const docs = p.documentos;

    if (!p.caminho) {
      alvo.replaceChildren(h('div', { class: 'notice' }, T.icon('info'),
        h('p', { text: 'A lista de documentos aparece depois da reunião inicial, quando definirmos juntos o seu caminho.' })));
      return;
    }

    const aprovados = docs.filter((d) => d.status === 'aprovado').length;
    const enviados = docs.filter((d) => d.status !== 'pendente').length;
    const barra = h('div', { class: 'progress__bar' });
    barra.style.width = Math.round((aprovados / docs.length) * 100) + '%';

    const faltam = docs.filter((d) => d.status === 'pendente' || d.status === 'recusado');
    let aviso = null;
    if (p.etapa === 0) {
      aviso = h('div', { class: 'notice' }, T.icon('info'),
        h('p', { text: 'Se quiser, já pode adiantar os documentos. A equipe revisa depois da reunião inicial.' }));
    } else if (p.etapa === 1 && faltam.some((d) => d.status === 'recusado')) {
      aviso = h('div', { class: 'notice notice--danger' }, T.icon('alert'),
        h('p', { text: 'Um ou mais documentos precisam de ajuste. Veja o motivo em cada um e envie de novo.' }));
    } else if (p.etapa >= 2) {
      aviso = h('div', { class: 'notice' }, T.icon('lock'),
        h('p', { text: 'Os documentos estão com a equipe. Se precisar trocar algum, fale com a sua consultora pela conversa.' }));
    }

    const lista = h('ul', { class: 'docs' }, docs.map((d) => itemDoc(d)));

    let rodape = null;
    if (p.etapa === 1) {
      const pronto = faltam.length === 0;
      rodape = h('div', { class: 'form-actions' },
        h('button', {
          class: 'btn btn--primary', type: 'button', id: 'enviar-analise',
          'aria-describedby': 'enviar-analise-dica',
          disabled: !pronto,
          onclick: enviarParaAnalise
        }, T.icon('send'), 'Enviar tudo para a análise final'),
        h('p', { class: 'muted', id: 'enviar-analise-dica', text: pronto
          ? 'Tudo pronto: a equipe faz a conferência final e dá entrada no pedido.'
          : 'Libera quando todos os documentos estiverem enviados. ' + T.fmt.plural(faltam.length, 'documento ainda precisa', 'documentos ainda precisam') + ' de você.' }));
    }

    alvo.replaceChildren(
      h('div', { class: 'meter' },
        h('span', { text: aprovados + ' de ' + docs.length + ' aprovados' }),
        h('div', { class: 'progress', role: 'progressbar', 'aria-label': 'Documentos aprovados', 'aria-valuemin': '0', 'aria-valuemax': String(docs.length), 'aria-valuenow': String(aprovados) }, barra),
        h('span', { text: enviados + ' enviados' })),
      aviso,
      lista, rodape);

    if (focoId) {
      const el = document.getElementById('doc-' + focoId + '-titulo');
      if (el) el.focus();
    }
  }

  function itemDoc(d) {
    const s = STATUS[d.status];
    const tituloId = 'doc-' + d.id + '-titulo';
    const acoes = [];
    if (podeEnviar()) {
      if (d.status === 'pendente' || d.status === 'recusado') {
        acoes.push(h('button', { class: 'btn btn--sm ' + (d.status === 'recusado' ? 'btn--primary' : 'btn--soft'), type: 'button', 'aria-describedby': tituloId, onclick: () => escolher(d) },
          T.icon('upload'), d.status === 'recusado' ? 'Enviar de novo' : 'Enviar arquivo'));
      } else if (d.status === 'em-analise') {
        acoes.push(h('button', { class: 'btn btn--sm btn--ghost', type: 'button', 'aria-describedby': tituloId, onclick: () => escolher(d) }, T.icon('refresh'), 'Trocar'));
        acoes.push(h('button', { class: 'btn btn--sm btn--danger', type: 'button', 'aria-describedby': tituloId, onclick: () => remover(d) }, T.icon('trash'), 'Remover'));
      }
    }

    const li = h('li', { class: 'doc doc--' + d.status },
      h('span', { class: 'doc__icon', 'aria-hidden': 'true' }, T.icon(s.icone)),
      h('div', { class: 'doc__body' },
        h('h3', { class: 'doc__title', id: tituloId, tabindex: '-1' },
          h('span', { text: d.nome }), h('span', { class: 'badge ' + s.classe, text: s.t })),
        h('p', { class: 'doc__desc', text: d.descricao }),
        d.arquivo ? h('p', { class: 'doc__file' }, T.icon('file'),
          d.arquivo.nome + ' · ' + T.fmt.bytes(d.arquivo.tamanho) + (d.em ? ' · enviado em ' + T.fmt.dateTime(d.em) : '')) : null,
        d.status === 'recusado' && d.motivo ? h('p', { class: 'doc__reason' }, h('strong', { text: 'O que ajustar: ' }), d.motivo) : null),
      acoes.length ? h('div', { class: 'doc__actions' }, acoes) : null);

    // Arrastar e soltar um arquivo direto no documento.
    if (podeEnviar() && d.status !== 'aprovado') {
      li.addEventListener('dragover', (ev) => { ev.preventDefault(); li.classList.add('is-drag'); });
      li.addEventListener('dragleave', () => li.classList.remove('is-drag'));
      li.addEventListener('drop', (ev) => {
        ev.preventDefault();
        li.classList.remove('is-drag');
        const f = ev.dataTransfer.files && ev.dataTransfer.files[0];
        if (f) receber(d, f);
      });
    }
    return li;
  }

  function escolher(d) {
    docAlvo = d.id;
    arquivo.value = '';
    arquivo.click();
  }

  arquivo.addEventListener('change', () => {
    const f = arquivo.files && arquivo.files[0];
    const d = p.documentos.find((x) => x.id === docAlvo);
    if (f && d) receber(d, f);
  });

  // Guarda só o nome, o tamanho e o tipo: o conteúdo do arquivo não sai do navegador.
  function receber(d, f) {
    const tipoOk = TIPOS.indexOf(f.type) >= 0 || /\.(pdf|jpe?g|png)$/i.test(f.name);
    if (!tipoOk) {
      T.toast('“' + f.name + '” não é PDF, JPG nem PNG. Envie o documento num desses formatos.', 'erro');
      return;
    }
    if (f.size > LIMITE) {
      T.toast('“' + f.name + '” tem ' + T.fmt.bytes(f.size) + '. O limite é 10 MB: tente comprimir ou digitalizar em resolução menor.', 'erro');
      return;
    }
    const reenvio = d.status === 'recusado';
    Object.assign(d, { status: 'em-analise', arquivo: { nome: f.name, tamanho: f.size, tipo: f.type }, em: T.agoraISO(), motivo: '' });
    registrar(d.nome + (reenvio ? ' reenviado.' : ' enviado.'));
    salvar();
    renderTudo(d.id);
    T.toast(d.nome + ' enviado. A equipe vai revisar.', 'sucesso');
  }

  function remover(d) {
    confirmar('Remover o arquivo?', 'O arquivo “' + d.arquivo.nome + '” sai da lista e o documento volta para “Falta enviar”.', 'Remover').then((sim) => {
      if (!sim) return;
      Object.assign(d, { status: 'pendente', arquivo: null, em: null });
      registrar('Arquivo de ' + d.nome.toLowerCase() + ' removido.');
      salvar();
      renderTudo(d.id);
      T.announce('Arquivo removido.');
    });
  }

  function enviarParaAnalise() {
    confirmar('Enviar para a análise final?', 'A equipe confere todos os documentos juntos antes de dar entrada no pedido. Depois disso, as trocas de arquivo passam pela sua consultora.', 'Enviar').then((sim) => {
      if (!sim) return;
      p.etapa = 2;
      p.documentos.forEach((d) => { if (d.status !== 'aprovado') d.status = 'em-analise'; });
      registrar('Documentos enviados para a análise final.');
      mensagemDaConsultora('Recebi tudo, ' + primeiroNome(p.nome) + '! Agora fazemos a conferência final. Aviso aqui assim que dermos entrada no pedido.');
      salvar();
      renderTudo();
      focarTitulo('docs-titulo');
      T.toast('Documentos enviados para a análise final.', 'sucesso');
    });
  }

  /* ------------------------------------------------------- Conversa */

  const caixaMsgs = document.getElementById('mensagens');

  function bolha(m) {
    const autor = m.de === 'cliente' ? 'Você' : m.de === 'consultora' ? primeiroNome(consultora().nome) : 'Travessia';
    return h('div', { class: 'msg msg--' + m.de },
      h('span', { class: 'msg__meta', text: autor + ' · ' + T.fmt.dateTime(m.em) }),
      h('p', { text: m.texto }));
  }

  // Só acrescenta as mensagens novas: o log anuncia o que chega, sem repetir a conversa.
  function renderConversa() {
    document.getElementById('conversa-titulo').textContent = 'Conversa com ' + primeiroNome(consultora().nome);
    p.mensagens.slice(caixaMsgs.children.length).forEach((m) => caixaMsgs.appendChild(bolha(m)));
    caixaMsgs.scrollTop = caixaMsgs.scrollHeight;
  }

  function mensagemDaConsultora(texto) {
    const m = { de: 'consultora', texto, em: T.agoraISO() };
    p.mensagens.push(m);
    return m;
  }

  const msgForm = document.getElementById('msg-form');
  msgForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    if (!T.validate(msgForm)) return;
    const campo = document.getElementById('msg-texto');
    const m = { de: 'cliente', texto: campo.value.trim(), em: T.agoraISO() };
    p.mensagens.push(m);
    salvar();
    renderConversa();
    campo.value = '';

    window.setTimeout(() => {
      mensagemDaConsultora('Recebi a sua mensagem e respondo com calma ainda hoje. (Resposta automática do protótipo.)');
      salvar();
      renderConversa();
    }, 1200);
  });

  /* ------------------------------------------------- Equipe e reunião */

  function renderEquipe() {
    const c = consultora();
    const r = p.reuniao;
    const f = D.formatos.find((x) => x.v === r.formato) || D.formatos[0];
    const local = r.formato === 'video' ? 'Videochamada' : f.t + ', ' + f.d;
    document.getElementById('equipe').replaceChildren(
      h('div', { class: 'person' },
        h('span', { class: 'person__avatar', 'aria-hidden': 'true', text: c.iniciais }),
        h('div', null, h('strong', { text: c.nome }), h('small', { text: 'Sua consultora, em ' + c.cidade }))),
      h('div', { class: 'block' },
        h('h3', { class: 'label', text: r.realizada ? 'Reunião inicial realizada' : 'Próxima reunião' }),
        h('p', { class: 'muted' }, T.fmt.dateLong(r.data) + ', às ' + r.hora + ' · ' + local),
        r.realizada ? null : h('button', {
          class: 'btn btn--sm btn--soft', type: 'button',
          onclick: () => T.download('reuniao-travessia.ics', T.ics(r, local), 'text/calendar;charset=utf-8')
        }, T.icon('calendar'), 'Adicionar à agenda')),
      h('p', { class: 'block' }, h('a', { href: '#conversa' }, 'Mandar mensagem para ' + primeiroNome(c.nome))));
  }

  function renderHistorico() {
    const itens = p.historico.slice().reverse();
    document.getElementById('historico').replaceChildren(...itens.map((e) =>
      h('li', null, h('time', { datetime: e.em, text: T.fmt.dateTime(e.em) }), e.texto)));
  }

  /* ---------------------------------------------- Demonstração */

  // Simula o que a equipe faria do outro lado, para mostrar o fluxo inteiro.
  function proximoPasso() {
    const emAnalise = p.documentos.filter((d) => d.status === 'em-analise');
    if (p.etapa === 0) {
      return {
        rotulo: 'Simular a reunião inicial',
        texto: 'Marca a reunião como feita e libera a etapa de documentos.',
        acao() {
          p.reuniao.realizada = true;
          if (!p.caminho) {
            const sim = T.store.get('simulador', null);
            const r = sim && sim.fim ? D.avaliar(sim.respostas) : [];
            p.caminho = r.length ? r[0].caminho.id : 'd7';
            p.documentos = D.novosDocumentos(p.caminho);
          }
          p.etapa = 1;
          registrar('Reunião inicial realizada.');
          mensagemDaConsultora('Foi ótimo conversar, ' + primeiroNome(p.nome) + '! Seguimos com o caminho “' + D.porId(p.caminho).nome + '”. A lista de documentos já está aqui.');
          return 'Reunião inicial concluída.';
        }
      };
    }
    if (p.etapa === 1) {
      return {
        rotulo: 'Simular a revisão da equipe',
        texto: emAnalise.length
          ? 'Aprova ' + T.fmt.plural(emAnalise.length, 'documento que está', 'documentos que estão') + ' em análise.'
          : 'Envie um documento para a equipe ter o que revisar.',
        desabilitado: !emAnalise.length,
        acao() {
          emAnalise.forEach((d) => { d.status = 'aprovado'; registrar(d.nome + ' aprovado.'); });
          return T.fmt.plural(emAnalise.length, 'documento aprovado', 'documentos aprovados') + '.';
        }
      };
    }
    if (p.etapa === 2) {
      return {
        rotulo: 'Simular a entrada do pedido',
        texto: 'Conclui a análise final e protocola o pedido no órgão responsável.',
        acao() {
          p.documentos.forEach((d) => { d.status = 'aprovado'; });
          p.etapa = 3;
          const orgao = p.caminho === 'nacionalidade' ? 'no IRN' : p.caminho === 'reagrupamento' ? 'na AIMA' : 'no consulado';
          registrar('Pedido protocolado ' + orgao + '.');
          mensagemDaConsultora('Boa notícia: demos entrada no seu pedido ' + orgao + '. Agora é com eles, e eu acompanho por aqui.');
          return 'Pedido protocolado.';
        }
      };
    }
    if (p.etapa === 3) {
      return {
        rotulo: 'Simular a decisão',
        texto: 'Marca o documento como pronto.',
        acao() {
          p.etapa = 4;
          p.concluido = true;
          registrar('Documento pronto.');
          mensagemDaConsultora('Saiu, ' + primeiroNome(p.nome) + '! O seu documento está pronto. Vou te passar os próximos passos para a mudança. Boa travessia!');
          return 'Documento pronto. Boa travessia!';
        }
      };
    }
    return { rotulo: 'Processo concluído', texto: 'Esta jornada chegou ao fim. Restaure os dados para começar de novo.', desabilitado: true };
  }

  function renderDemo() {
    const passo = proximoPasso();
    document.getElementById('demo').replaceChildren(
      h('p', { class: 'muted', text: 'No serviço real, estes passos são da equipe. Aqui você pode simulá-los para ver o fluxo inteiro.' }),
      h('button', {
        class: 'btn btn--soft btn--block', type: 'button', id: 'demo-acao',
        disabled: !!passo.desabilitado, 'aria-describedby': 'demo-texto',
        onclick() {
          const msg = passo.acao();
          salvar();
          renderTudo();
          T.toast(msg, 'sucesso');
          const b = document.getElementById('demo-acao');
          if (b && !b.disabled) b.focus(); else focarTitulo('jornada-titulo');
        }
      }, T.icon('sparkle'), passo.rotulo),
      h('p', { class: 'form-note', id: 'demo-texto', text: passo.texto }),
      h('button', {
        class: 'link-button link-button--paper', type: 'button',
        onclick: () => confirmar('Restaurar os dados de exemplo?', 'Tudo o que você fez nesta aba volta ao estado inicial.', 'Restaurar').then((sim) => {
          if (!sim) return;
          T.store.clear();
          T.flash('Pronto: os dados de exemplo foram restaurados.');
          window.location.href = 'entrar.html';
        })
      }, 'Restaurar dados de exemplo'));
  }

  /* --------------------------------------------------- Diálogo */

  const dialogo = document.getElementById('confirmar');
  function confirmar(titulo, texto, rotuloOk) {
    document.getElementById('confirmar-titulo').textContent = titulo;
    document.getElementById('confirmar-texto').textContent = texto;
    document.getElementById('confirmar-ok').textContent = rotuloOk;
    const origem = document.activeElement;
    dialogo.returnValue = '';
    dialogo.showModal();
    return new Promise((resolve) => {
      dialogo.addEventListener('close', () => {
        if (origem && document.contains(origem)) origem.focus();
        resolve(dialogo.returnValue === 'sim');
      }, { once: true });
    });
  }

  function focarTitulo(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute('tabindex', '-1');
    el.focus();
  }

  /* ------------------------------------------------------- Início */

  function renderTudo(focoDoc) {
    renderTopo();
    renderJornada();
    renderDocs(focoDoc);
    renderEquipe();
    renderHistorico();
    renderDemo();
    renderConversa();
  }

  document.getElementById('sair').addEventListener('click', () => {
    T.sessao.sair();
    T.flash('Você saiu da área do cliente.', 'info');
    window.location.href = 'entrar.html';
  });

  renderTudo();
  document.title = 'Meu processo, ' + p.protocolo + ' | Travessia';
})();
