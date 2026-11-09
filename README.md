# PrettyJSON

JSON formatter, validator and tree explorer that runs entirely in the browser.

No backend. No tracking. Nothing leaves your machine.

---

## What it does

Paste or type JSON and it formats, validates, and highlights it. If the JSON is broken it tells you exactly where — line, column, and a snippet. Switch to tree view to explore nested structures without squinting at indentation.

**Format** — prettify with 2 spaces, 4 spaces, or tabs  
**Minify** — strip whitespace into a compact single line  
**Validate** — parse errors with line/column pointers and context  
**Tree view** — collapsible tree with filter, copy path, copy value  
**File support** — drag and drop `.json` files or upload from disk  
**Copy / Download** — grab the output or save it as a file

---

## Keyboard shortcuts

| Keys | Action |
| --- | --- |
| `Ctrl`/`⌘` + `Enter` | Format |
| `Ctrl`/`⌘` + `Shift` + `M` | Minify |
| `Ctrl`/`⌘` + `Shift` + `C` | Copy output |
| `Tab` | Indent in editor |
| `?` | Show shortcuts |
| `Esc` | Close dialog |

---

## Running locally

Requires Node.js 18 or newer.

```bash
git clone https://github.com/valekuuzhi/prettyjson.git
cd prettyjson
npm install
npm run dev
```

Open `http://localhost:5173`.

```bash
npm test          # run tests
npm run build     # production build
npm run preview   # preview the build
```

---

## Project layout

```
src/
├── components/
│   ├── EditorPane.tsx           # input editor, line numbers, drag-drop
│   ├── ErrorBanner.tsx          # error panel with snippet and caret
│   ├── Header.tsx               # title bar, samples menu, shortcuts button
│   ├── KeyboardShortcutsModal.tsx
│   ├── OutputPane.tsx           # syntax-highlighted output with find
│   ├── StatsBar.tsx             # status bar: size, depth, cursor
│   ├── Toolbar.tsx              # format/minify/validate actions, view controls
│   └── TreeView.tsx             # collapsible tree with search and copy
├── lib/json/
│   ├── __tests__/               # 21 unit tests (Vitest)
│   ├── formatter.ts             # format and minify
│   ├── highlighter.ts           # tokenizer for syntax colors
│   └── parser.ts                # parse, validate, extract error position
├── samples/
│   └── jsonSamples.ts           # built-in example files
├── App.tsx
├── index.css                    # design tokens, Tailwind v4
└── main.tsx
```

---

## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS v4
- Vitest

No UI component library. No external JSON processing. Everything is hand-written.

---

## License

MIT
