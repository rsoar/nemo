# Plano de migração: Electron → Tauri

> Documento de planejamento — implementação futura. Foco: gerenciamento de
> janelas (como o Electron "emula" Chromium por janela vs. o modelo do Tauri),
> não a camada de dados. Premissa: até a hora dessa migração, a integração com
> banco em nuvem já estará implementada, então continuidade de dados locais
> não é um tópico de preocupação aqui.

## Por que Tauri
Objetivo é reduzir consumo de RAM e peso do app. Electron empacota um
Chromium+Node completo por app; Tauri usa o motor de renderização do próprio
SO (WebView2 no Windows, WebKitGTK no Linux) — ganho de RAM/disco vem daí. O
frontend (React/TipTap/Tailwind) é reaproveitado quase integralmente; o que
muda é o processo main (Node → Rust) e a forma como as janelas são geridas.

Alvos: Linux (máquina principal) e Windows (máquina secundária).

---

## Fase 0 — Preparação
- Criar o scaffold Tauri (`src-tauri/`) ao lado do Electron existente, sem
  remover nada — as duas stacks convivem até o corte final.
- Pinar toolchain Rust e Tauri CLI; decidir target Windows (`msvc`
  recomendado pela própria Tauri; `gnu`/cross-compile a partir do Linux tem
  mais atrito).
- Confirmar que `renderer/` (React/TipTap/Tailwind, build Vite) sobe como
  frontend do Tauri sem mudança de build.

## Fase 1 — Modelo de janelas (o núcleo da migração)
Este é o ponto crítico real da migração: Electron dá **um processo Chromium
por `BrowserWindow`** — painel e bolha hoje são dois `BrowserWindow`
completos, cada um carregando seu próprio entry (`index.html` /
`bubble.html`, configurados em `electron.vite.config.ts::rollupOptions.input`).
O Tauri não replica Chromium por janela — usa **um único motor de
renderização do SO** instanciado por janela, de onde vem a economia de RAM,
mas isso muda a mecânica de orquestração.

Pontos a portar, todos hoje em `main/windows/*.ts`:

- **Multi-janela:** mapear os dois entries (painel/bolha) pra duas janelas
  Tauri (`tauri.conf.json` → array `windows`, ou criação dinâmica via
  `WindowBuilder` apontando pra URLs/rotas diferentes do mesmo bundle Vite).
- **Frameless + drag:** `frame: false` → `decorations: false`;
  `-webkit-app-region: drag` (usado em `.drag`/`.no-drag`) →
  atributo `data-tauri-drag-region` no HTML — mudança de marcação real em
  `Titlebar.tsx`, não é 1:1 automático.
- **Transparência da bolha:** `transparent: true` existe nos dois, mas
  depende do compositor: no Linux depende do WM ter compositing ativo
  (Cinnamon/Muffin costuma ter, mas testar); no Windows tem suas próprias
  regras de composição — testar em ambas antes de assumir paridade visual
  com o Electron.
- **Always-on-top + quirk de posição:** o reaplique de bounds do painel
  após `ready-to-show` (WMs Linux ignoram bounds do construtor) é um
  comportamento observado com Chromium/Electron — não presumir que persiste
  ou não no WebKitGTK/WebView2; validar nos dois SOs.
- **Orquestração singleton (`manager.ts`):** hoje é lógica Node no processo
  main garantindo que só painel OU bolha fique visível. No Tauri essa lógica
  migra pra **Rust**, usando `app.get_window("panel").show()/.hide()` — não
  é código que "só recompila", é reescrito no novo lado do processo main.
- **Modelo de segurança do preload:** `contextBridge` +
  `contextIsolation: true` + `nodeIntegration: false` (Electron) vira o
  sistema de **capabilities/permissions** do Tauri — cada janela declara
  quais comandos pode invocar. Decidir explicitamente: o painel
  provavelmente precisa do contrato completo de notas/categorias; a bolha
  talvez só precise de "mostrar painel" e contagem de badge — oportunidade
  de reduzir a superfície exposta por janela, algo que o preload único do
  Electron hoje não distingue.

## Fase 2 — Tray
- Portar `tray.ts` (ícone + menu Abrir/Sair) pra API de tray do Tauri.
- Confirmar que clique no tray/bolha reabre o painel via a mesma orquestração
  Rust da Fase 1 — ponto de integração entre tray e window manager, testar
  nas duas plataformas (suporte a tray no Linux depende do ambiente aceitar
  `StatusNotifierItem`, geralmente ok no Cinnamon).

## Fase 3 — Contrato de API (frontend ↔ backend)
- Portar os canais IPC (`notes:*`, `categories:*`, `window:*`) pra
  `#[tauri::command]`, com adaptador no frontend implementando a mesma
  interface hoje exposta como `window.api` — zero mudança nos componentes
  React.
- Como a persistência já é nuvem, esses comandos tendem a ser wrappers finos
  chamando o cliente HTTP/SDK da nuvem — a complexidade aqui é a ponte IPC
  em si, não lógica de dados.

## Fase 4 — Empacotamento multiplataforma
- `tauri.conf.json`: bundlers `deb`/`appimage` (Linux) e `msi`/`nsis`
  (Windows).
- Build nativo em cada máquina (mais simples que CI/cross-compile pra 2
  alvos conhecidos).
- Manter convenções de nome (`nemo-notes` / "nemo") equivalentes ao
  `electron-builder.yml` atual.

## Fase 5 — QA de paridade
- Checklist manual nas duas máquinas: abrir/fechar/minimizar, arrastar
  painel, bolha (transparência + animação do peixe + always-on-top), tray,
  redimensionar painel.
- Foco extra em qualquer diferença visual/comportamental entre WebKitGTK e
  WebView2 nos itens da Fase 1 — lugar mais provável de divergência entre
  Linux e Windows.

## Fase 6 — Corte
- Rodar as duas stacks em paralelo por um tempo antes de aposentar o código
  Electron.
- Atualizar `docs/architecture.md`/`CLAUDE.md` só depois de validado.

---

## Resumo dos pontos críticos
1. Tradução do modelo multi-janela (Chromium por `BrowserWindow` → webview
   único do SO por janela) — Fase 1.
2. Troca de `-webkit-app-region` por `data-tauri-drag-region` — mudança de
   marcação, não automática.
3. Transparência/always-on-top: comportamento não garantido idêntico entre
   WebKitGTK (Linux) e WebView2 (Windows) — validar em ambos.
4. Orquestração do window manager migra de Node para Rust — reescrita, não
   port mecânico.
5. Modelo de permissões por janela (capabilities do Tauri) substitui o
   preload único do Electron — decisão de design, não só troca de API.
