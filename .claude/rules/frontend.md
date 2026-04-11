# Frontend Conventions

## Tech Stack
- **Language**: TypeScript 5.9
- **UI Library**: React 19
- **Build Tool**: Vite 8
- **CSS**: Tailwind CSS v4
- **UI Components**: Radix UI Themes
- **Linter**: oxlint
- **Formatter**: oxfmt

## oxlint Configuration
- correctness + suspicious categories enabled

## oxfmt Configuration
- Indent: spaces
- Quotes: double quotes (`"`)
- Semicolons: none (auto-inserted only for ASI protection)
- Auto import sorting: enabled

## Tailwind CSS v4
- Integrated via Vite plugin (`@tailwindcss/vite`)
- CSS-first configuration (`tailwind.config.js` not required)

## Coding Conventions
- Use arrow functions for function definitions (`const fn = () => {}`) — `function` declarations are not allowed
- Prefer `interface` for type definitions — use `type` only when `interface` cannot express it (e.g., union types)
- Use named exports only — `export default` is not allowed

## Build
- Build with `tsc -b && vite build`
- Start dev server with `vite`
