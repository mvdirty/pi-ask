# AGENTS.md

Guidance for agents working in this repository.

## Project scope

This repo builds a **pi.dev extension** that adds an `ask` / interview-style user question flow.

Primary deliverables in this repo:

- research and comparison docs:
  - `RESEARCH.md`
  - `FINDINGS.md`
  - `SPEC.md`
- TypeScript extension implementation in `src/`
- tests for core logic in `tests/`

## Key project goals

When making changes, optimize for:

1. **pi-native extension design**
   - prefer `pi.registerTool()`
   - prefer `ctx.ui.custom()` for complex interactive flows
   - keep result shapes compatible with normal pi tool results

2. **testable architecture**
   - keep state and decision logic in plain TypeScript modules
   - keep pi/TUI wiring thin
   - prefer testing state transitions and serialization over testing terminal rendering details

3. **research alignment**
   - keep implementation consistent with `SPEC.md`
   - if behavior changes materially, update `README.md` and `SPEC.md`
   - if new harness findings are added, update `RESEARCH.md` and/or `FINDINGS.md`

## Tech stack

- TypeScript
- pnpm
- Biome
- pi extension APIs from `@mariozechner/pi-coding-agent`
- TUI components from `@mariozechner/pi-tui`
- TypeBox for tool schemas

## Commands

Use these project commands:

```bash
pnpm install
pnpm test
pnpm typecheck
pnpm format
pnpm lint
pnpm check
```

Notes:

- `pnpm check` runs Biome write/check flow for this repo.
- `pnpm test` runs the Node test runner against `tests/*.test.ts`.
- the extension is intended to be loaded dynamically with:

```bash
pi -e ./src/index.ts
```

## File-specific guidance

### `src/`

- keep implementation in TypeScript only
- preserve the separation between:
  - schema/types
  - state logic
  - UI component logic
  - tool registration
- avoid introducing unnecessary framework abstractions
- prefer small pure helper functions where possible

### `tests/`

- add or update tests when changing state behavior
- prefer focused tests for:
  - question normalization
  - selection behavior
  - tab movement
  - custom answer submission
  - result summarization
  - cancellation behavior

### docs

Keep docs practical and synced with the implementation.

- `README.md`: how to install, run, test, and use the tool
- `SPEC.md`: intended design and UX contract
- `RESEARCH.md`: harness comparison notes
- `FINDINGS.md`: synthesized conclusions from source research

## Coding expectations

- follow Biome/Ultracite formatting and lint expectations
- prefer explicit, readable code over clever code
- use descriptive names
- use early returns to keep control flow simple
- avoid dead code and generic boilerplate comments
- do not add React/JSX-specific patterns unless the repo actually starts using them

## What to avoid

- do not add unrelated framework guidance or dependencies
- do not add browser/web UI unless the task explicitly requires it
- do not hardcode machine-specific paths
- do not weaken type safety just to silence errors
- do not commit editor-specific files unless they are clearly project-useful

## When changing behavior

If you change the ask flow in a meaningful way, update the relevant docs in the same change:

- user-facing usage changes -> `README.md`
- architecture/contract changes -> `SPEC.md`
- comparative harness findings -> `RESEARCH.md` / `FINDINGS.md`

## Preferred workflow for agents

1. read the relevant docs first
2. inspect the existing implementation before refactoring
3. make the smallest coherent change
4. run:
   - `pnpm format`
   - `pnpm typecheck`
   - `pnpm test`
5. update docs if behavior or expectations changed
