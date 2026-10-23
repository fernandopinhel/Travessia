/*
 * Travessia: conteúdo e dados de exemplo do protótipo.
 * Caminhos de imigração, perguntas do simulador, perguntas frequentes,
 * respostas do chat e o processo de demonstração da área do cliente.
 * As regras de imigração aqui são simplificadas, só para ilustrar o case.
 */
(function () {
  'use strict';

  const T = window.TRV;

  /* ------------------------------------------------------------ Caminhos */

  // Cada caminho tem a sua lista de documentos. "id" é usado na área do cliente.
  const caminhos = [
    {
      id: 'nacionalidade',
      nome: 'Cidadania portuguesa',
      curto: 'Cidadania',
      icone: 'passport',
      grupo: 'familia',
      resumo: 'Para filhos e netos de portugueses que querem o reconhecimento da nacionalidade.',
      paraQuem: 'Você tem pai, mãe, avô ou avó com nacionalidade portuguesa.',
      prazo: '12 a 30 meses',
      documentos: [
        ['certidao-ascendente', 'Certidão de nascimento do ascendente português', 'Emitida em Portugal, de inteiro teor.'],
        ['certidao-requerente', 'Sua certidão de nascimento', 'De inteiro teor, com apostila de Haia.'],
        ['certidao-ligacao', 'Certidões que ligam você ao ascendente', 'Por exemplo, a certidão do seu pai ou mãe, se o português for o avô.'],
        ['identidade', 'Documento de identificação com foto', 'RG ou passaporte dentro da validade.'],
        ['antecedentes', 'Certidão de antecedentes criminais', 'Federal, com apostila de Haia, para maiores de 16 anos.']
      ]
    },
    {
      id: 'd7',
      nome: 'Visto de rendimentos (D7)',
      curto: 'Rendimentos',
      icone: 'sun',
      grupo: 'renda',
      resumo: 'Para quem vive de aposentadoria, aluguéis ou investimentos e quer morar em Portugal.',
      paraQuem: 'Você tem renda regular que não depende de trabalhar em Portugal.',
      prazo: '4 a 8 meses',
      documentos: [
        ['passaporte', 'Passaporte', 'Válido por pelo menos 6 meses além da viagem.'],
        ['renda', 'Comprovantes de renda', 'Extratos da aposentadoria, contratos de aluguel ou rendimentos de investimentos.'],
        ['nif', 'NIF e conta em banco português', 'Podemos ajudar a obter os dois antes do pedido.'],
        ['moradia', 'Comprovante de alojamento em Portugal', 'Contrato de arrendamento ou termo de responsabilidade.'],
        ['seguro', 'Seguro de saúde', 'Com cobertura em Portugal.'],
        ['antecedentes', 'Certidão de antecedentes criminais', 'Federal, com apostila de Haia.']
      ]
    },
    {
      id: 'd8',
      nome: 'Visto de trabalho remoto (D8)',
      curto: 'Trabalho remoto',
      icone: 'laptop',
      grupo: 'trabalho',
      resumo: 'Para quem trabalha a distância para empresas ou clientes de fora de Portugal.',
      paraQuem: 'Você tem vínculo com empresa ou clientes no exterior e trabalha de forma remota.',
      prazo: '3 a 6 meses',
      documentos: [
        ['passaporte', 'Passaporte', 'Válido por pelo menos 6 meses além da viagem.'],
        ['vinculo', 'Comprovante de vínculo de trabalho', 'Contrato de trabalho ou de prestação de serviços.'],
        ['renda', 'Comprovantes de renda dos últimos meses', 'Holerites, notas fiscais ou extratos bancários.'],
        ['moradia', 'Comprovante de alojamento em Portugal', 'Contrato de arrendamento ou reserva de longa duração.'],
        ['seguro', 'Seguro de saúde', 'Com cobertura em Portugal.'],
        ['antecedentes', 'Certidão de antecedentes criminais', 'Federal, com apostila de Haia.']
      ]
    },
    {
      id: 'trabalho',
      nome: 'Visto de trabalho',
      curto: 'Trabalho',
      icone: 'briefcase',
      grupo: 'trabalho',
      resumo: 'Para quem já tem uma proposta ou contrato de trabalho com uma empresa em Portugal.',
      paraQuem: 'Uma empresa portuguesa quer contratar você.',
      prazo: '3 a 6 meses',
      documentos: [
        ['passaporte', 'Passaporte', 'Válido por pelo menos 6 meses além da viagem.'],
        ['contrato', 'Contrato ou promessa de contrato de trabalho', 'Assinado pela empresa em Portugal.'],
        ['qualificacao', 'Diplomas e certificados', 'Quando a função exigir qualificação específica.'],
        ['seguro', 'Seguro de saúde', 'Com cobertura em Portugal até a inscrição no SNS.'],
        ['antecedentes', 'Certidão de antecedentes criminais', 'Federal, com apostila de Haia.']
      ]
    },
    {
      id: 'estudo',
      nome: 'Visto de estudo',
      curto: 'Estudo',
      icone: 'graduation',
      grupo: 'estudo',
      resumo: 'Para graduação, mestrado, doutorado ou cursos em instituições portuguesas.',
      paraQuem: 'Você foi aceito ou está se candidatando a um curso em Portugal.',
      prazo: '2 a 4 meses',
      documentos: [
        ['passaporte', 'Passaporte', 'Válido por pelo menos 6 meses além da viagem.'],
        ['matricula', 'Comprovante de matrícula ou aceite', 'Emitido pela instituição de ensino.'],
        ['meios', 'Comprovante de meios de subsistência', 'Extratos, bolsa de estudos ou termo de responsabilidade.'],
        ['moradia', 'Comprovante de alojamento', 'Residência estudantil ou arrendamento.'],
        ['seguro', 'Seguro de saúde', 'Com cobertura em Portugal.']
      ]
    },
    {
      id: 'reagrupamento',
      nome: 'Reagrupamento familiar',
      curto: 'Família',
      icone: 'family',
      grupo: 'familia',
      resumo: 'Para se juntar a um familiar que já mora legalmente em Portugal.',
      paraQuem: 'Seu cônjuge, pai, mãe ou filho já tem residência em Portugal.',
      prazo: '6 a 12 meses',
      documentos: [
        ['passaporte', 'Passaporte', 'De cada familiar que vai pedir a residência.'],
        ['parentesco', 'Prova do parentesco', 'Certidão de casamento ou de nascimento, com apostila de Haia.'],
        ['residencia-familiar', 'Título de residência do familiar em Portugal', 'Dentro da validade.'],
        ['meios', 'Comprovante de meios de subsistência', 'Do familiar que já mora em Portugal.'],
        ['moradia', 'Comprovante de alojamento', 'Com espaço para toda a família.']
      ]
    }
  ];

  const porId = (id) => caminhos.find((c) => c.id === id);

  /* ----------------------------------------------------------- Simulador */

  // Cada resposta soma pontos aos caminhos que fazem sentido para ela.
  // "motivo" explica no resultado por que o caminho apareceu.
  const perguntas = [
    {
      id: 'objetivo',
      titulo: 'O que mais leva você a Portugal?',
      dica: 'Escolha o motivo principal. Dá para conversar sobre os outros depois.',
      opcoes: [
        { v: 'cidadania', t: 'Ter a cidadania portuguesa', d: 'E com ela, o passaporte europeu.', pontos: { nacionalidade: 4 } },
        { v: 'remoto', t: 'Morar lá trabalhando a distância', d: 'Para empresas ou clientes de fora.', pontos: { d8: 4 } },
        { v: 'emprego', t: 'Trabalhar numa empresa portuguesa', d: 'Com proposta ou contrato.', pontos: { trabalho: 4 } },
        { v: 'renda', t: 'Viver de renda ou aposentadoria', d: 'Sem precisar trabalhar lá.', pontos: { d7: 4 } },
        { v: 'estudo', t: 'Estudar', d: 'Graduação, pós ou outro curso.', pontos: { estudo: 4 } },
        { v: 'familia', t: 'Morar perto da família', d: 'Alguém próximo já vive em Portugal.', pontos: { reagrupamento: 4 } }
      ]
    },
    {
      id: 'ascendencia',
      titulo: 'Você tem pais ou avós portugueses?',
      dica: 'Vale para quem nasceu em Portugal ou tem a nacionalidade reconhecida.',
      opcoes: [
        { v: 'pais', t: 'Sim, pai ou mãe', pontos: { nacionalidade: 6 }, motivo: 'Filhos de portugueses costumam ter o caminho mais direto para a cidadania.' },
        { v: 'avos', t: 'Sim, avô ou avó', pontos: { nacionalidade: 4 }, motivo: 'Netos de portugueses também podem pedir a nacionalidade, com alguns documentos a mais.' },
        { v: 'nao-sei', t: 'Não sei, mas pode ser', pontos: { nacionalidade: 1 }, motivo: 'Vale investigar a árvore da família: uma certidão antiga pode mudar o caminho.' },
        { v: 'nao', t: 'Não', pontos: {} }
      ]
    },
    {
      id: 'familia',
      titulo: 'Algum familiar seu já mora legalmente em Portugal?',
      opcoes: [
        { v: 'sim', t: 'Sim, cônjuge, pai, mãe ou filho', pontos: { reagrupamento: 5 }, motivo: 'Com um familiar próximo residente, o reagrupamento familiar é uma opção.' },
        { v: 'outros', t: 'Sim, outros parentes ou amigos', pontos: {} },
        { v: 'nao', t: 'Não', pontos: {} }
      ]
    },
    {
      id: 'renda',
      titulo: 'Como é a sua renda hoje?',
      dica: 'Ela vai ser a base do pedido de visto na maioria dos caminhos.',
      opcoes: [
        { v: 'remota', t: 'Trabalho remoto ou para clientes de fora', pontos: { d8: 4 }, motivo: 'Sua renda de trabalho remoto pode sustentar o pedido do visto D8.' },
        { v: 'passiva', t: 'Aposentadoria, aluguéis ou investimentos', pontos: { d7: 4 }, motivo: 'Renda passiva regular é a base do visto D7.' },
        { v: 'proposta', t: 'Tenho proposta de emprego em Portugal', pontos: { trabalho: 5 }, motivo: 'Com proposta de uma empresa portuguesa, o visto de trabalho fica ao alcance.' },
        { v: 'sem', t: 'Ainda não tenho renda definida', pontos: { estudo: 1 } }
      ]
    },
    {
      id: 'quem',
      titulo: 'Quem vai com você?',
      opcoes: [
        { v: 'so', t: 'Só eu', pontos: {} },
        { v: 'casal', t: 'Eu e meu cônjuge', pontos: {} },
        { v: 'filhos', t: 'Família com filhos', pontos: {} },
        { v: 'depois', t: 'A família vai depois', pontos: { reagrupamento: 1 }, motivo: 'Quem vai depois pode usar o reagrupamento familiar quando você já tiver residência.' }
      ]
    },
    {
      id: 'quando',
      titulo: 'Quando você gostaria de se mudar?',
      opcoes: [
        { v: '6m', t: 'Nos próximos 6 meses', pontos: {} },
        { v: '12m', t: 'Entre 6 meses e 1 ano', pontos: {} },
        { v: 'mais', t: 'Daqui a mais de 1 ano', pontos: {} },
        { v: 'pesquisando', t: 'Ainda estou pesquisando', pontos: {} }
      ]
    }
  ];

  // Devolve os caminhos ordenados por pontuação, com os motivos de cada um.
  function avaliar(respostas) {
    const placar = {};
    caminhos.forEach((c) => { placar[c.id] = { caminho: c, pontos: 0, motivos: [] }; });
    perguntas.forEach((p) => {
      const op = p.opcoes.find((o) => o.v === respostas[p.id]);
      if (!op) return;
      Object.keys(op.pontos).forEach((id) => {
        placar[id].pontos += op.pontos[id];
        if (op.motivo && placar[id].motivos.indexOf(op.motivo) < 0) placar[id].motivos.push(op.motivo);
      });
    });
    return Object.values(placar)
      .filter((r) => r.pontos > 0)
      .sort((a, b) => b.pontos - a.pontos);
  }

  /* ------------------------------------------------------------- Etapas */

  const etapas = [
    { titulo: 'Reunião inicial', texto: 'Entendemos o seu caso, confirmamos o caminho e montamos o plano.' },
    { titulo: 'Envio de documentos', texto: 'Você envia os documentos pela área do cliente, no seu tempo.' },
    { titulo: 'Análise documental', texto: 'Nossa equipe confere cada documento antes do pedido.' },
    { titulo: 'Entrada do processo', texto: 'Damos entrada no consulado, na AIMA ou no IRN, conforme o caminho.' },
    { titulo: 'Documento pronto', texto: 'Avisamos quando o visto, a residência ou a cidadania sair.' }
  ];

  /* ---------------------------------------------- Perguntas frequentes */

  const faq = [
    ['A reunião inicial tem custo?', 'Não. Na primeira conversa, de 40 minutos, entendemos o seu caso, indicamos o caminho e explicamos cada etapa. Você só contrata se fizer sentido.'],
    ['Preciso estar em Portugal para começar?', 'Não. A maior parte dos pedidos começa no Brasil, pelo consulado. Nos caminhos que pedem presença em Portugal, avisamos com antecedência e ajudamos com a agenda.'],
    ['Quanto tempo leva o processo?', 'Depende do caminho e do órgão responsável. Na reunião inicial você recebe uma estimativa para o seu caso, e na área do cliente acompanha cada etapa.'],
    ['Como envio os documentos?', 'Pela área do cliente. Cada documento tem uma explicação do que precisa, e você vê na hora se ele foi aprovado ou se falta algo.'],
    ['O que é a apostila de Haia?', 'É um selo que valida um documento brasileiro em outros países. Ela é feita em cartório, e indicamos quais documentos precisam dela.'],
    ['Posso levar minha família?', 'Sim. Cônjuge e filhos podem ir junto ou depois, pelo reagrupamento familiar. Montamos o plano para todos de uma vez.'],
    ['Vocês garantem a aprovação?', 'Ninguém pode garantir, porque a decisão é do governo português. O que fazemos é revisar tudo antes do pedido para reduzir as chances de exigência ou recusa.'],
    ['Meus dados ficam seguros?', 'Neste protótipo, nada sai do seu navegador. Num serviço real, os documentos ficariam criptografados e só a sua equipe teria acesso.']
  ];

  /* ------------------------------------------------------------- Chat */

  // Respostas do assistente. A primeira intenção cujas palavras aparecem na mensagem vence.
  const chat = [
    { chaves: ['oi', 'ola', 'bom dia', 'boa tarde', 'boa noite', 'tudo bem'],
      resposta: 'Olá! Que bom ter você por aqui. Posso explicar os caminhos para Portugal, os documentos, os prazos ou marcar uma conversa com a equipe.' },
    { chaves: ['cidadania', 'nacionalidade', 'avo', 'neto', 'descendencia', 'passaporte europeu'],
      resposta: 'Filhos e netos de portugueses podem pedir a cidadania. Para netos, entram algumas certidões a mais. Quer ver se é o seu caso no simulador?',
      acoes: [['Fazer o simulador', 'caminho.html']] },
    { chaves: ['remoto', 'nomade', 'd8', 'home office', 'freela'],
      resposta: 'Quem trabalha a distância para empresas ou clientes de fora costuma seguir pelo visto D8, de trabalho remoto. A renda dos últimos meses é a base do pedido.',
      acoes: [['Ver documentos do D8', 'caminho.html?ver=d8']] },
    { chaves: ['aposent', 'renda', 'aluguel', 'investimento', 'd7'],
      resposta: 'Para quem vive de aposentadoria, aluguéis ou investimentos, o caminho mais comum é o visto D7.',
      acoes: [['Ver documentos do D7', 'caminho.html?ver=d7']] },
    { chaves: ['estud', 'faculdade', 'mestrado', 'universidade', 'curso'],
      resposta: 'Para estudar, o pedido sai com o aceite da instituição de ensino e a prova de que você consegue se manter durante o curso.',
      acoes: [['Ver documentos do visto de estudo', 'caminho.html?ver=estudo']] },
    { chaves: ['emprego', 'trabalhar', 'contrato', 'vaga', 'empresa'],
      resposta: 'Com uma proposta ou contrato de uma empresa portuguesa, o caminho é o visto de trabalho. Se você trabalha para fora, veja o D8.',
      acoes: [['Ver documentos do visto de trabalho', 'caminho.html?ver=trabalho']] },
    { chaves: ['famil', 'esposa', 'marido', 'filho', 'conjuge', 'reagrup'],
      resposta: 'Familiares podem ir junto ou depois, pelo reagrupamento familiar. Montamos o plano da família inteira na reunião inicial.' },
    { chaves: ['preco', 'custo', 'valor', 'quanto custa', 'pagar', 'honorario'],
      resposta: 'O valor depende do caminho e de quantas pessoas vão. A reunião inicial não tem custo, e nela você recebe a proposta por escrito.',
      acoes: [['Agendar a reunião', 'agendar.html']] },
    { chaves: ['prazo', 'tempo', 'demora', 'quando sai', 'quanto tempo'],
      resposta: 'Depende do caminho e do órgão português. Um visto costuma levar alguns meses; a cidadania, mais. Você recebe a estimativa do seu caso na reunião inicial.' },
    { chaves: ['document', 'certidao', 'apostila', 'papel'],
      resposta: 'Cada caminho tem a sua lista. No simulador você vê os documentos do caminho indicado e pode imprimir a lista.',
      acoes: [['Fazer o simulador', 'caminho.html']] },
    { chaves: ['agend', 'reuniao', 'marcar', 'conversa', 'falar com', 'humano', 'atendente', 'pessoa'],
      resposta: 'Claro! A reunião inicial é por vídeo ou presencial, em Lisboa ou em São Paulo, e leva 40 minutos.',
      acoes: [['Escolher um horário', 'agendar.html']] },
    { chaves: ['acompanh', 'area do cliente', 'protocolo', 'meu processo', 'login', 'entrar'],
      resposta: 'Na área do cliente você acompanha as etapas, envia documentos e conversa com a sua consultora.',
      acoes: [['Ir para a área do cliente', 'entrar.html']] },
    { chaves: ['obrigad', 'valeu', 'tchau'],
      resposta: 'Por nada! Se surgir outra dúvida, é só chamar.' }
  ];

  const chatPadrao = 'Ainda não sei responder isso, mas a equipe sabe. Você pode agendar uma conversa sem custo ou escolher um dos assuntos abaixo.';
  const chatSugestoes = ['Cidadania por descendência', 'Trabalho remoto', 'Quanto custa?', 'Quanto tempo leva?', 'Agendar uma conversa'];

  /* ----------------------------------------------------- Consultoras */

  const consultoras = [
    { nome: 'Helena Duarte', cidade: 'Lisboa', iniciais: 'HD' },
    { nome: 'Camila Rocha', cidade: 'São Paulo', iniciais: 'CR' }
  ];

  const formatos = [
    { v: 'video', t: 'Por vídeo', d: 'De onde você estiver', icone: 'video' },
    { v: 'lisboa', t: 'Presencial em Lisboa', d: 'Av. da Liberdade, 000', icone: 'pin' },
    { v: 'sao-paulo', t: 'Presencial em São Paulo', d: 'Av. Paulista, 0000', icone: 'pin' }
  ];

  const horarios = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  /* --------------------------------------- Processo de demonstração */

  function novosDocumentos(caminhoId) {
    return porId(caminhoId).documentos.map((d) => ({
      id: d[0], nome: d[1], descricao: d[2], status: 'pendente', arquivo: null, motivo: '', em: null
    }));
  }

  function processoDemo() {
    const hojeISO = T.hoje();
    const docs = novosDocumentos('d8');
    const arquivo = (nome, kb) => ({ nome, tamanho: kb * 1024, tipo: nome.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg' });
    Object.assign(docs[0], { status: 'aprovado', arquivo: arquivo('passaporte-marina.pdf', 820), em: T.somaDias(hojeISO, -6) + 'T10:12:00' });
    Object.assign(docs[1], { status: 'aprovado', arquivo: arquivo('contrato-prestacao-servicos.pdf', 412), em: T.somaDias(hojeISO, -5) + 'T16:40:00' });
    Object.assign(docs[2], { status: 'em-analise', arquivo: arquivo('extratos-jun-ago.pdf', 1310), em: T.somaDias(hojeISO, -1) + 'T09:05:00' });
    Object.assign(docs[5], {
      status: 'recusado', arquivo: arquivo('antecedentes.jpg', 690), em: T.somaDias(hojeISO, -4) + 'T11:20:00',
      motivo: 'A certidão está sem a apostila de Haia. Peça a apostila no cartório e envie de novo.'
    });

    return {
      protocolo: 'TRV-26-4817',
      nome: 'Marina Alves',
      email: 'marina.alves@example.com',
      telefone: '+55 11 90000-0000',
      caminho: 'd8',
      etapa: 1,
      consultora: 0,
      criadoEm: T.somaDias(hojeISO, -9) + 'T15:00:00',
      reuniao: { data: T.somaDias(hojeISO, -9), hora: '15:00', formato: 'video', realizada: true },
      documentos: docs,
      mensagens: [
        { de: 'consultora', texto: 'Olá, Marina! Foi ótimo conversar com você. Já deixei aqui a lista de documentos do visto D8. Qualquer dúvida, me chame por esta conversa.', em: T.somaDias(hojeISO, -9) + 'T16:02:00' },
        { de: 'cliente', texto: 'Obrigada, Helena! Os extratos precisam ser de quantos meses?', em: T.somaDias(hojeISO, -2) + 'T18:30:00' },
        { de: 'consultora', texto: 'Dos últimos três meses, num arquivo só. Recebi a certidão de antecedentes, mas ela veio sem a apostila. Deixei a explicação no documento.', em: T.somaDias(hojeISO, -1) + 'T09:40:00' }
      ],
      historico: [
        { em: T.somaDias(hojeISO, -9) + 'T15:00:00', texto: 'Reunião inicial realizada por vídeo.' },
        { em: T.somaDias(hojeISO, -6) + 'T14:00:00', texto: 'Passaporte aprovado.' },
        { em: T.somaDias(hojeISO, -5) + 'T17:30:00', texto: 'Comprovante de vínculo aprovado.' },
        { em: T.somaDias(hojeISO, -1) + 'T09:38:00', texto: 'Certidão de antecedentes devolvida para ajuste.' }
      ]
    };
  }

  T.data = {
    caminhos, porId, perguntas, avaliar, etapas, faq, chat, chatPadrao, chatSugestoes,
    consultoras, formatos, horarios, novosDocumentos, processoDemo
  };
})();
