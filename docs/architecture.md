# nemo — Arquitetura & Contexto do Projeto

> Guia de referência para entender o código e implementar novas features com
> contexto. Para o **design/UX da UI**, veja [`nemo-spec.md`](./nemo-spec.md).

## Índice
1. [O que é](#o-que-é)
2. [Stack](#stack)
3. [Comandos](#comandos)
4. [Arquitetura (processos)](#arquitetura-processos)
5. [Mapa de arquivos](#mapa-de-arquivos)
6. [Camada de dados (SQLite)](#camada-de-dados-sqlite)
7. [Contrato IPC](#contrato-ipc)
8. [Renderer / UI](#renderer--ui)
9. [Janelas (painel, bolha, tray)](#janelas-painel-bolha-tray)
10. [A bolha animada (peixe)](#a-bolha-animada-peixe)
11. [Padrão de autosave](#padrão-de-autosave)
12. [Empacotamento & nomes](#empacotamento--nomes)
13. [Convenções & pegadinhas](#convenções--pegadinhas)
14. [Backlog / deferidos](#backlog--deferidos)

---

## O que é
**nemo** é um app de notas de desktop — um "notepad turbinado": notas do dia a
dia com **título, categoria (1), tags (N) e corpo em markdown/rich text**. A UI
é um **painel lateral encostado à direita**; minimizado, vira uma **bolha
flutuante** (com um peixinho nadando) sempre por cima; fechado, vai pra
**bandeja (tray)**. Armazenamento **local (SQLite)**, com migração futura
planejada pra **SQL remoto** — por isso a camada de dados é isolada atrás de um
contrato tipado.

App **pessoal**, evoluído de forma incremental. Histórico de nome: `trainck` →
`memo` → **`nemo`**.

## Stack
- **Electron** + **React 18** + **TypeScript**, build via **electron-vite** (Vite 5).
- **SQLite** via `better-sqlite3` (síncrono, módulo nativo).
- **Editor:** TipTap v2 + `tiptap-markdown`.
- **UI:** Tailwind **v3** + `lucide-react` + fonte Inter (`@fontsource`). Sem shadcn.
- **Empacotamento:** electron-builder (AppImage + deb).
- **Node 18.20.8** — vários pins vêm daí (Vite 5 e Tailwind 3, não 6/4 que pedem Node 20+).

## Comandos
```bash
npm run dev         # electron-vite dev (HMR)
npm run build       # bundle de produção em out/
npm run typecheck   # tsc dos projetos node + web
npm run rebuild     # recompila better-sqlite3 p/ o ABI do Electron
npm run pack        # build + electron-builder --dir (validação rápida)
npm run dist        # build + electron-builder (gera .AppImage e .deb em release/)
```
> Empacotar: use SEMPRE o binário local (`npm run dist` / `./node_modules/.bin/electron-builder`).
> `npx electron-builder` puxa uma versão mais nova que quebra no Node 18 (ERR_REQUIRE_ESM).

## Arquitetura (processos)
Três "lados", com uma **regra de ouro**: o **renderer nunca toca em DB/fs
diretamente** — tudo passa pelo `window.api` tipado, exposto via `contextBridge`
no preload (`contextIsolation: true`, `nodeIntegration: false`).

```
renderer (React)  ──window.api──►  preload (bridge)  ──ipcRenderer/ipcMain──►  main (Node)
      UI                         contrato tipado                         janelas • SQLite • tray
                         ▲ tipos compartilhados em src/shared/types.ts (a "costura") ▲
```
`src/shared/types.ts` é a **fonte única de verdade** dos tipos de domínio
(`Note`, `Tag`, `Category`) e do contrato (`NemoApi`, `NoteInput`, etc.). É esse
o ponto de encaixe da futura troca por SQL remoto: muda a implementação dos
repositórios, o contrato fica igual.

## Mapa de arquivos
```
src/
├── main/                      # Processo principal (Node/Electron)
│   ├── index.ts               # bootstrap: setName('nemo'), abre DB, cria janelas/tray/IPC
│   ├── db/
│   │   ├── connection.ts      # abre ~/.config/nemo/nemo.db (WAL, FKs), seed de categorias,
│   │   │                      #   e MIGRAÇÃO do legado ~/.config/memo/memo.db
│   │   ├── schema.ts          # DDL (notes, categories, tags, note_tags) — idempotente
│   │   ├── noteRepository.ts  # CRUD de notas + tags (transações)
│   │   └── categoryRepository.ts # list/create/remove de categorias
│   ├── ipc/index.ts           # registra TODOS os handlers IPC
│   └── windows/
│       ├── manager.ts         # orquestra painel ↔ bolha (só um visível)
│       ├── panel.ts           # janela do painel (frameless, ancorada à direita)
│       ├── bubble.ts          # janela da bolha (transparente, canto inf. direito)
│       └── tray.ts            # ícone/menu da bandeja
├── preload/
│   ├── index.ts               # expõe `window.api` (NemoApi) via contextBridge
│   └── index.d.ts             # declara Window.api p/ o renderer
├── renderer/
│   ├── index.html             # entry do PAINEL
│   ├── bubble.html            # entry da BOLHA (2ª janela, mesmo build)
│   └── src/
│       ├── main.tsx           # monta App (painel) + importa Inter/index.css
│       ├── App.tsx            # estado de topo: notes, categories, view (list|editor)
│       ├── index.css          # Tailwind + tokens (oklch) + estilos do editor (.prose-nemo)
│       ├── components/
│       │   ├── Titlebar.tsx        # barra frameless (marca/voltar + min/close)
│       │   ├── NoteList.tsx        # busca, pills de filtro, lista, empty states
│       │   ├── NoteEditor.tsx      # título, categoria (menu+CRUD), tags, autosave
│       │   ├── RichEditor.tsx      # TipTap (StarterKit+Link+Placeholder+Markdown)
│       │   └── FormattingToolbar.tsx # toolbar flutuante do editor
│       ├── lib/format.ts      # formatWhen() — data relativa pt-BR
│       └── bubble/            # a 2ª janela (bolha)
│           ├── main.tsx       # monta Bubble + importa index.css/bubble.css
│           ├── Bubble.tsx     # 3 camadas: bubble.svg + fish.svg(animado) + glass.svg
│           ├── bubble.css     # animações do peixe (@keyframes nemo-swim/bob)
│           ├── bubble.svg     # esfera d'água (fundo)
│           ├── fish.svg       # clownfish transparente (anima)
│           └── glass.svg      # reflexos de vidro (provisório; trocável)
└── shared/types.ts            # domínio + contrato IPC (NemoApi)

build/icon.{svg,png}           # ícone-fonte do app + PNG 512 (electron-builder)
resources/{icon,tray-icon}.png # ícones do app/tray empacotados
electron-builder.yml           # config de empacotamento (targets, naming)
electron.vite.config.ts        # 3 builds: main, preload, renderer(2 entries: index+bubble)
tailwind.config.js             # tokens → cores/sombras/raios; content globs
```

## Camada de dados (SQLite)
- **Local:** `~/.config/nemo/nemo.db` (WAL + `foreign_keys` on). Conexão única lazy em `connection.ts::getDb()`.
- **Schema** (`schema.ts`, `CREATE TABLE IF NOT EXISTS`):
  - `notes(id, title, body_json, body_md, category_id→categories, created_at, updated_at)`
  - `categories(id, name UNIQUE, color)` — 1:N com notes (`ON DELETE SET NULL`)
  - `tags(id, name UNIQUE)` — N:N via `note_tags(note_id, tag_id)` (`ON DELETE CASCADE`)
- **Seed:** 5 categorias-preset (Work/Personal/Study/Ideas/Product, cores oklch) só se a tabela estiver vazia.
- **Migração:** `migrateLegacyDatabase()` copia `~/.config/memo/memo.db` (+ WAL/SHM) pra `nemo.db` no 1º arranque, se ainda não existir. Legado do rename memo→nemo.
- **Repositórios:** funções puras que retornam tipos de `shared`. Notas gravam categoria + tags em **transação** (`db.transaction`); tags são upsert por nome e religadas a cada save.
- **body_json vs body_md:** `body_json` = doc TipTap (reabrir fiel); `body_md` = markdown (busca/exportação). O editor gera ambos.

## Contrato IPC
Registrado em `main/ipc/index.ts`, exposto em `preload/index.ts` como `window.api`. Canais:
| Domínio | Canais | Tipo |
|---|---|---|
| Notas | `notes:list/get/create/update/remove` | `ipcMain.handle` (Promise) |
| Categorias | `categories:list/create/remove` | `ipcMain.handle` |
| Janela | `window:minimize/close/show` | `ipcMain.on` (fire-and-forget) |

Ao adicionar um canal: (1) tipo em `shared/types.ts` (`NemoApi`), (2) handler em `ipc/index.ts`, (3) binding no `preload/index.ts`. Os três juntos.

## Renderer / UI
- **Navegação por estado** (sem router): `App.tsx` guarda `view = {mode:'list'} | {mode:'editor', id}` e alterna `NoteList`/`NoteEditor`.
- **Cada view renderiza sua própria `Titlebar`** (a do editor tem "Voltar" que faz flush do autosave).
- **Estilo:** Tailwind v3 com tokens em `index.css` (`:root` oklch); cores mapeadas em `tailwind.config.js` como `var(--token)`. **Evite** modificadores `/opacity` em cores custom (use `white`/`emerald` p/ alpha, que funcionam). Conteúdo do editor estilizado sob `.prose-nemo`.
- **Frameless:** arraste via classes utilitárias `.drag` / `.no-drag` (`-webkit-app-region`), definidas em `index.css`.
- **Duas entradas de build:** `index.html` (painel) e `bubble.html` (bolha) — configuradas em `electron.vite.config.ts` (`rollupOptions.input`).

## Janelas (painel, bolha, tray)
- **manager.ts** garante que só uma (painel ou bolha) apareça. "Fechar" esconde tudo (tray), **não** encerra o app (quit só pelo menu do tray).
- **Semântica:** minimizar → bolha; fechar → tray; clicar bolha/tray → reabre painel.
- **Painel:** frameless, `alwaysOnTop`, arrastável + largura redimensionável. Posição é **reaplicada após `ready-to-show`** (WMs do Linux ignoram os bounds do construtor). Ancorado à direita via `screen.getDisplayMatching(...).workArea`.
- **Bolha:** janela transparente pequena no canto inferior direito. Tamanho em `bubble.ts::BUBBLE_SIZE` (círculo ~112px numa janela de 152px, folga p/ sombra+badge).

## A bolha animada (peixe)
`Bubble.tsx` empilha **3 camadas** (todas `<img>` de SVG, importadas como asset):
1. `bubble.svg` — esfera d'água (fundo, estática).
2. `fish.svg` — clownfish **transparente**, dentro de um wrapper recortado ao círculo (`inset-[6%] overflow-hidden rounded-full`) que **anima** (`.fish-swim` = nada de ponta a ponta + vira; `.fish` = bob). O peixe olha pra **esquerda** nativamente → os `@keyframes nemo-swim` (em `bubble.css`) usam `scaleX` pra ele sempre virar na direção do nado.
3. `glass.svg` — reflexos de vidro por cima (`pointer-events-none`), pra parecer submerso. **Provisório**: pra trocar, só salvar por cima de `glass.svg` (o código já aponta).
Respeita `prefers-reduced-motion` (para o nado). Badge de contagem por cima de tudo.
> Ajustes de tamanho: `BUBBLE_SIZE` (bubble.ts) + classes `size-*` do círculo/peixe (Bubble.tsx) + amplitude `translateX` (bubble.css).

## Padrão de autosave
`NoteEditor.tsx` é a referência do padrão (reusar em telas futuras):
- Valores lidos pelo save vivem em **refs** (`titleRef`, `bodyRef`, `categoryRef`, `tagsRef`, `noteIdRef`) → timers/flush sempre veem o valor atual.
- **Debounce** (600ms) via `schedule()`; **dirty-check** compara título/md/categoria/tags contra `savedRef` (evita gravações espúrias).
- **Escritas serializadas** numa fila de promises (`chain`) → um create + um flush não viram dois INSERTs pra a mesma nota nova.
- "Voltar"/"Concluir" fazem `persist()` (flush) antes de sair; nota nova vazia não é gravada.

## Empacotamento & nomes
- **electron-builder.yml**: targets **AppImage + deb** (Linux), ícone `build/icon.png`, saída `release/`. `asarUnpack: "**/*.node"` (better-sqlite3 não carrega de dentro do asar).
- **Só `better-sqlite3` é `dependency`** (runtime). Todo o resto (react, tiptap, tailwind…) é `devDependency` — o Vite empacota em `out/`, então o `node_modules` do pacote fica minúsculo.
- **Nomes (importante):** o pacote Debian é **`nemo-notes`** (package.json `name`) pra **não colidir** com o `nemo` do Cinnamon (gerenciador de arquivos). O app mostra **"nemo"** (`productName`/`executableName`), `appId: com.rsoar.nemo`, e `app.setName('nemo')` mantém `userData` em `~/.config/nemo`.
- **Instalar:** `sudo apt install ./release/nemo-<v>.deb` (resolve `libxss1` e cia; `dpkg -i` sozinho não resolve deps). O `.deb` já configura o `chrome-sandbox` com setuid.
- **AppImage** precisa de **FUSE2** (`libfuse2`) ou rodar com `--appimage-extract-and-run`; a máquina do dev só tem FUSE3 → por isso o `.deb` é o caminho principal.

## Convenções & pegadinhas
- **Commits:** sucintos, prefixos git-flow (`feat`/`fix`/`chore`/`refactor`). Não mexer no `git config user.name`.
- **better-sqlite3:** após um `npm install` "fresco", rode `npm run rebuild` antes do `dev` (senão erro de ABI). No empacotamento, o electron-builder recompila sozinho.
- **Preview de SVG sem rasterizador:** o ambiente não tem Inkscape/convert/cairosvg. PNGs de ícone são gerados via **PIL** reproduzindo o SVG. Pra "ver" um SVG, renderizamos offscreen com o próprio Electron (`webContents` `offscreen: true` → `capturePage`/`paint`).
- **Node 18:** manter Vite 5 e Tailwind 3. Subir pra Node 20+ destravaria Vite 6/7 e Tailwind 4 (migração futura).

## Backlog / deferidos
- Editor: **inserir imagem** (botão existe, desabilitado).
- Painel: **snap às bordas** ao arrastar; **arrastar a bolha** de posição.
- Painel com **cantos arredondados** (exige janela transparente).
- **Criar categorias customizadas** já existe; falta talvez editar cor/nome.
- **Migração p/ SQL remoto** (objetivo de longo prazo; a costura já está pronta).
- Alvos **Windows/macOS** no electron-builder.
- Ícone do app/tray: hoje é um peixe geométrico simples (nítido a 32px); alinhar com o clownfish da bolha (versão simplificada) é opcional.
