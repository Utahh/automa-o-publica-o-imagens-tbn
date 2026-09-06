# Como cadastrar um imóvel novo

Cadastro é feito direto no site, sem precisar do Google Drive nem de
ninguém rodando nada por trás. Só o Cauan e o Toninho têm acesso.

## 1. Entrar no painel

Acesse **toninho-bomnome.vercel.app/admin** e entre com **e-mail e
senha** (a conta configurada no Firebase — se esqueceu a senha, peça pro
Cauan resetar). O login com conta do Google está desativado por
enquanto (ver `docs/ARQUITETURA.md`).

Só as contas autorizadas (a sua e a do Cauan) conseguem ver alguma coisa
depois de entrar — qualquer outra conta cai de volta na tela de login
com um aviso.

## 2. Criar o imóvel

Clique em **+ Novo imóvel** e preencha:

- **Título** — nome curto do imóvel (ex: "Casa térrea com fachada em pedra").
- **Tipo** — Casa, Apartamento, Sobrado, Kitnet, Fazenda, Galpão ou Terreno.
- **Negócio** — Venda ou Aluguel.
- **Status** — Disponível ou Em negociação.
- **Valor** — em reais (só o número, sem "R$").
- **Localização** — digite o **CEP** e o formulário preenche sozinho
  endereço/bairro/cidade/estado (só falta completar o número da casa).
  Se preferir, preencha os campos na mão.
- **Quartos / Banheiros / Vagas / Área** — os números do imóvel.
- **Descrição** — pode escrever vários parágrafos; deixe uma linha em
  branco entre cada um.
- **"O que só quem mora perto sabe"** — a marca registrada do site: uma
  informação real, pessoal, que só quem já visitou o bairro saberia
  (vizinhança, barulho, comércio por perto, sol da manhã/tarde). Não
  deixe genérico.

## 3. Fotos e vídeo

Clique em **Adicionar fotos** e escolha uma ou várias de uma vez.

- A **primeira foto da lista é a capa** — aparece na home e na listagem
  de imóveis. Clique na estrela numa foto pra ela virar a nova capa.
- Use as setinhas embaixo de cada foto pra mudar a ordem.
- O lixo remove a foto.
- **Vídeo é opcional** — clique em "Adicionar vídeo" se tiver um
  gravado. Fotos até 15 MB cada, vídeo até 100 MB.

## 4. Destaque

O interruptor **"Destacar na página inicial"** controla se o imóvel
aparece na seção "Imóveis em destaque" da home. Pode ligar/desligar a
qualquer momento, inclusive depois de já ter publicado — o site atualiza
na hora, sem precisar salvar o formulário inteiro de novo (dá pra fazer
isso direto na lista de imóveis, veja abaixo).

## 5. Salvar

- **Salvar rascunho** — grava tudo, mas o imóvel **não aparece no site**
  ainda. Use pra deixar cadastrando aos poucos, sem pressa.
- **Publicar** — grava e coloca no ar imediatamente.

Depois de criado, o imóvel ganha um **código** (ex: `TB-0012`), que
aparece na lista do painel e discretamente na página do imóvel no site —
útil pra localizar rápido quando um cliente liga perguntando por ele.

## 6. Gerenciando o que já está publicado

Na tela inicial do painel (**Imóveis**), cada linha tem:

- O **status** (Publicado/Rascunho) — clique pra alternar.
- O **interruptor de Destaque** — clique pra ligar/desligar na hora.
- O lápis, pra **editar** qualquer campo (inclusive trocar fotos).
- A lixeira, pra **excluir** de vez (apaga o imóvel e as fotos/vídeo
  dele — não dá pra desfazer, por isso pede confirmação).

Não existe mais console do Firebase nem pasta de Drive pra mexer — tudo
que precisa fazer com um imóvel está nessa tela.
