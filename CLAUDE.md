# CLAUDE.md

Contexto pro Claude Code neste projeto. Mantenha enxuto — isto é carregado toda
sessão. Detalhes ficam nos docs; aqui vão orientação + regras que evitam erro.

## O que é
**nemo** — app de notas de desktop (Electron + React + TS): painel lateral
frameless + bolha flutuante (com peixe) + tray; notas com título, categoria,
tags e corpo rich-text (TipTap); SQLite local. App pessoal, incremental.

## Leia primeiro (referências)
- **`docs/architecture.md`** — arquitetura, mapa de arquivos, camada de dados,
  IPC, empacotamento, convenções. **Comece por aqui** pra qualquer implementação.
- **`docs/nemo-spec.md`** — design/UX da UI (superfícies, telas, estados).

## Comandos
```bash
npm run dev        # desenvolvimento (HMR)
npm run typecheck  # tsc (node + web) — rode antes de concluir
npm run build      # bundle em out/
npm run rebuild    # recompila better-sqlite3 p/ o Electron (após npm install fresco)
npm run dist       # gera .deb e .AppImage em release/
```

## Regras / pegadinhas (não esquecer)
- **Arquitetura:** o **renderer nunca acessa DB/fs direto** — só via `window.api`
  (tipado em `src/shared/types.ts`). Novo canal IPC = mexer em **3 lugares**:
  `shared/types.ts` (contrato) + `main/ipc/index.ts` (handler) + `preload/index.ts` (binding).
- **Node 18.20.8:** manter **Vite 5** e **Tailwind 3** (v6/v4 exigem Node 20+). Não subir sem combinar.
- **Empacotar:** use o binário **local** (`npm run dist`); `npx electron-builder` puxa versão que quebra no Node 18.
- **Nomes:** pacote Debian = **`nemo-notes`** (não colidir com o `nemo` do Cinnamon); app se chama "nemo"; `userData` = `~/.config/nemo`.
- **better-sqlite3** é o **único** `dependency` de runtime; o resto é `devDependency` (Vite empacota). Após `npm install` fresco, rode `npm run rebuild` antes do `dev`.
- **Preview de SVG:** sem rasterizador no ambiente; renderize offscreen com o próprio Electron (`offscreen: true` → `paint`/`capturePage`). PNGs de ícone via PIL.
- **Bolha:** 3 camadas em `src/renderer/src/bubble/` — `bubble.svg` (fundo) + `fish.svg` (anima) + `glass.svg` (reflexo, trocável). Ajuste de tamanho: `bubble.ts::BUBBLE_SIZE` + `size-*` no `Bubble.tsx`.
- **Autosave:** padrão em `NoteEditor.tsx` (refs + debounce + dirty-check + fila serializada). Reutilize.

## Convenções
- Commits **sucintos**, prefixos git-flow (`feat`/`fix`/`chore`/`refactor`/`docs`). **Não** alterar `git config user.name`.
- Rode `npm run typecheck` (e `build` quando fizer sentido) antes de concluir uma mudança.
- Escreva código no padrão do entorno (o layout veio do Lovable como *referência*, não cópia 1:1).
