#!/usr/bin/env node
/**
 * animal-data.js（難読化済み）から平文の animal-data.plain.json を復元する。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OBF = path.join(ROOT, 'animal-data.js');
const OUT = path.join(ROOT, 'animal-data.plain.json');

function main() {
  const src = fs.readFileSync(OBF, 'utf8');
  const m = src.match(/atob\("([^"]+)"\)/);
  if (!m) {
    console.error('Could not find base64 payload in animal-data.js');
    process.exit(1);
  }
  const json = Buffer.from(m[1], 'base64').toString('utf8');
  const data = JSON.parse(json);
  fs.writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8');
  console.log('Written:', OUT);
  console.log('  animalTiers:', data.animalTiers.length);
}

main();
