# prettyjson

A JSON formatter and tree viewer. Paste JSON, it formats it. If it's invalid, it tells you where it broke.

Runs in the browser. Nothing is sent anywhere.

## Usage

Paste JSON into the editor and hit `⌘ Enter` to format. Switch to tree view to dig into nested structures. Drag and drop `.json` files directly onto the editor.

`⌘ Enter` format · `⌘ ⇧ M` minify · `⌘ ⇧ C` copy · `?` shortcuts

## Setup

```
npm install
npm run dev
```

```
npm test
npm run build
```

## Stack

React, TypeScript, Vite, Tailwind v4. No external JSON libraries.

## License

MIT
