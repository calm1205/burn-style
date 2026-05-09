# Frontend Conventions

## Coding Conventions
- Use arrow functions for function definitions (`const fn = () => {}`) — `function` declarations are not allowed
- Prefer `interface` for type definitions — use `type` only when `interface` cannot express it (e.g., union types)
- Use named exports only — `export default` is not allowed

## oxlint / oxfmt
- oxlint: correctness + suspicious categories enabled
- oxfmt: spaces, double quotes, no semicolons (auto-inserted only for ASI protection), auto import sorting

## Tailwind CSS v4
- Integrated via Vite plugin (`@tailwindcss/vite`)
- CSS-first configuration (no `tailwind.config.js`)
