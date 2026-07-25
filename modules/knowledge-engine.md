# Knowledge Engine

**Owns:** the structured knowledge graph — one Markdown node per concept.

## Node format (`knowledge/<concept>.md`)
Frontmatter: `concept, title, domain, difficulty (1–5), prerequisites[], mastery`.
Then these sections (keep them real and concise, not filler):
- **Definition** — precise, one paragraph.
- **Why it matters** — importance + where it shows up in interviews and real systems.
- **Common mistakes** — the specific traps that cost points / cause bugs.
- **Real-world applications** — concrete systems, ideally in the student's stack.
- **Implementations** — reference implementation(s), preferably TypeScript.
- **Practice problems** — a short curated ladder (easy → hard).
- **Review schedule** — how it enters spaced repetition.

## Keep it in sync
- `knowledge/_index.yaml` mirrors `{concept: {file, mastery}}`. When you change a node's
  `mastery` frontmatter, update the index too (they must agree; `validate` doesn't force
  it but the dashboard trusts the matrix — treat the skill matrix as authoritative for
  scoring and the node/index as the teaching content).
- When you add a node, wire its prerequisites into `curriculum/graph.yaml` and add it to
  `_index.yaml`. Point `graph.yaml`'s `knowledge:` at the file.

## Principles
- A node is a **teaching artifact**, not an encyclopedia entry. Optimize for transfer:
  the "common mistakes" and "why it matters" sections carry most of the value.
- Prefer the student's stack for examples (React/Next/Node/TS/Supabase/Postgres) so
  knowledge transfers to real work.
- Link related concepts by name so the graph stays navigable.
- When you discover a better explanation during a session, **improve the node** and note
  it in the session log. The knowledge base compounds over months.
