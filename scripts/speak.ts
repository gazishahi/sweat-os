// `npm run speak -- "text"` — speak an interviewer line aloud via macOS `say`.
// Used only in voice interview mode. Claude passes CLEAN spoken prose (no code, no
// markdown) — the interview protocol keeps code and long text on screen, out of the audio.
//
// Config (optional env vars):
//   SWEAT_VOICE       macOS voice name, e.g. "Daniel", "Samantha" (see `say -v '?'`)
//   SWEAT_VOICE_RATE  words per minute, e.g. "180" (default is the system rate)
//
// Non-fatal if `say` is unavailable (e.g., not macOS): it prints the line and exits 0, so
// a voice session degrades cleanly to text instead of erroring.

import { spawnSync } from "node:child_process";

const text = process.argv.slice(2).join(" ").trim();
if (!text) {
  console.error('usage: npm run speak -- "text"');
  process.exit(2);
}

const hasSay = spawnSync("which", ["say"], { stdio: "ignore" }).status === 0;
if (!hasSay) {
  console.log("🔇 speak: `say` not available (macOS only) — skipping TTS. Line was:");
  console.log("   " + text);
  process.exit(0);
}

const args: string[] = [];
if (process.env.SWEAT_VOICE) args.push("-v", process.env.SWEAT_VOICE);
if (process.env.SWEAT_VOICE_RATE) args.push("-r", process.env.SWEAT_VOICE_RATE);
args.push(text);

const res = spawnSync("say", args, { stdio: "inherit" });
process.exit(res.status ?? 0);
