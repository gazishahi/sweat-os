// `npm run assess -- <skill> <mastery 0-5> <readiness 0-5> [confidence 0-1]`
// The single deterministic path for recording a skill score change. It updates the
// skill matrix AND appends an event to skill-history.yaml, so plateau detection has
// reliable data instead of depending on the model remembering to log. The Reflection
// Engine calls this instead of hand-editing the matrix.

import {
  PATHS,
  readYaml,
  writeYaml,
  today,
  SkillMatrixSchema,
  SkillHistorySchema,
  type SkillMatrix,
  type SkillHistory,
} from "./lib.ts";

const [, , skill, masteryArg, readinessArg, confidenceArg] = process.argv;

const mastery = Number(masteryArg);
const readiness = Number(readinessArg);
const confidence = confidenceArg === undefined ? undefined : Number(confidenceArg);

function bail(msg: string): never {
  console.error(msg);
  console.error("usage: npm run assess -- <skill> <mastery 0-5> <readiness 0-5> [confidence 0-1]");
  process.exit(2);
}

if (!skill) bail("missing skill");
if (!Number.isInteger(mastery) || mastery < 0 || mastery > 5) bail(`bad mastery: ${masteryArg}`);
if (!Number.isInteger(readiness) || readiness < 0 || readiness > 5) bail(`bad readiness: ${readinessArg}`);
if (confidence !== undefined && (confidence < 0 || confidence > 1)) bail(`bad confidence: ${confidenceArg}`);

const matrix = SkillMatrixSchema.parse(readYaml<SkillMatrix>(PATHS.skillMatrix));

let found: { domain: string } | null = null;
for (const [domain, d] of Object.entries(matrix.domains)) {
  const s = d.skills[skill];
  if (s) {
    const prev = s.mastery;
    s.mastery = mastery;
    s.interview_readiness = readiness;
    if (confidence !== undefined) s.confidence = confidence;
    found = { domain };
    console.log(`📊 assess: ${skill} mastery ${prev}→${mastery}, readiness →${readiness} (${domain})`);
    break;
  }
}
if (!found) bail(`unknown skill "${skill}" — add it to the skill matrix first`);

writeYaml(PATHS.skillMatrix, matrix);

const history = SkillHistorySchema.parse(readYaml<SkillHistory>(PATHS.skillHistory));
history.events.push({ date: today(), skill, mastery, interview_readiness: readiness });
writeYaml(PATHS.skillHistory, history);

console.log(`   logged to skill-history (${history.events.length} events total).`);
