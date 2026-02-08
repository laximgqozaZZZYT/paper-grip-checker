#!/usr/bin/env node
/**
 * index.html から quotes と destructionLaws を抽出し、
 * fortune-data.plain.json に出力する。
 * 更新作業はこの JSON を編集した上で obfuscate-fortune.js を実行する。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');
const OUT = path.join(ROOT, 'fortune-data.plain.json');

function findArrayEnd(src, startIndex) {
  let i = startIndex;
  let depth = 0;
  const len = src.length;
  while (i < len) {
    const c = src[i];
    if (c === "'") {
      i++;
      while (i < len) {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === "'") { i++; break; }
        i++;
      }
      continue;
    }
    if (c === '"') {
      i++;
      while (i < len) {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === '"') { i++; break; }
        i++;
      }
      continue;
    }
    if (c === '/' && src[i + 1] === '/') {
      i += 2;
      while (i < len && src[i] !== '\n') i++;
      continue;
    }
    if (c === '/' && src[i + 1] === '*') {
      i += 2;
      while (i < len - 1 && !(src[i] === '*' && src[i + 1] === '/')) i++;
      i += 2;
      continue;
    }
    if (c === '[') { depth++; i++; continue; }
    if (c === ']') {
      depth--;
      if (depth === 0) return i;
      i++;
      continue;
    }
    i++;
  }
  return -1;
}

function extractArray(src, name) {
  const marker = `const ${name} = [`;
  const idx = src.indexOf(marker);
  if (idx === -1) throw new Error(`"${marker}" not found`);
  const start = src.indexOf('[', idx);
  const end = findArrayEnd(src, start);
  if (end === -1) throw new Error(`Could not find end of ${name}`);
  const code = src.slice(start, end + 1);
  return new Function('return ' + code)();
}

function main() {
  const src = fs.readFileSync(INDEX, 'utf8');
  const quotes = extractArray(src, 'quotes');
  const destructionLaws = extractArray(src, 'destructionLaws');
  const data = { quotes, destructionLaws };
  fs.writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8');
  console.log('Written:', OUT);
  console.log('  quotes:', quotes.length);
  console.log('  destructionLaws:', destructionLaws.length);
}

main();
