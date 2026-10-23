/* Travessia: agendamento da reunião inicial em três etapas. */
(function () {
  'use strict';

  const T = window.TRV;
  const D = T.data;
  const h = T.h;

  T.init();

  const caixa = document.getElementById('agenda');
  const layout = document.getElementById('agenda-layout');
  const aside = document.getElementById('agenda-resumo');
  const resumo = document.getElementById('resumo-lista');
  const stepper = document.getElementById('stepper');
  const tituloBase = 'Agendar conversa | Travessia';
  const nomesEtapas = ['Horário', 'Seus dados', 'Confirmação'];

  // O caminho vem do link (?caminho=) ou do resultado do simulador, se houver.
  function caminhoSugerido() {
    if (D.porId(T.param('caminho') || '')) return T.param('caminho');
    const sim = T.store.get('simulador', null);
    if (sim && sim.fim) {
      const r = D.avaliar(sim.respostas);
      if (r.length) return r[0].caminho.id;
    }
    return '';
  }

  const estado = T.store.get('agendamento', null) || { passo: 1, formato: 'video', data: '', hora: '', caminho: '', dados: {} };
  if (T.param('caminho') && estado.passo < 3) estado.caminho = caminhoSugerido();
  else if (!estado.caminho && estado.passo === 1) estado.caminho = caminhoSugerido();

  const salvar = () => T.store.set('agendamento', estado);
  const focar = (el) => window.requestAnimationFrame(() => el.focus());
  const formato = () => D.formatos.find((f) => f.v === estado.formato) || D.formatos[0];
  const fuso = () => (estado.formato === 'lisboa' ? 'horário de Lisboa' : 'horário de Brasília');

  /* ------------------------------------------------- Disponibilidade */

  // Agenda de exemplo determinística: o mesmo dia mostra sempre os mesmos horários livres.
  function hash(txt) {
    let n = 0;
    for (let i = 0; i < txt.length; i += 1) n = (n * 31 + txt.charCodeAt(i)) % 9973;
    return n;
  }
  const amanha = T.somaDias(T.hoje(), 1);
  function diaUtil(iso) {
    const d = new Date(iso + 'T12:00:00').getDay();
    return d !== 0 && d !== 6;
  }
  function livres(iso) {
    return D.horarios.filter((hr) => hash(iso + hr + estado.formato) % 3 !== 0);
  }
  function disponivel(iso) {
    return iso >= amanha && diaUtil(iso) && hash(iso) % 7 !== 0 && livres(iso).length > 0;
  }

  /* -------------------------------------------------------- Resumo */

  function atualizaResumo() {
    const c = D.porId(estado.caminho);
    const linhas = [
      ['Formato', formato().t],
      ['Dia', estado.data ? T.fmt.dateLong(estado.data) : 'A escolher'],
      ['Horário', estado.hora ? estado.hora + ' (' + fuso() + ')' : 'A escolher'],
      ['Assunto', c ? c.nome : 'Ainda não sei o caminho'],
      ['Duração', '40 minutos, sem custo']
    ];
    resumo.replaceChildren(...linhas.map((l) => h('div', null, h('dt', { text: l[0] }), h('dd', { text: l[1] }))));
  }

  function atualizaStepper() {
    stepper.querySelectorAll('li').forEach((li, i) => {
      const n = i + 1;
      li.classList.toggle('is-done', n < estado.passo);
      if (n === estado.passo) li.setAttribute('aria-current', 'step');
      else li.removeAttribute('aria-current');
      li.lastElementChild.textContent = nomesEtapas[i] + (n < estado.passo ? ' (concluída)' : '');
    });
    document.title = 'Etapa ' + estado.passo + ' de 3: ' + nomesEtapas[estado.passo - 1] + ' | ' + tituloBase;
    const fim = estado.passo === 3;
    aside.hidden = fim;
    layout.classList.toggle('layout-aside', !fim);
  }

  /* ------------------------------------------------ Etapa 1: horário */

  function etapaHorario() {
    const titulo = h('h2', { tabindex: '-1', text: 'Escolha o formato e o horário' });

    const formatos = h('fieldset', { class: 'choice-group' },
      h('legend', { text: 'Como você prefere conversar?' }),
      h('div', { class: 'choices choices--3' }, D.formatos.map((f) => {
        const id = 'fmt-' + f.v;
        return h('label', { class: 'choice', for: id },
          h('input', { type: 'radio', name: 'formato', id, value: f.v, checked: estado.formato === f.v }),
          h('span', { class: 'choice__box' },
            h('span', { class: 'choice__text' },
              h('span', { class: 'choice__title', text: f.t }),
              h('span', { class: 'choice__desc', text: f.d }))));
      })));

    const caminho = h('div', { class: 'field block' },
      h('label', { for: 'ag-caminho', text: 'Sobre qual caminho você quer conversar?' }),
      h('select', { id: 'ag-caminho', name: 'caminho' },
        h('option', { value: '', text: 'Ainda não sei, quero ajuda para escolher' }),
        D.caminhos.map((c) => {
          const o = h('option', { value: c.id, text: c.nome });
          if (c.id === estado.caminho) o.selected = true;
          return o;
        })));

    const diaFs = h('fieldset', { class: 'choice-group block', id: 'ag-dia' }, h('legend', { text: 'Escolha o dia' }));
    const horaFs = h('fieldset', { class: 'choice-group block', id: 'ag-hora' }, h('legend', { text: 'Escolha o horário' }));
    const cal = h('div', { class: 'cal' });
    const slots = h('div');
    diaFs.appendChild(cal);
    horaFs.appendChild(slots);

    function desenhaCalendario() {
      // Três semanas a partir da segunda-feira desta semana.
      const hojeD = new Date(T.hoje() + 'T12:00:00');
      const recua = (hojeD.getDay() + 6) % 7;
      const inicio = T.somaDias(T.hoje(), -recua);
      const dias = Array.from({ length: 21 }, (_, i) => T.somaDias(inicio, i));
      const mes = (iso) => new Date(iso + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      const rotulo = mes(dias[0]) === mes(dias[20]) ? mes(dias[0]) : mes(dias[0]).replace(/ de \d{4}$/, '') + ' e ' + mes(dias[20]);
      const titulo = rotulo.charAt(0).toUpperCase() + rotulo.slice(1);

      cal.replaceChildren(
        h('div', { class: 'cal__head' }, h('p', { class: 'cal__title', text: titulo })),
        h('div', { class: 'cal__grid' },
          ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'].map((d) => h('span', { class: 'cal__dow', 'aria-hidden': 'true', text: d })),
          dias.map((iso) => {
            const ok = disponivel(iso);
            return h('button', {
              class: 'cal__day', type: 'button',
              disabled: !ok,
              'aria-pressed': String(estado.data === iso),
              'aria-label': T.fmt.dateLong(iso) + (ok ? '' : ', sem horários'),
              text: String(parseInt(iso.slice(8), 10)),
              onclick() {
                estado.data = iso;
                if (estado.hora && livres(iso).indexOf(estado.hora) < 0) estado.hora = '';
                salvar();
                cal.querySelectorAll('.cal__day').forEach((b) => b.setAttribute('aria-pressed', String(b === this)));
                T.marcarErro(diaFs, '');
                desenhaHorarios();
                atualizaResumo();
                T.announce(T.fmt.dateLong(iso) + ': ' + T.fmt.plural(livres(iso).length, 'horário livre', 'horários livres'));
              }
            });
          })));
    }

    function desenhaHorarios() {
      if (!estado.data) {
        slots.replaceChildren(h('p', { class: 'muted', text: 'Escolha um dia para ver os horários livres.' }));
        return;
      }
      const ok = livres(estado.data);
      slots.replaceChildren(
        h('p', { class: 'muted', text: 'Horários no ' + fuso() + '. A conversa dura 40 minutos.' }),
        h('div', { class: 'slots' }, D.horarios.map((hr) => {
          const livre = ok.indexOf(hr) >= 0;
          return h('button', {
            class: 'slot', type: 'button', disabled: !livre,
            'aria-pressed': String(estado.hora === hr),
            'aria-label': hr + (livre ? '' : ', ocupado'),
            text: hr,
            onclick() {
              estado.hora = hr;
              salvar();
              slots.querySelectorAll('.slot').forEach((b) => b.setAttribute('aria-pressed', String(b === this)));
              T.marcarErro(horaFs, '');
              atualizaResumo();
            }
          });
        })));
    }

    formatos.addEventListener('change', (ev) => {
      estado.formato = ev.target.value;
      if (estado.data && !disponivel(estado.data)) estado.data = '';
      if (estado.data && livres(estado.data).indexOf(estado.hora) < 0) estado.hora = '';
      salvar();
      desenhaCalendario();
      desenhaHorarios();
      atualizaResumo();
    });
    caminho.querySelector('select').addEventListener('change', (ev) => {
      estado.caminho = ev.target.value;
      salvar();
      atualizaResumo();
    });

    if (estado.data && !disponivel(estado.data)) { estado.data = ''; estado.hora = ''; }
    desenhaCalendario();
    desenhaHorarios();

    const form = h('form', { class: 'panel-step', novalidate: true },
      titulo, formatos, caminho, diaFs, horaFs,
      h('div', { class: 'form-actions' },
        h('button', { class: 'btn btn--primary', type: 'submit' }, 'Continuar', T.icon('arrow-right', 'icon-move'))));

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const ok = T.validate(form, () => {
        const e = [];
        if (!estado.data) e.push({ el: diaFs, msg: 'Escolha o dia da reunião.' });
        if (!estado.hora) e.push({ el: horaFs, msg: estado.data ? 'Escolha um horário livre.' : 'Escolha o dia para liberar os horários.' });
        return e;
      });
      if (ok) ir(2);
    });
    return { form, titulo };
  }

  /* --------------------------------------------- Etapa 2: seus dados */

  function etapaDados() {
    const d = estado.dados;
    const titulo = h('h2', { tabindex: '-1', text: 'Agora, os seus dados' });
    const campo = (id, rotulo, attrs, extra) => h('div', { class: 'field' + (extra || '') },
      h('label', { for: id }, rotulo),
      h('input', Object.assign({ id }, attrs)));

    const form = h('form', { class: 'panel-step', novalidate: true },
      titulo,
      h('p', { class: 'muted', text: 'Usamos esses dados para enviar o convite e abrir a sua área do cliente.' }),
      h('div', { class: 'form-grid' },
        campo('ag-nome', 'Nome completo', { name: 'nome', type: 'text', required: true, 'data-rules': 'nome', autocomplete: 'name', value: d.nome || '' }, ' span-2'),
        campo('ag-email', 'E-mail', { name: 'email', type: 'email', required: true, 'data-rules': 'email', autocomplete: 'email', inputmode: 'email', value: d.email || '' }),
        campo('ag-tel', 'Telefone ou WhatsApp', { name: 'telefone', type: 'tel', required: true, 'data-rules': 'telefone', 'data-mask': 'telefone', autocomplete: 'tel', inputmode: 'tel', value: d.telefone || '' }),
        h('div', { class: 'field span-2' },
          h('label', { for: 'ag-pessoas', text: 'Quantas pessoas vão se mudar?' }),
          h('select', { id: 'ag-pessoas', name: 'pessoas' },
            ['Só eu', '2 pessoas', '3 pessoas', '4 ou mais'].map((t) => {
              const o = h('option', { text: t });
              if (d.pessoas === t) o.selected = true;
              return o;
            }))),
        h('div', { class: 'field span-2' },
          h('label', { for: 'ag-obs' }, 'Quer adiantar algo? ', h('span', { class: 'field__opt', text: '(opcional)' })),
          h('textarea', { id: 'ag-obs', name: 'observacoes', maxlength: '1000', value: d.observacoes || '' })),
        h('div', { class: 'field span-2' },
          h('label', { class: 'check', for: 'ag-ok' },
            h('input', { id: 'ag-ok', name: 'consentimento', type: 'checkbox', required: true, checked: !!d.consentimento, 'data-msg-required': 'Para agendar, precisamos da sua autorização para usar esses dados.' }),
            h('span', { text: 'Autorizo a Travessia a usar esses dados para a reunião e para abrir a minha área do cliente.' })))),
      h('div', { class: 'wizard__nav' },
        h('button', { class: 'btn btn--ghost', type: 'button', onclick: () => { guardar(form); ir(1); } }, T.icon('arrow-left'), 'Voltar'),
        h('button', { class: 'btn btn--primary', type: 'submit' }, T.icon('check'), 'Confirmar agendamento')));

    T.applyMasks(form);
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const email = form.querySelector('#ag-email');
      const ok = T.validate(form, () => {
        const existente = email.value.trim() && T.db.findByEmail(email.value);
        return existente
          ? [{ el: email, msg: 'Já existe um processo com este e-mail (' + existente.protocolo + '). Entre na área do cliente para acompanhar.' }]
          : [];
      });
      if (!ok) return;
      guardar(form);
      confirmar();
    });
    return { form, titulo };
  }

  function guardar(form) {
    const f = new FormData(form);
    estado.dados = {
      nome: (f.get('nome') || '').trim(),
      email: (f.get('email') || '').trim(),
      telefone: (f.get('telefone') || '').trim(),
      pessoas: f.get('pessoas'),
      observacoes: (f.get('observacoes') || '').trim(),
      consentimento: f.get('consentimento') === 'on'
    };
    salvar();
  }

  function confirmar() {
    const d = estado.dados;
    const protocolo = T.db.novoProtocolo();
    const consultora = estado.formato === 'sao-paulo' ? 1 : 0;
    const primeiroNome = d.nome.split(/\s+/)[0];
    const quando = T.fmt.dateLong(estado.data) + ', às ' + estado.hora;
    const agora = T.agoraISO();

    T.db.save({
      protocolo,
      nome: d.nome,
      email: d.email,
      telefone: d.telefone,
      caminho: estado.caminho || null,
      etapa: 0,
      consultora,
      criadoEm: agora,
      reuniao: { data: estado.data, hora: estado.hora, formato: estado.formato, realizada: false },
      documentos: estado.caminho ? D.novosDocumentos(estado.caminho) : [],
      mensagens: [{
        de: 'consultora', em: agora,
        texto: 'Olá, ' + primeiroNome + '! Sou a ' + D.consultoras[consultora].nome.split(' ')[0] + ' e vou acompanhar o seu processo. Nossa conversa está marcada para ' + quando + '. Se quiser, já pode adiantar os documentos por aqui.'
      }],
      historico: [{ em: agora, texto: 'Reunião inicial agendada para ' + quando + ' (' + formato().t.toLowerCase() + ').' }]
    });

    estado.protocolo = protocolo;
    ir(3);
  }

  /* ------------------------------------------- Etapa 3: confirmação */

  function etapaConfirmacao() {
    const p = T.db.get(estado.protocolo);
    if (!p) { estado.passo = 1; return etapaHorario(); }
    const c = D.porId(p.caminho);
    const f = D.formatos.find((x) => x.v === p.reuniao.formato);
    const titulo = h('h2', { tabindex: '-1', text: 'Tudo certo, ' + p.nome.split(/\s+/)[0] + '!' });

    const passe = h('div', { class: 'pass pass--flat', role: 'group', 'aria-label': 'Resumo do agendamento' },
      h('div', { class: 'pass__main' },
        h('div', { class: 'pass__top' },
          h('span', { class: 'pass__brand' }, h('img', { src: 'img/favicon.svg', alt: '', width: '26', height: '26' }), 'Travessia'),
          h('span', { class: 'pass__class', text: 'Reunião inicial' })),
        h('dl', { class: 'pass__fields' },
          h('div', null, h('dt', { text: 'Passageiro' }), h('dd', { text: p.nome })),
          h('div', null, h('dt', { text: 'Dia' }), h('dd', { text: T.fmt.date(p.reuniao.data) })),
          h('div', null, h('dt', { text: 'Horário' }), h('dd', { text: p.reuniao.hora })),
          h('div', null, h('dt', { text: 'Formato' }), h('dd', { text: f.t })),
          h('div', null, h('dt', { text: 'Caminho' }), h('dd', { text: c ? c.curto : 'A definir' })),
          h('div', null, h('dt', { text: 'Protocolo' }), h('dd', { text: p.protocolo })))),
      h('div', { class: 'pass__stub' },
        h('div', null, h('span', { class: 'pass__stub-label', text: 'Etapa' }), h('span', { class: 'pass__stub-value', text: '1/5' })),
        h('div', { class: 'pass__barcode' })));

    const local = p.reuniao.formato === 'video' ? 'Videochamada (o link chega por e-mail)' : f.t + ', ' + f.d;
    const box = h('div', { class: 'panel-step confirm' },
      h('div', { class: 'confirm__seal' }, T.icon('check-circle')),
      titulo,
      h('p', { class: 'lead', text: 'Sua conversa está marcada para ' + T.fmt.dateLong(p.reuniao.data) + ', às ' + p.reuniao.hora + ' (' + (p.reuniao.formato === 'lisboa' ? 'horário de Lisboa' : 'horário de Brasília') + '). O convite foi enviado para ' + p.email + '.' }),
      passe,
      h('p', { class: 'muted', text: 'Guarde o protocolo: com ele e o seu e-mail você entra na área do cliente.' }),
      h('div', { class: 'confirm__actions' },
        h('button', {
          class: 'btn btn--primary', type: 'button',
          onclick() {
            T.sessao.entrar(p.protocolo);
            T.store.remove('agendamento');
            window.location.href = 'portal.html';
          }
        }, T.icon('user'), 'Ir para a área do cliente'),
        h('button', {
          class: 'btn btn--ghost', type: 'button',
          onclick: () => T.download('reuniao-travessia.ics', T.ics(p.reuniao, local), 'text/calendar;charset=utf-8')
        }, T.icon('calendar'), 'Adicionar à minha agenda')),
      h('p', { class: 'block' }, h('button', {
        class: 'link-button link-button--paper', type: 'button',
        onclick() {
          T.store.remove('agendamento');
          window.location.href = 'agendar.html';
        }
      }, 'Fazer outro agendamento')));
    return { form: box, titulo };
  }

  /* -------------------------------------------------- Navegação */

  function render(mover) {
    atualizaStepper();
    atualizaResumo();
    const etapa = estado.passo === 1 ? etapaHorario() : estado.passo === 2 ? etapaDados() : etapaConfirmacao();
    caixa.replaceChildren(etapa.form);
    if (mover) focar(etapa.titulo);
  }

  function ir(passo) {
    estado.passo = passo;
    salvar();
    render(true);
  }

  render(false);
})();
