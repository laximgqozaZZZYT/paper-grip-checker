#!/usr/bin/env node
/**
 * 本番用の出力ディレクトリ dist/ を作成する。
 * - 難読化済みの fortune-data.js / animal-data.js を生成
 * - index.html と上記2ファイルのみを dist/ にコピー
 * 平文JSON（fortune-data.plain.json, animal-data.plain.json）は dist に含めない。
 *
 * デプロイ設定例（Cloudflare Pages 等）:
 *   Build command: node scripts/build.js
 *   Build output directory: dist
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

const DEPLOY_FILES = ['index.html', 'fortune.html', 'fortune-data.js', 'animal-data.js'];

function main() {
  console.log('Building for production (plain JSON excluded)...\n');

  // 1) 平文から難読化JSを生成（上書き）
  console.log('1. Obfuscating fortune-data...');
  require('./obfuscate-fortune.js');
  console.log('2. Obfuscating animal-data...');
  require('./obfuscate-animal.js');

  // 2) dist を作成し、配布用ファイルのみコピー
  if (!fs.existsSync(DIST)) fs.mkdirSync(DIST, { recursive: true });

  console.log('3. Copying deployable files to dist/...');
  for (const name of DEPLOY_FILES) {
    const src = path.join(ROOT, name);
    const dest = path.join(DIST, name);
    if (!fs.existsSync(src)) {
      console.error('Missing:', name);
      process.exit(1);
    }
    fs.copyFileSync(src, dest);
    console.log('   ', name);
  }

  console.log('\nDone. Output: dist/');
  console.log('Deploy only the contents of dist/ (no plain JSON included).');
}

main();
