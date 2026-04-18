# pi-ask

`pi-ask` is a **pi.dev extension** that adds an interactive `ask_user` clarification tool.

It lets an agent pause, ask structured questions in a terminal UI, and continue with normalized answers instead of guessing.

## Project layout

- `src/` — TypeScript extension implementation
- `tests/` — behavior-focused tests
- `docs/` — small docs set for contract and architecture

## Getting started

### Requirements

- Node.js `22.19.0`
- pnpm `10.33.0`

The repo also includes `.nvmrc` and `.node-version` pinned to the same Node.js version.

### Load the extension in pi

Run pi with the extension entrypoint:

```bash
pi -e ./src/index.ts
```

Load it dynamically with the `-e` flag.

### Install dependencies

```bash
pnpm install
```

### Run tests

```bash
pnpm test
```

### Commit workflow

This repo uses `lefthook` together with Commitizen and conventional commitlint.

Recommended flow:

```bash
pnpm commit
```

That opens the Commitizen prompt using `cz-conventional-changelog`.
The git hooks also validate commit messages through `commitlint`.

### Biome / typecheck

```bash
pnpm format
pnpm lint
pnpm check
pnpm typecheck
```

### Zed

This repo includes project-local Zed settings at:

- `.zed/settings.json`

They are set up to:

- format TypeScript, JSON, and JSONC files with `pnpm exec biome format --stdin-file-path {buffer_path}`
- format on save
- keep newline / trailing whitespace behavior aligned with the repo settings

Note: some Zed settings such as global extension auto-install and autosave are not valid in project-local `.zed/settings.json`, so they are intentionally not included here.

## Tool

The extension registers one tool: `ask_user`.

Use it when the agent needs structured clarification before proceeding.
Use `type: "preview"` when an option needs a dedicated preview pane.

### Input shape

`ask_user` accepts:

```ts
{
  title?: string,
  questions: [
    {
      id: string,
      label?: string,
      prompt: string,
      type?: "single" | "multi" | "preview",
      required?: boolean, // metadata only; submit is never blocked
      options: [
        {
          value: string,
          label: string,
          description?: string,
          preview?: string
        }
      ]
    }
  ]
}
```

### Example tool call payload

```json
{
  "title": "Implementation preferences",
  "questions": [
    {
      "id": "style",
      "label": "Style",
      "prompt": "How should I frame the next prompt?",
      "type": "single",
      "options": [
        {
          "value": "minimal",
          "label": "Minimal",
          "description": "A short, direct question with few options."
        },
        {
          "value": "balanced",
          "label": "Balanced",
          "description": "A standard prompt with a bit more context."
        },
        {
          "value": "rich",
          "label": "Rich",
          "description": "A more descriptive prompt with extra detail."
        }
      ]
    },
    {
      "id": "frameworks",
      "label": "Frontend",
      "prompt": "Which frontend frameworks have you used?",
      "type": "multi",
      "options": [
        { "value": "react", "label": "React", "description": "Most popular UI library" },
        { "value": "vue", "label": "Vue", "description": "Progressive framework for building UIs" },
        { "value": "svelte", "label": "Svelte", "description": "Compiler-based approach" }
      ]
    }
  ]
}
```

## Features

`ask_user` currently supports:

- tabbed multi-question flow
- single-select questions
- multi-select questions
- preview questions with a dedicated preview pane
- free-form answers via an inline `Type your own` option that turns into an embedded editor when selected
- per-question notes via `Ctrl+N`
- per-option notes via `N`
- full inline rendering of saved notes
- number-key quick selection
- final submit/review page
- transcript rendering for call/result rows

### Result shape notes

The returned `details.answers[questionId]` object may include:

```ts
{
  values: string[]
  labels: string[]
  indices: number[]
  customText?: string
  note?: string // question-level note
  optionNotes?: Record<string, string> // selected options only
}
```

Behavior:

- question-level notes are submitted whenever authored
- option notes can be authored for any active option during the UI flow
- only notes for currently selected options are included in the submitted result
- deselecting an option keeps its note in UI state, so re-selecting it restores the note
- empty note text clears the note
- when the free-form option is selected, it becomes an inline input row with the selected-tab background style spanning the full width
- while editing a note or free-form answer, `Up` / `Down` save the draft and move navigation instead of being trapped by the editor
- `Space` toggles the active option on single-select questions too, but does not auto-advance

## Example agent instruction

You can give the agent an instruction like this to encourage proper `ask_user` usage:

```text
When requirements are ambiguous or user preferences materially affect implementation,
call `ask_user` instead of guessing.

Ask 1-3 concise questions.
Use short tab labels.
Prefer 2-4 options per question.
Include descriptions for each option.
Use `type: "single"` unless multiple options can genuinely apply.
Use `type: "multi"` only when the user may need to select several answers.
Use `type: "preview"` when an option needs a preview panel.
After answers are returned, continue the task using those answers explicitly.
```

### Example request to the agent

```text
Before implementing, clarify my preferences with `ask_user` if needed.
For example, ask about framework choice, styling approach, and testing strictness.
Do not guess if those choices would change the implementation.
```

## Documentation

Docs stay intentionally small:

- `docs/README.md` — index
- `docs/contract.md` — external behavior
- `docs/architecture.md` — module boundaries and invariants

Implementation detail should stay in the code and tests.

## Status

Implemented in TypeScript with behavior-focused test coverage.
