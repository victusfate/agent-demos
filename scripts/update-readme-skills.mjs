#!/usr/bin/env node
// update-readme-skills.mjs — regenerate the README.md skills invocation list from RESOLVER.md.
//
//   node scripts/update-readme-skills.mjs          # update README.md in place
//   node scripts/update-readme-skills.mjs --check  # exit 1 if the list is stale (used by package.json test)

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RESOLVER = join(ROOT, '.claude', 'skills', 'RESOLVER.md');
const README = join(ROOT, 'README.md');

const CHECK = process.argv.includes('--check');

// ---------------------------------------------------------------- parse RESOLVER

function splitRow(row) {
  const cells = [];
  let current = '';
  let inBacktick = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '`') { inBacktick = !inBacktick; current += ch; }
    else if (ch === '|' && !inBacktick) { cells.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  if (current.trim()) cells.push(current.trim());
  return cells.filter((c, i, arr) => !(i === 0 && c === '') && !(i === arr.length - 1 && c === ''));
}

function parseResolver() {
  const lines = readFileSync(RESOLVER, 'utf8').split('\n');
  const skills = [];
  let inTable = false;
  for (const line of lines) {
    const isRow = /^\s*\|.*\|\s*$/.test(line);
    if (!isRow) { if (inTable && line.trim() !== '') break; continue; }
    const cells = splitRow(line);
    if (cells[0] === 'Skill') { inTable = true; continue; }
    if (/^-{2,}$/.test(cells[0]?.replace(/[:\s]/g, ''))) continue;
    if (!inTable || cells.length < 4) continue;
    skills.push(cells[0].replace(/`/g, ''));
  }
  return skills;
}

// ---------------------------------------------------------------- generate + replace

function generateInvocation(skills) {
  const list = skills.map(s => `\`/${s}\``).join(', ');
  return `Skills can also be invoked individually: ${list}.`;
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceBetween(content, beginTag, endTag, replacement) {
  const begin = `<!-- ${beginTag} -->`;
  const end   = `<!-- ${endTag} -->`;
  const re = new RegExp(`${escapeRe(begin)}[\\s\\S]*?${escapeRe(end)}`, 'm');
  if (!re.test(content)) throw new Error(`Markers not found: ${begin} … ${end}`);
  return content.replace(re, `${begin}\n${replacement}\n${end}`);
}

// ---------------------------------------------------------------- main

if (!existsSync(RESOLVER)) { console.error(`RESOLVER.md not found at ${RESOLVER}`); process.exit(1); }
if (!existsSync(README))   { console.error(`README.md not found at ${README}`);   process.exit(1); }

const skills = parseResolver();
if (skills.length === 0) { console.error('No skill rows found in RESOLVER.md'); process.exit(1); }

const original = readFileSync(README, 'utf8');
const updated = replaceBetween(original, 'BEGIN_SKILLS_INVOCATION', 'END_SKILLS_INVOCATION', generateInvocation(skills));

if (original === updated) {
  console.log(`✓ README.md skills invocation list is up to date — ${skills.length} skills.`);
  process.exit(0);
}

if (CHECK) {
  console.error('✗ README.md skills invocation list is stale — run: node scripts/update-readme-skills.mjs');
  process.exit(1);
}

writeFileSync(README, updated, 'utf8');
console.log(`✓ README.md updated — ${skills.length} skills written.`);
