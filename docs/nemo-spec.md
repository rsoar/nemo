# nemo — Especificação do produto (referência para layout)

> Documento de referência para elaboração do **layout / UI**. Descreve o
> propósito, as superfícies visuais, telas, componentes, estados e restrições.
> Não é documentação de implementação.

---

## 1. Visão geral

**nemo** é um aplicativo de desktop para anotações do dia a dia — um "notepad
turbinado". A diferença para um bloco de notas comum: cada anotação tem
**título**, pode receber **tags** e **uma categoria**, e o corpo aceita
**formatação rica (markdown / WYSIWYG)**.

A presença do app na tela é a sua marca registrada: ele vive como um **painel
lateral encostado na borda da tela** e, quando recolhido, vira uma **bolha
flutuante** (estilo widget de chat de site), sempre acessível por cima das
outras janelas.

**Plataforma:** desktop (Linux/Windows/macOS), janela sem moldura do sistema
(*frameless*) — toda a "cromática" da janela (barra de título, botões) é
desenhada pela própria UI.

**Tom visual atual (provisório, pode evoluir):** tema escuro, cor de destaque
azul-periwinkle (`#6d8bff`), tipografia de sistema. Sinta-se livre para propor
direção visual.

---

## 2. Conceitos de domínio

| Entidade | Descrição | Relação |
|----------|-----------|---------|
| **Nota** | Unidade de anotação. Tem título, corpo formatado, datas de criação/edição. | pertence a 0–1 categoria; tem 0–N tags |
| **Categoria** | Agrupamento exclusivo (uma nota só pode estar em uma). Tem nome e cor. | 1 categoria → N notas |
| **Tag** | Rótulo livre e reutilizável. Tem nome. | N tags ↔ N notas |

Implicações de layout:
- Uma nota exibe **um selo de categoria** (com cor) e **vários chips de tag**.
- Precisamos de formas de **filtrar/navegar** por categoria e por tag.
- Categoria é cor + nome → bom para coluna/seção de navegação.

---

## 3. Superfícies (janelas)

O app tem **três superfícies visuais**. Só uma das duas principais (painel ou
bolha) fica visível por vez.

### 3.1 Painel (superfície principal)
- Janela estreita e alta, **encostada na borda direita** da tela, ocupando a
  altura útil disponível.
- Largura **redimensionável** pelo usuário (mínimo ~320px, padrão ~420px).
- **Arrastável** (inclusive entre monitores); snap às bordas é refinamento
  futuro.
- *Frameless*: tem uma **barra de título própria** no topo com a marca "nemo" e
  os botões de janela.
- É onde acontece TODA a experiência de anotações (lista, editor, busca,
  filtros).

### 3.2 Bolha (estado recolhido)
- Círculo pequeno (~56px) flutuante no **canto inferior direito**, sempre por
  cima.
- Fundo transparente ao redor do círculo (só o círculo é visível).
- Mostra a marca ("m" / ícone). Ao clicar, **reabre o painel**.
- É o "estado minimizado" do app.

### 3.3 Bandeja do sistema (tray)
- Ícone na bandeja do SO. Clique abre o painel.
- Menu de contexto: **Abrir**, **Sair**.
- É o "estado fechado": o app some da tela mas continua rodando.

### Transições entre superfícies
```
            minimizar (–)              clicar na bolha
   PAINEL ───────────────────► BOLHA ───────────────────► PAINEL
     │                                                       ▲
     │ fechar (✕)                          clicar no tray /  │
     ▼                                     menu "Abrir"      │
   BANDEJA ──────────────────────────────────────────────────
```

---

## 4. Anatomia do painel (foco do layout)

Da cima para baixo, o painel se organiza em regiões:

### 4.1 Barra de título (sempre visível)
- Marca "nemo".
- Botões de janela à direita: **minimizar** (vira bolha) e **fechar** (vai pra
  bandeja).
- É a **área de arraste** da janela (exceto onde há botões).
- Altura enxuta (~38px).

### 4.2 Barra de ações / busca
- Campo de **busca** por texto (procura em título e conteúdo).
- Botão **nova nota** (ação primária, destaque).
- Acesso a **filtros** (por categoria / por tag).

### 4.3 Navegação / filtros
- Forma de filtrar por **categoria** (lista com cores) e por **tags** (chips
  selecionáveis).
- Pode ser uma seção recolhível, um seletor, ou uma faixa de chips — a definir
  no layout. Considerar o **espaço estreito** do painel.

### 4.4 Lista de notas
- Itens de nota mostrando: **título**, trecho/preview do conteúdo, **selo de
  categoria** (cor), **chips de tag**, e **data** (ex.: "editado há 2h").
- Ordenação por data de edição (mais recente primeiro) como padrão.
- Item selecionado abre o editor.
- Estado vazio (sem notas) precisa de tratamento visual.

### 4.5 Editor de nota
- Campo de **título** (destaque, no topo).
- **Editor de corpo WYSIWYG** (markdown): negrito, itálico, listas, títulos,
  citações, código, links etc.
- Atribuição de **categoria** (seletor único, com cor) e **tags** (adicionar /
  remover múltiplas).
- Metadados: datas de criação/edição.
- Ações: salvar (idealmente **autosave**), excluir.

> Como o painel é estreito, considere se lista e editor convivem na mesma tela
> (ex.: lista → clica → editor "empilha"/navega) ou se há alternância de modos.
> Provavelmente **navegação por estados** (lista ↔ editor) em vez de duas
> colunas lado a lado.

---

## 5. Funcionalidades

### 5.1 Já implementado (Fases 0–1)
- [x] Shell do app: painel lateral à direita, *frameless*, sempre no topo.
- [x] Painel arrastável e redimensionável (largura).
- [x] Barra de título própria com minimizar/fechar.
- [x] Bolha flutuante (recolhido) que reabre o painel.
- [x] Ícone na bandeja com menu Abrir/Sair.

### 5.2 Próximas fases (precisam de UI)
- [ ] **CRUD de notas** (criar, listar, editar, excluir) — *Fase 2*.
- [ ] **Editor WYSIWYG/markdown** (TipTap) — *Fase 3*.
- [ ] **Tags e categorias**: criar, atribuir, filtrar; busca por texto — *Fase 4*.
- [ ] Persistência local (SQLite) — não impacta layout.

### 5.3 Futuro / pós-MVP (mencionar, não desenhar agora)
- Sincronização com banco SQL remoto.
- Snap do painel às bordas / multi-monitor refinado.
- Reposicionar a bolha arrastando.
- Possíveis: ordenação/agrupamento, favoritos, atalhos de teclado, exportar.

---

## 6. Estados que o layout precisa cobrir

- **Lista vazia** (nenhuma nota ainda) — onboarding/empty state.
- **Lista com notas** (com e sem categoria/tags).
- **Busca sem resultados.**
- **Editor: nota nova** (campos vazios) vs **nota existente**.
- **Filtro ativo** (mostrar que há filtro aplicado e permitir limpar).
- **Bolha** (estado recolhido).
- Largura do painel **mínima (~320px)** vs **mais larga** — layout responsivo
  dentro da faixa.

---

## 7. Restrições e diretrizes para o layout

- **Espaço estreito e vertical**: tudo precisa funcionar bem em ~320–420px de
  largura. Priorizar densidade legível e navegação vertical.
- **Frameless**: a UI desenha a barra de título; reservar a faixa de arraste no
  topo e manter botões clicáveis (não-arrastáveis).
- **Sempre no topo**: o app fica sobre outras janelas — visual deve ser
  discreto e não agressivo.
- **Bolha pequena**: o ícone recolhido precisa ser reconhecível em ~56px.
- **Acessibilidade**: contraste adequado (tema escuro), alvos de clique
  confortáveis, foco de teclado.
- **Cores de categoria**: o sistema de cores precisa conviver com a paleta do
  app sem poluir.

---

## 8. Resumo para a IA de layout

Projete a **UI do painel** (estreito, vertical, frameless, tema escuro, sempre
no topo) cobrindo: barra de título com controles de janela, busca + nova nota,
filtros por categoria/tag, **lista de notas** e **editor de nota** (título +
corpo WYSIWYG + categoria + tags), além do **estado vazio** e da **bolha
recolhida**. Assuma navegação por estados (lista ↔ editor), não duas colunas.
