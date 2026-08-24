# Como publicar um imóvel novo

Este é o guia rápido de "arrastar arquivo" — sem precisar mexer em código
nem rodar comando nenhum. Basta organizar uma pasta no Google Drive e, em
até ~5-10 minutos, o imóvel aparece sozinho no site.

## 1. Onde subir

Dentro da pasta do Drive combinada com você (ex: **"TBN Imóveis — Envio"**),
crie **uma pasta por imóvel**, com o nome que quiser (ex: `Casa Rua das Flores`).

## 2. O que colocar dentro da pasta do imóvel

Tudo direto dentro da pasta — sem subpastas:

```
Casa Rua das Flores/
  imovel.md              ← dados do imóvel (modelo abaixo)
  capa.jpg                ← a foto de capa (aparece na listagem e no topo da página)
  1 - Entrada.jpg          ← fotos numeradas, na ordem que devem aparecer
  2 - Sala de estar.jpg
  3 - Cozinha.jpg
  4 - Quintal.jpg
  PRONTO.txt               ← crie este arquivo (vazio) por ÚLTIMO
```

**Regras importantes:**

- A foto de capa **precisa se chamar `capa`** (`capa.jpg`, `capa.png` ou
  `capa.webp` — tanto faz a extensão, mas o nome antes do ponto tem que
  ser exatamente "capa").
- As outras fotos precisam **começar com um número** (`1 -`, `2 -`, `3 -`...).
  O número define a ordem de exibição; o texto depois do número vira a
  legenda da foto (ex: "Entrada", "Sala de estar").
- Arquivos com nome fora desse padrão são **ignorados** (ficam de fora do
  site, mas não quebram nada).
- **`PRONTO.txt` é o botão de publicar.** Enquanto essa pasta não tiver
  esse arquivo, o robô entende que você ainda está subindo fotos e
  **não publica nada**. Só crie o `PRONTO.txt` quando a pasta estiver
  100% completa. Pode ser um arquivo de texto totalmente vazio — o
  conteúdo não importa, só a presença dele.
- Para **atualizar** um imóvel já publicado (trocar preço, adicionar
  foto, corrigir texto): edite os arquivos normalmente. Não precisa
  apagar o `PRONTO.txt` — qualquer alteração dentro da pasta é detectada
  e o robô republica automaticamente na próxima passada.

## 3. Modelo do `imovel.md`

Copie o modelo abaixo, cole num arquivo `imovel.md` e preencha. As linhas
que começam com `##` são as "tags" que o robô reconhece — não mude os
nomes delas (Tipo, Bairro, Endereço, Valor, Descrição...), só o conteúdo
embaixo de cada uma.

```markdown
# Casa térrea com fachada em pedra

## Tipo
Casa

## Negócio
Venda

## Bairro
Jardim das Acácias

## Endereço
Rua das Flores, 123 - Botucatu/SP

## Valor
R$ 480.000

## Descrição
Casa térrea com 3 quartos, ampla sala de estar e quintal com
churrasqueira. Reformada recentemente, pronta para morar.

Fica a poucos minutos do centro, em rua tranquila e arborizada.

## O que só quem mora perto sabe
A padaria da esquina abre até tarde, e a rua é tranquila mesmo na hora
do rush — quase não passa carro de passagem.

## Quartos
3

## Banheiros
2

## Vagas
2

## Área
140

## Destaque
Sim
```

**Campos obrigatórios:** título (a primeira linha, com `#`), Tipo, Negócio,
Bairro, Endereço, Valor, Descrição e "O que só quem mora perto sabe".

**Campos opcionais** (viram 0 se não preencher): Quartos, Banheiros, Vagas,
Área, Destaque.

- `Tipo` aceita exatamente um destes 4: **Casa**, **Apartamento**,
  **Cobertura** ou **Sobrado**.
- `Negócio` aceita **Venda** ou **Aluguel** (qualquer variação com "alug"
  no meio conta como aluguel — nesse caso o valor é entendido como o
  aluguel mensal).
- `Valor` aceita `R$ 480.000`, `480.000,00` ou só `480000` — o robô
  entende os três formatos.
- `Descrição` pode ter vários parágrafos — só deixe uma linha em branco
  entre eles.
- **"O que só quem mora perto sabe"** é a marca registrada do site: uma
  informação real, pessoal, que só quem já visitou o bairro saberia (tipo
  de vizinhança, barulho, comércio por perto, sol da manhã/tarde). Aparece
  destacada na página do imóvel — não deixe genérico.
- `Área` é só o número em m² (ex: `140`, sem "m²" no final).
- `Destaque` (Sim/Não) controla se o imóvel aparece na seção "Imóveis em
  destaque" da página inicial.
- O **Endereço completo fica salvo no sistema**, mas por padrão **não é
  exibido publicamente no site** (só bairro/cidade aparecem) — é prática
  comum no mercado imobiliário evitar publicar o endereço exato antes do
  contato com o corretor. Se quiser mudar isso, é um ajuste simples no
  código (ver `docs/ARQUITETURA.md`).

## 4. Depois de criar o `PRONTO.txt`

Em até ~5-10 minutos o imóvel aparece no site automaticamente. Você pode
acompanhar (ou forçar uma checagem imediata) na aba **Actions** do
repositório no GitHub, rodando manualmente o workflow
**"Sincronizar imóveis do Google Drive"**.

## 5. Removendo ou despublicando um imóvel

Este fluxo automático só **adiciona/atualiza**. Para remover um imóvel do
site, apague o documento correspondente direto no Firestore (console do
Firebase → Firestore → coleção `imoveis`) — não é preciso mexer no Drive.
