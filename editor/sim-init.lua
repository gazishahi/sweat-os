-- SWEAT OS — interview-simulation Neovim profile.
-- Launch a coding exercise in a BARE editor that mimics a CoderPad/whiteboard round:
-- syntax + basic editing, but NO LSP, NO autocompletion, NO AI, NO plugins.
--
--   nvim -u editor/sim-init.lua practice/<date>-<slug>/solution.ts
--
-- Because it's passed with `-u`, this file fully REPLACES your normal config for that
-- session, so your real setup is untouched and no language server ever attaches. The
-- point is to train solving under real interview conditions — no red squiggles catching
-- your type errors, no tab-completion writing the API for you.

-- Basic editability (this is a bare buffer, not a punishment).
vim.opt.number = true
vim.opt.expandtab = true
vim.opt.shiftwidth = 2
vim.opt.tabstop = 2
vim.opt.smartindent = true
vim.opt.wrap = false
vim.opt.termguicolors = true
vim.cmd("syntax on")
vim.cmd("filetype plugin indent on")

-- Kill built-in insert-mode completion popups so you don't lean on them.
vim.opt.complete = ""
vim.opt.completeopt = ""
vim.keymap.set("i", "<C-n>", "<Nop>")
vim.keymap.set("i", "<C-p>", "<Nop>")

-- Make the mode obvious so you never mistake this for your real editor.
vim.opt.laststatus = 2
vim.opt.statusline = "  INTERVIEW SIM — no LSP · no autocomplete · %f %m%=%l:%c "

vim.notify("SWEAT OS: interview-sim mode — no LSP, no autocomplete. Talk through your reasoning.")
