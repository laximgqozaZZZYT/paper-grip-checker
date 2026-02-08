#!/usr/bin/env node
/**
 * index.html を編集し、quotes と destructionLaws を外部ファイル参照に差し替える。
 * 実行前に extract-fortune.js と obfuscate-fortune.js で fortune-data.js を生成しておくこと。
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

function main() {
  let html = fs.readFileSync(INDEX, 'utf8');

  // 1) メイン script の直前に fortune-data.js を読み込む script を追加
  const mainScriptOpen = '  <script>\n';
  if (!html.includes('<script src="fortune-data.js"></script>')) {
    html = html.replace(mainScriptOpen, '  <script src="fortune-data.js"></script>\n  <script>\n');
  }

  // 2) const quotes = [ ... ]; を外部参照に置換
  const quotesMarker = '    const quotes = [';
  const qIdx = html.indexOf(quotesMarker);
  if (qIdx === -1) {
    console.log('quotes already patched or not found');
  } else {
    const arrStart = html.indexOf('[', qIdx);
    const arrEnd = findArrayEnd(html, arrStart);
    if (arrEnd === -1) throw new Error('quotes array end not found');
    const before = html.slice(0, qIdx);
    const after = html.slice(arrEnd + 2).replace(/^\n+/, '\n\n    ');
    html = before + '    const quotes = window.__FORTUNE_DATA__.quotes;\n' + after;
    console.log('Replaced quotes block');
  }

  // 3) const destructionLaws = [ ... ]; を外部参照に置換
  const lawsMarker = '    // 暗転後に表示する条文\n    const destructionLaws = [';
  const lIdx = html.indexOf(lawsMarker);
  if (lIdx === -1) {
    console.log('destructionLaws already patched or not found');
  } else {
    const arrStart = html.indexOf('[', lIdx);
    const arrEnd = findArrayEnd(html, arrStart);
    if (arrEnd === -1) throw new Error('destructionLaws array end not found');
    const before = html.slice(0, lIdx);
    const after = html.slice(arrEnd + 2).replace(/^\n+/, '\n\n    ');
    html = before + '    const destructionLaws = window.__FORTUNE_DATA__.destructionLaws;\n' + after;
    console.log('Replaced destructionLaws block');
  }

  fs.writeFileSync(INDEX, html, 'utf8');
  console.log('Updated:', INDEX);
}

main();
