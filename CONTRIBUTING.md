# Contributing to SWEAT OS

Thanks for being here. There are two very different ways to contribute, and both are
welcome:

1. **Improve the core framework** — the engines, scripts, decision logic, dashboard, or
   the existing (software-engineering) curriculum. PRs and issues welcome.
2. **Author a new learning path / fork it into a new domain** — DevOps/SRE, ML, security,
   data engineering, a language, whatever. The "brain" is domain-agnostic; a learning path
   is just data. See **[AUTHORING.md](./AUTHORING.md)** for the how-to.

## The mental model (why forking is easy)

The OS is split cleanly:

- **The framework** (domain-agnostic, in `modules/`, `scripts/`): the manager that decides
  your daily task, spaced repetition, mock-interview modes, reflection, the dashboard. You
  rarely touch these to make a new path.
- **The learning path** (data): the curriculum graph, knowledge nodes, skill matrix,
  interview rubrics. This is what you author to change *what* is taught.

Swap the data, keep the brain.

## Local setup

```bash
npm install
npm run setup     # bootstraps your local (git-ignored) progress from seed/
npm run validate  # schema + referential-integrity check — run before every PR
```

## Ground rules

- **Run `npm run validate` before opening a PR.** It enforces that the graph, knowledge
  nodes, skill matrix, and review queue all reference each other correctly. Green = your
  data is coherent.
- **Never commit personal progress.** Everything under `progress/`, `reflections/`,
  `backlog/`, `practice/`, etc. is git-ignored by design. Ship *starting* state via `seed/`,
  not live files.
- **Keep the scripts dependency-light** (Node + tsx + js-yaml + zod). Deterministic work
  (dates, aggregation) belongs in scripts, not in the model.
- **Match the house style** of the file you're editing (Markdown for content, YAML/JSON for
  data, TypeScript for scripts).
- Be kind. MIT-licensed — build on it freely.

## Sharing a fork / spinoff

Built a path for a new domain? We'd love to list it. Open a PR adding it to the
**Forks & spinoffs** section of the [README](./README.md), or open an issue with a link.
