#!/usr/bin/env node
/**
 * fortune-data.js（難読化済み）から base64 を抜き出し、
 * fortune-data.plain.json に平文化して出力する。
 * 難読化ファイルしか手元にない場合の復元用。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OBF = path.join(ROOT, 'fortune-data.js');
const OUT = path.join(ROOT, 'fortune-data.plain.json');

function main() {
  const src = fs.readFileSync(OBF, 'utf8');
  const m = src.match(/atob\("([^"]+)"\)/);
  if (!m) {
    console.error('Could not find base64 payload in fortune-data.js');
    process.exit(1);
  }
  const b64 = m[1];
  const json = Buffer.from(b64, 'base64').toString('utf8');
  const data = JSON.parse(json);
  fs.writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8');
  console.log('Written:', OUT);
  console.log('  quotes:', data.quotes.length);
  console.log('  destructionLaws:', data.destructionLaws.length);
}

main();
