# SWEAT OS — Neovim setup

You code exercises in **real files in Neovim**, never in the chat box. The scaffolder
(`npm run exercise -- <slug>`) creates `practice/<date>-<slug>/` with a solution stub, a
runnable test harness, and a README; you edit `solution.ts` and run the tests. Claude
reads and runs those same files to review and interview you on them.

There are two ways to run it. Pick one.

---

## Topology A — Plugin (recommended): `coder/claudecode.nvim`

The [`coder/claudecode.nvim`](https://github.com/coder/claudecode.nvim) plugin speaks the
**same WebSocket/MCP protocol as Anthropic's official VS Code extension** (there is no
official Neovim integration — this is the established community one). You live in Neovim;
Claude runs in a split and connects back to your editor.

**Install** (lazy.nvim): import or paste [`claudecode-lazy.lua`](./claudecode-lazy.lua)
into your plugins. Requirements: Neovim ≥ 0.8, the Claude Code CLI on PATH, and
`folke/snacks.nvim` (pulled in automatically).

**Flow:**
1. Open Neovim in the `training-os/` repo.
2. `:ClaudeCode` (or `<leader>ac`) — launches Claude in a terminal split; it auto-connects
   to Neovim's WebSocket server via the lock file in `~/.claude/ide/<port>.lock`. No `/ide`
   command needed. Check with `:ClaudeCodeStatus`.
3. Say hello — the kernel gives you today's assignment. When it's a coding task it runs
   `npm run exercise` and opens `solution.ts`.
4. Claude sees your **current file and selection in real time**; its edits appear as
   **native Neovim diffs** you accept with `<leader>aa` / `:w` or reject with `<leader>ad`.
   It can read your **LSP diagnostics** too — so in a code review it reasons about the same
   type errors you see.

Because that Claude split is a Neovim `:terminal`, `$NVIM` is set, so the scaffolder can
open new exercise files straight into your editor with no extra config.

---

## Topology B — Plain tmux (no plugin, pure file-based)

If you'd rather not add a plugin, run two panes:

```
tmux new -s sweat
# pane 1 — your editor, listening on a known socket:
nvim --listen /tmp/sweat.nvim
# pane 2 (Ctrl-b "):
claude            # Claude Code, in the training-os/ repo
```

Tell the scaffolder where your editor is so it can open files into it:

```
export SWEAT_NVIM_SOCKET=/tmp/sweat.nvim
```

Now `npm run exercise -- <slug>` opens `solution.ts` in your running Neovim via
`nvim --server … --remote`. Everything else is file-based: you edit, Claude reads/runs.

---

## The two coding modes

The Practice and Interview engines choose a mode per task (see
`modules/practice-engine.md`, `modules/interview-engine.md`); the scaffolder tags it.

| Mode | When | Editor |
|---|---|---|
| **work** (default) | building real skill — implement, refactor, debug, navigate a repo | your normal Neovim, full LSP + format-on-save |
| **sim** | LeetCode/CoderPad interview reps | `nvim -u editor/sim-init.lua <file>` — a **bare** buffer, no LSP, no autocomplete, to mimic real interview conditions |

`sim-init.lua` is launched with `-u`, so it fully replaces your config for that session
only — your real setup is never modified, and no language server attaches. Train without
the tool catching your mistakes for you.

---

## Voice interviews (talk it out loud)

Any mock interview can run as **voice**, so you think aloud and the interviewer responds
aloud — like a real remote round. It's half-duplex (you take turns), which is how coding
interviews actually feel.

- **Your voice → text:** [superwhisper](https://superwhisper.com) dictates your speech
  straight into the Claude Code prompt. Use push-to-talk: hold your superwhisper hotkey,
  talk through your reasoning, release, and it drops the transcript into the prompt.
- **Interviewer → your ears:** Claude speaks its lines with `npm run speak -- "…"`
  (macOS `say`). It voices only the conversation — questions, nudges, feedback — and keeps
  code and long text on screen, silent.

**Start one:** in a session, say *"let's do this as a voice interview."* Claude switches to
voice cadence (one question at a time, waits for you) and speaks its lines.

**Pick a voice (optional):** list installed voices with `say -v '?'`, then set env vars
before launching Claude Code — e.g. a British interviewer at a slightly measured pace:

```
export SWEAT_VOICE="Daniel"
export SWEAT_VOICE_RATE=180
```

Nothing else changes: coding still happens in your Neovim buffer, and the interview is
logged and scored exactly like a text one.

## Running exercises

```
npm run exercise -- two-sum --title "Two Sum"      # scaffold (work mode)
npm run exercise -- lru-cache --mode sim           # scaffold for an interview sim
npm run test:exercise -- practice/<dir>/solution.test.ts   # run the harness (red→green)
```

The harness uses Node's built-in test runner via `tsx` — no extra dependencies.
