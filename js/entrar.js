/* Travessia: entrada na área do cliente (sem autenticação real). */
(function () {
  'use strict';

  const T = window.TRV;

  T.init();

  // Quem já está com a sessão aberta vai direto para o processo.
  if (T.sessao.get() && T.db.get(T.sessao.get())) {
    window.location.replace('portal.html');
    return;
  }

  const form = document.getElementById('entrar-form');
  const email = document.getElementById('en-email');
  const protocolo = document.getElementById('en-protocolo');
  T.applyMasks(form);

  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    let processo = null;
    const ok = T.validate(form, () => {
      if (!email.value.trim() || !protocolo.value.trim()) return [];
      processo = T.db.get(protocolo.value.trim());
      if (processo && T.normaliza(processo.email) === T.normaliza(email.value)) return [];
      return [{ el: protocolo, msg: 'Não encontramos um processo com esse e-mail e protocolo. Confira os dois no e-mail de confirmação.' }];
    });
    if (!ok) return;
    T.sessao.entrar(processo.protocolo);
    window.location.href = 'portal.html';
  });

  document.getElementById('entrar-demo').addEventListener('click', () => {
    T.db.load();
    T.sessao.entrar(T.data.processoDemo().protocolo);
    window.location.href = 'portal.html';
  });
})();
