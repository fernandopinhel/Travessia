# Política de segurança

Este repositório é um **protótipo navegável estático** (HTML, CSS e JavaScript). Ele não
tem back-end, banco de dados nem autenticação real, e não deve ser usado com documentos ou
dados pessoais reais.

## Reportando uma vulnerabilidade

Se encontrar um problema de segurança, abra um
[security advisory privado](https://github.com/fernandopinhel/Imigratech/security/advisories/new)
em vez de uma issue pública.

## Medidas adotadas

- Content Security Policy via `<meta>` (`script-src 'self'` e `style-src` sem
  `'unsafe-inline'`, ou seja, sem scripts nem estilos inline). Não há nenhum
  `<script>`, `<style>`, `style=` ou `onclick=` escrito direto no HTML.
- Nenhuma biblioteca de terceiros no runtime e nenhuma chave de API no código.
- Todo texto digitado entra na página como `textContent`, nunca como HTML.
- Nada é enviado a servidor. Processos, mensagens e respostas do simulador ficam só no
  `sessionStorage` e somem ao fechar a aba ou ao clicar em "Restaurar dados de exemplo".
- Os arquivos escolhidos na área do cliente não são lidos: o protótipo guarda só o nome,
  o tamanho e o tipo.
- Dependabot monitora as GitHub Actions.
