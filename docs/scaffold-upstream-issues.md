# Scaffold — upstream code-quality issues

**For:** an agent working in `victusfate/scaffold`.
**Found by:** a lint + rubric audit run in a downstream consumer (`victusfate/agent-demos`) against the scaffold's own
`scripts/check-quality-mechanical.sh` and `lib/code-quality-rubric.md`.
**Scaffold revision audited:** `a1ce3d908933443c13f8417b1233945ca1efd915`.

Every issue below lives in a **scaffold-synced file** (listed in `.github/scaffold-files.txt`), so the durable fix
belongs upstream — once fixed here, `sync-scaffold` propagates it to all consumers. Local consumer patches to these
files only produce `*.scaffold-new` sidecars on the next sync, so please don't expect consumers to fix them.

Paths and line numbers are as of the audited revision; re-verify before editing.

---

## Summary checklist

| # | Severity | File | Issue |
|---|----------|------|-------|
| 1 | Quality / **major** | `scripts/update-skills-doc.ts` | Re-implements the canonical RESOLVER parser instead of importing it |
| 2 | Quality / **major** | `tools/linter-setup/deps.ts` | `mergeDevDependencies` and `mergeScripts` are ~80% duplicated |
| 3 | Clarity / minor (doc correctness) | `tools/hoist-skill/hoist.ts` | Comments claim a Node ≥23.6 floor; `engines` pins `>=22.18.0` |
| 4 | Clarity / minor | `tools/hoist-skill/hoist.ts` | Back-compat comment names `.mjs` files that are now `.ts` |
| 5 | Readability / minor | `tools/linter-setup/{detect,emit,deps}.ts` | Bare `'fs'`/`'path'` imports; rest of repo uses the `node:` prefix |
| 6 | Clarity / minor | `tools/linter-setup/registry.ts` | Comment says "see detect.mjs" (now `detect.ts`) |
| 7 | Readability / minor | `scripts/check-resolvable.ts` | Stray `import` mid-file, away from the import block |
| 8 | Readability / minor | `tools/hoist-skill/emitters.ts` | Internal emit functions take 6 positional params (>4) |
| 9 | Maintainability / minor | `scripts/resolver-phases.ts` + `tools/lib/safe-write.ts` | `.scaffold-keep` glob matcher implemented twice |
| 10 | Tooling / minor | `tools/sync/removed-files.tsv` | Flags `tools/sync/*.mjs → .ts` for consumers that don't sync those files — false-positive stale warning every sync |

Items 1–2 are the only structurally meaningful ones; the rest are polish. Nothing here is a correctness bug in
shipped behavior (item 3 is a wrong *comment*, not wrong code).

---

## 1. Duplicated RESOLVER parser — `scripts/update-skills-doc.ts` (Quality/major)

`tools/lib/resolver-parse.ts` is the canonical RESOLVER.md parser and is already imported by
`scripts/check-resolvable.ts` and `tools/hoist-skill/hoist.ts`. But `update-skills-doc.ts` re-implements the same
logic a second time:

- `splitRow` (lines ~26–38) is a near-identical copy of `resolver-parse.ts:splitRow`.
- `parseResolver` (lines ~40–54) duplicates `resolver-parse.ts:parseResolverRows`.
- `parseBundled` (lines ~58–71) duplicates the table-walk in `resolver-parse.ts:parseBundledSkills`.

This is the "RESOLVER parser implemented 3×" hazard — three copies drift independently.

**Proposed fix — import the canonical parser.** One API gap blocks a clean swap: `parseBundledSkills` returns only
slugs (`string[]`), but `update-skills-doc` needs the bundled **purpose** column too. So widen the canonical helper
(or add a sibling) to return purpose, then delete the local copies:

```ts
// tools/lib/resolver-parse.ts — widen bundled parsing to carry purpose
export interface BundledRow { skill: string; purpose: string; }
export function parseBundledRows(resolverPath: string): BundledRow[] { /* same walk, capture cells[2] */ }
// keep parseBundledSkills as a thin map for existing callers, or migrate them.
```

```ts
// scripts/update-skills-doc.ts — delete local splitRow/parseResolver/parseBundled, then:
import { parseResolverRows, parseBundledRows } from '../tools/lib/resolver-parse.ts';

const rows    = parseResolverRows(RESOLVER).map(r => ({ skill: r.name, purpose: r.purpose }));
const bundled = parseBundledRows(RESOLVER);
```

Check the other `parseBundledSkills` callers (`check-resolvable.ts`) when you change its shape.

---

## 2. Duplicated package.json merge logic — `tools/linter-setup/deps.ts` (Quality/major)

`mergeDevDependencies` (lines ~38–71) and `mergeScripts` (lines ~77–105) share ~80% of their body: load
`package.json`, `JSON.parse` in a try/catch, skip already-present keys, write back preserving indent and trailing
newline. The only real differences are the registry section read and the "already present" set (devDeps also checks
`dependencies`). Even the status-doc comment is duplicated.

**Proposed fix — extract one parameterized merge:**

```ts
type Section = 'devDependencies' | 'scripts';

function mergeInto(targetRepo: string, section: Section, entries: Record<string, string>): MergeResult {
  if (!entries || Object.keys(entries).length === 0) return { added: [], status: 'none' };
  const pkgPath = join(targetRepo, 'package.json');
  if (!existsSync(pkgPath)) return { added: [], status: 'no-package-json' };
  const raw = readFileSync(pkgPath, 'utf8');
  let pkg: PackageJson;
  try { pkg = JSON.parse(raw) as PackageJson; } catch { return { added: [], status: 'unparsable' }; }

  const present = section === 'devDependencies'
    ? new Set([...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})])
    : new Set(Object.keys(pkg.scripts ?? {}));

  const target = pkg[section] ?? {};
  const added: string[] = [];
  for (const [name, val] of Object.entries(entries)) {
    if (present.has(name)) continue;
    target[name] = val; added.push(name);
  }
  if (!added.length) return { added: [], status: 'satisfied' };

  pkg[section] = target;
  writeFileSync(pkgPath, JSON.stringify(pkg, null, detectIndent(raw)) + (raw.endsWith('\n') ? '\n' : ''));
  return { added, status: 'written' };
}

export const mergeDevDependencies = (r: string, l: Language) =>
  mergeInto(r, 'devDependencies', registry[l]?.devDependencies ?? {});
export const mergeScripts = (r: string, l: Language) =>
  mergeInto(r, 'scripts', registry[l]?.scripts ?? {});
```

`tools/linter-setup/emit.ts` calls both and is unaffected (same exported signatures).

---

## 3. Wrong Node-version floor in comments — `tools/hoist-skill/hoist.ts` (Clarity/minor, doc correctness)

Lines ~2 and ~218–219 state the module "is importable on Node ≥23.6" / "only loads on Node ≥23.6". But
`package.json` pins `engines.node` to `>=22.18.0`, and native TypeScript type-stripping is enabled by default on
Node 22.18 LTS (backported from 23.6). So the code in fact runs on 22.18+, and the comment understates the supported
range.

**Proposed fix:** change the comments to `Node ≥22.18` (treat `package.json` `engines` as the single source of
truth, and update both comments + the one in `hoist.ts:218-219` together). Please verify the exact floor against the
scaffold's intended baseline before committing.

---

## 4. Stale `.mjs` filenames in back-compat comment — `tools/hoist-skill/hoist.ts` (Clarity/minor)

The re-export comment around lines ~60–64 explains why `readManifest` is re-exported and refers to `manifest.mjs`
and "the new hoist.mjs". Both files are now `.ts`. Update the names so the comment matches the tree. (The re-export
itself is still correct — only the prose is stale.)

---

## 5. `node:` import-prefix inconsistency — `tools/linter-setup/{detect,emit,deps}.ts` (Readability/minor)

These three use bare specifiers:

```ts
import { execSync } from 'child_process';   // detect.ts
import { existsSync, readFileSync } from 'fs';
import { join, extname, dirname } from 'path';
```

Every other source file in the repo — including their own sibling `tools/linter-setup/hash.ts` — uses the `node:`
prefix (`node:fs`, `node:path`, `node:crypto`, …). **Proposed fix:** add `node:` to the bare specifiers in
`detect.ts`, `emit.ts`, and `deps.ts` for consistency.

---

## 6. `detect.mjs` comment drift — `tools/linter-setup/registry.ts` (Clarity/minor)

The `ts` registry entry's comment (line ~40) says `(see detect.mjs)`. The file is `detect.ts`. Update the reference.

---

## 7. Mid-file import — `scripts/check-resolvable.ts` (Readability/minor)

A lone `import { readFileSync } from 'node:fs';` sits at ~line 39, after executable statements (`fail`/`warn`/`rel`
are defined just above it), separated from the import block at lines ~8–18. **Proposed fix:** fold `readFileSync`
into the top `node:fs` import and delete the mid-file line.

---

## 8. >4-parameter emit functions — `tools/hoist-skill/emitters.ts` (Readability/minor, optional)

`emitClaude` / `emitCursor` / `emitAntigravity` (and `writeBody`) each take 6 positional parameters
(`cap, dest, kept, results, srcRoot, force`), which the rubric flags as a parameter-discipline smell. Mitigating
factor: these are module-internal; `makeEmitters` already exposes a clean 4-arg `Emitter` interface to callers, and
the file has a deliberate "why not table-driven" comment. **Optional fix:** group `{ srcRoot, force }` (and possibly
`{ kept, results }`) into a context object, or add a `// quality-override: parameter-discipline — internal,
makeEmitters presents the public 4-arg form` pragma if you'd rather keep positional. Low priority.

---

## 9. `.scaffold-keep` glob matcher duplicated — `resolver-phases.ts` + `safe-write.ts` (minor)

`scripts/resolver-phases.ts:compileIgnore` and `tools/lib/safe-write.ts:loadKeep` implement the same matcher (exact
path / dir-prefix / `*` glob). `resolver-phases.ts` even carries a comment noting it "Mirrors the .scaffold-keep
matcher in tools/lib/safe-write.ts". It's small and acknowledged, but it's still two implementations that can drift.
**Optional fix:** export the pattern→matcher compiler from `safe-write.ts` (or a shared `lib/`) and have
`resolver-phases.ts` import it. Low priority.

---

## 10. `removed-files.tsv` false-positive for consumers — `tools/sync/removed-files.tsv` (tooling/minor)

The stale-path sweep in `bin/sync-from-scaffold.sh` reads `tools/sync/removed-files.tsv` and, on **every** consumer
sync, flags:

```
tools/sync/policy.mjs   →  tools/sync/policy.ts
tools/sync/promote.mjs  →  tools/sync/promote.ts
tools/sync/run.mjs      →  tools/sync/run.ts
```

But `tools/sync/*` is **not** in `.github/scaffold-files.txt`, so consumers maintain their own copies and never
receive the `.ts` replacements through sync. The result is a stale warning the consumer can't clear except by
migrating its own glue by hand — noise that recurs on every sync.

**Options to consider upstream:**
- Drop the `tools/sync/*.mjs → .ts` rows from `removed-files.tsv` (these paths aren't shipped, so they shouldn't be
  swept in consumers), **or**
- Scope the sweep to only paths that appear (or once appeared) in the manifest, **or**
- Add the `.ts` versions to the manifest if consumers are actually meant to receive them.

Whichever you pick, the goal is: a consumer that's fully synced should see a clean "Nothing to update" rather than a
permanent stale list it has no synced path to resolve.

---

## Notes

- Items 1, 2, 3 are the highest value. 1 and 2 remove real duplication; 3 corrects a misleading runtime claim.
- Consumer-local issues (not your problem): a couple of magic-number lint flags in the consumer's own
  `tools/sync/*.mjs` glue, which are out of scope here because those files aren't scaffold-synced.
- The audited consumer is otherwise clean — `resolver-phases.ts`, `safe-write.ts`, `compute-bump.ts`,
  `resolver-parse.ts`, and `hash.ts` scored 10/10 on all four rubric dimensions and are good reference points for the
  fixes above (e.g. `hash.ts` for `node:` usage + named constants; `resolver-utils.ts` for self-documenting string
  slicing).
