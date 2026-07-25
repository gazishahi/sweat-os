-- SWEAT OS — drop-in lazy.nvim spec for the Claude Code ↔ Neovim integration.
--
-- This wires up coder/claudecode.nvim (https://github.com/coder/claudecode.nvim), a
-- pure-Lua plugin that implements the SAME WebSocket/MCP protocol as Anthropic's official
-- VS Code extension — so the Claude Code CLI auto-detects Neovim and gains file-open,
-- native in-buffer diffs, selection context, and LSP-diagnostics sharing. There is no
-- official Neovim integration; this is the established community one.
--
-- HOW TO USE without touching your existing config: import this file from your lazy setup
--   require("lazy").setup({ ..., { import = "…" }, })
-- or simply copy the table below into your own plugins list. Requirements: Neovim ≥ 0.8,
-- the Claude Code CLI on PATH, and folke/snacks.nvim (pulled in as a dependency).

return {
  "coder/claudecode.nvim",
  dependencies = { "folke/snacks.nvim" },
  config = true, -- auto-configures; require("claudecode").setup({...}) for options
  -- If you use a LOCAL claude install, uncomment:
  -- opts = { terminal_cmd = "~/.claude/local/claude" },
  cmd = {
    "ClaudeCode", "ClaudeCodeFocus", "ClaudeCodeSend", "ClaudeCodeAdd",
    "ClaudeCodeStatus", "ClaudeCodeDiffAccept", "ClaudeCodeDiffDeny",
  },
  keys = {
    { "<leader>ac", "<cmd>ClaudeCode<cr>", desc = "Claude: toggle" },
    { "<leader>af", "<cmd>ClaudeCodeFocus<cr>", desc = "Claude: focus" },
    { "<leader>as", "<cmd>ClaudeCodeSend<cr>", mode = "v", desc = "Claude: send selection" },
    { "<leader>aa", "<cmd>ClaudeCodeDiffAccept<cr>", desc = "Claude: accept diff" },
    { "<leader>ad", "<cmd>ClaudeCodeDiffDeny<cr>", desc = "Claude: deny diff" },
  },
}
