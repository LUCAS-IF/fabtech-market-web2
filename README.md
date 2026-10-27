# FabTech Market — Projeto de Web 2

A **FabTech Market** é uma loja virtual demonstrativa de produtos relacionados a impressão 3D, eletrônica, fabricação digital, ferramentas, robótica e programação. O projeto foi desenvolvido com HTML, CSS e JavaScript, sem framework, instalação de dependências ou banco de dados.

> **Importante:** este é um projeto acadêmico. O carrinho e a finalização funcionam como demonstração, mas nenhum pagamento é realizado. Pix, cartão e boleto não geram cobranças reais.

## Como abrir o site

1. Extraia o arquivo ZIP.
2. Abra a pasta `fabtech-market-web2` no Visual Studio Code.
3. Inicie um servidor local, por exemplo usando a extensão **Live Server**.
4. Abra `index.html` pelo servidor. Para acessar o formulário de contato, use o link **Contato** do menu ou do rodapé.

O projeto não precisa de `npm`, compilação, framework ou banco de dados. A conexão com a internet é necessária para carregar as fontes externas; se elas não carregarem, serão usadas fontes alternativas do sistema.

## O que o site oferece

- **Catálogo:** 10 produtos com nome, categoria, preço, avaliação, descrição e imagens PNG locais com texto alternativo.
- **Detalhes do produto:** clique na imagem ou no botão de detalhes para ver a descrição completa, especificações e indicação de uso.
- **Busca, filtros e ordenação:** pesquisa por nome, descrição ou categoria; filtros por categoria e ordenação por destaque, preço, avaliação ou nome.
- **Cores por categoria:** cada categoria possui uma etiqueta colorida. A mesma cor é aplicada no catálogo, nos filtros, nos detalhes do produto e no carrinho. As cores foram escolhidas com fundos suaves e texto contrastante e têm variações para o tema escuro.
- **Carrinho:** adicionar produtos, alterar quantidades, remover itens, esvaziar o carrinho e acompanhar contador, subtotal, frete, descontos e total.
- **Persistência:** o carrinho, o cupom e o tema ficam salvos no `localStorage` do navegador.
- **Frete e cupons:** frete demonstrativo de R$ 19,90 para subtotal abaixo de R$ 250,00; frete grátis a partir de R$ 250,00. O cupom `MAKER10` concede 10% de desconto com subtotal mínimo de R$ 100,00; `FRETEGRATIS` remove o frete.
- **Formas de pagamento demonstrativas:** Pix, crédito, débito e boleto. O Pix mostra o total e um QR Code ilustrativo; ele não deve ser usado para pagar. A loja não processa pagamentos nem confirma recebimentos.
- **Contato e newsletter:** página com e-mail demonstrativo, Instagram e telefone de exemplo, além de formulário com validação e mensagens de retorno. Os dados do formulário não são enviados a um servidor. Antes de publicar, substitua `SEU_USUARIO`/`@seu_usuario` pelo perfil correto e troque o número `+55 (11) 00000-0000` pelo telefone oficial. O e-mail também é demonstrativo.
- **Tema claro e escuro:** a escolha é salva no navegador.
- **Acessibilidade e adaptação:** HTML semântico, rótulos, textos alternativos, estados de foco, mensagens de validação, navegação por teclado, CSS Grid/Flexbox e ajustes para telas menores.

## Tecnologias e organização

Os comentários do código ficam nos blocos principais e explicam a intenção de cada parte, como catálogo, carrinho, cálculo dos valores, armazenamento local e validação do contato. Eles foram mantidos curtos para ajudar na leitura sem repetir o que o próprio código já mostra.

- `index.html` — página principal, catálogo e estrutura dos componentes.
- `contato.html` — página de contato.
- `css/style.css` — paleta, tipografia, categorias, temas, layout e responsividade.
- `js/app.js` — busca, filtros, carrinho, checkout demonstrativo, tema e interações.
- `js/contato.js` — validação do formulário de contato.
- `js/configuracao.js` — dados públicos da demonstração Pix. A chave configurada é fictícia.
- `js/dadosProdutos.js` — catálogo inicial dos 10 produtos.
- `js/models/Produto.js` — classe que representa um produto.
- `js/models/ItemCarrinho.js` — classe que representa um produto e sua quantidade no carrinho.
- `js/models/Carrinho.js` — classe que gerencia itens, quantidades e subtotal.
- `assets/images/` — imagens PNG usadas no catálogo.
- `assets/favicon.svg` — ícone do site.

## Design visual e paleta de cores

A identidade visual utiliza roxo como cor principal, fundos neutros e cores de apoio para diferenciar as categorias. O tema claro é o padrão; o tema escuro substitui as variáveis principais e as cores das categorias. Os valores abaixo correspondem às variáveis definidas no início de `css/style.css`.

### Paleta principal

| Variável CSS | Tema claro | Tema escuro | Finalidade |
|---|---|---|---|
| `--paper` | `#FFFFFF` | `#11121B` | Fundo e superfícies principais |
| `--ink` | `#181A2A` | `#F0F1FB` | Texto principal |
| `--slate` | `#656B7B` | `#A5A9BA` | Texto secundário |
| `--mist` | `#F5F6FA` | `#1B1D2A` | Superfícies suaves e campos |
| `--line` | `#D7DBE7` | `#414457` | Bordas e separadores comuns |
| `--line-strong` | `#000000` | `#FFFFFF` | Contornos que precisam de maior destaque |
| `--accent` | `#5B4BE7` | `#9D93FF` | Cor principal da marca e ações |
| `--accent-strong` | `#4433CE` | `#B4ACFF` | Ênfase e interação dos botões principais |
| `--accent-soft` | `#EEECFF` | `#292644` | Destaques suaves |
| `--price` | `#078365` | `#62D7B5` | Preços |
| `--star` | `#F59E0B` | `#FFC45C` | Avaliações |
| `--danger` | `#B42318` | `#FF9A92` | Erros e ações destrutivas |
| `--success` | `#087F5B` | `#6EE7BD` | Confirmações e sucesso |
| `--warning` | `#8A5200` | `#FFD18A` | Avisos |

A variável `--line-strong` foi mantida conforme o ajuste visual feito no projeto.

### Cores de apoio das categorias

| Categoria | Fundo claro | Texto claro | Fundo escuro | Texto escuro |
|---|---|---|---|---|
| Eletrônica | `#DDF3E4` | `#21663C` | `#193B29` | `#B8F0C8` |
| Impressão 3D | `#DCEBFF` | `#2457A7` | `#1C3152` | `#C4DCFF` |
| Fabricação digital | `#FCE7D6` | `#91400F` | `#4A2B19` | `#FFD4B0` |
| Ferramentas | `#F1E6D8` | `#68452A` | `#3D3025` | `#F1D7BA` |
| Robótica | `#EDE2FA` | `#63369A` | `#332448` | `#E0C7FF` |
| Programação | `#F8E1F0` | `#8A285F` | `#48243B` | `#FFC7E6` |

As categorias mantêm o mesmo esquema nos filtros, cartões de produtos, detalhes do produto e carrinho. O nome da categoria continua escrito; a cor não é o único indicador.

### Tipografia

- **Space Grotesk:** logotipo, títulos e preços em destaque.
- **Inter:** navegação, descrições, botões, formulários e demais textos.

As fontes são carregadas pelo Google Fonts; sem conexão com a internet, o navegador utiliza fontes alternativas do sistema.

### Imagens e origem

As imagens PNG são arquivos locais em `assets/images/`: `arduino.png`, `corte-laser-detalhe.png`, `corte-laser.png`, `eletronica.png`, `impressao-3d.png`, `inteligencia-artificial.png`, `marcenaria.png`, `pecas-3d.png`, `programacao.png` e `robotica.png`. Elas foram reaproveitadas dos arquivos do projeto anterior fornecido para a atividade e organizadas no catálogo. A licença original das imagens não estava documentada no projeto de origem; antes de publicar o site publicamente, confirme as permissões de uso ou substitua-as por imagens licenciadas adequadamente.

## Tecnologias e justificativa

O projeto usa HTML5, CSS3 e JavaScript puro (sem framework). Para esta loja demonstrativa, a opção mantém o código leve e permite mostrar explicitamente a lógica de busca, filtros, carrinho, cálculo de valores, persistência e validação, sem instalar dependências nem exigir etapa de compilação. O CSS organiza o layout responsivo com Grid/Flexbox, variáveis e media queries. O JavaScript foi separado entre dados, modelos do carrinho, interações da loja e validação do contato para facilitar a leitura e a manutenção.

## Como testar antes de entregar

1. Abra `index.html` e confira se os 10 produtos e as imagens aparecem.
2. Verifique se cada categoria mantém a mesma cor nos filtros, cartões, detalhes e carrinho.
3. Abra detalhes de produtos diferentes e confirme nome, categoria, preço e especificações.
4. Teste a busca, todos os filtros e as opções de ordenação.
5. Adicione produtos ao carrinho, altere quantidades, remova itens e esvazie o carrinho.
6. Teste o frete, os dois cupons e a persistência após atualizar a página.
7. Alterne entre Pix, crédito, débito e boleto e confira os valores e as mensagens demonstrativas.
8. Finalize um pedido de teste e confirme que a interface não afirma ter recebido um pagamento real.
9. Acesse `contato.html` e teste os campos vazios, e-mail inválido e formulário preenchido corretamente.
10. Teste os temas claro e escuro, o teclado e as páginas em tamanhos de tela diferentes.
11. Abra as ferramentas de desenvolvedor do navegador e confira o Console em busca de erros.

## Observação sobre pagamentos

O QR Code é apenas demonstrativo e utiliza uma chave fictícia. O projeto não se conecta a bancos ou provedores de pagamento, não solicita dados de cartão, não cria boleto bancário e não confirma pagamentos. Não utilize o QR Code para transferir dinheiro.