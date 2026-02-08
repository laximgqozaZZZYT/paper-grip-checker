#!/usr/bin/env node
/**
 * index.html の animalTiers 配列を外部ファイル参照に差し替える。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');

function findArrayEnd(src, startIndex) {
  let i = startIndex;
  let depth = 0;
  const len = src.length;
  while (i < len) {
    const c = src[i];
    if (c === "'") { i++; while (i < len && (src[i] !== "'" || src[i - 1] === "\\")) i++; i++; continue; }
    if (c === '"') { i++; while (i < len && (src[i] !== '"' || src[i - 1] === "\\")) i++; continue; }
    if (src.substr(i, 2) === '//') { i += 2; while (i < len && src[i] !== '\n') i++; continue; }
    if (src.substr(i, 2) === '/*') { i += 2; while (i < len - 1 && src.substr(i, 2) !== '*/') i++; i += 2; continue; }
    if (c === '[') { depth++; i++; continue; }
    if (c === ']') { depth--; if (depth === 0) return i; i++; continue; }
    i++;
  }
  return -1;
}

function main() {
  let html = fs.readFileSync(INDEX, 'utf8');
  const marker = '    const animalTiers = [';
  const idx = html.indexOf(marker);
  if (idx === -1) {
    console.log('animalTiers already patched or not found');
    return;
  }
  const arrStart = html.indexOf('[', idx);
  const arrEnd = findArrayEnd(html, arrStart);
  if (arrEnd === -1) throw new Error('animalTiers array end not found');
  const before = html.slice(0, idx);
  const after = html.slice(arrEnd + 2).replace(/^\n+/, '\n\n    ');
  html = before + '    const animalTiers = window.__ANIMAL_DATA__.animalTiers;\n' + after;
  fs.writeFileSync(INDEX, html, 'utf8');
  console.log('Updated:', INDEX);
}

main();
