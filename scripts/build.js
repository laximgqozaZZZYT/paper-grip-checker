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

/** 本番の絶対URL（例: https://example.pages.dev）。未設定なら sitemap/robots は相対URLで出力 */
const BASE_URL = (process.env.BASE_URL || process.env.BUILD_BASE_URL || '').replace(/\/$/, '');

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

  // 4) SEO: robots.txt と sitemap.xml を出力
  console.log('4. Writing robots.txt and sitemap.xml...');
  const base = BASE_URL || '.';
  const robotsTxt = [
    'User-agent: *',
    'Allow: /',
    BASE_URL ? `Sitemap: ${BASE_URL}/sitemap.xml` : 'Sitemap: /sitemap.xml',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(DIST, 'robots.txt'), robotsTxt, 'utf8');
  console.log('   robots.txt');

  const now = new Date().toISOString().slice(0, 10);
  const sitemapUrls = [
    { loc: BASE_URL ? `${BASE_URL}/` : 'index.html', lastmod: now, priority: '1.0', changefreq: 'weekly' },
    { loc: BASE_URL ? `${BASE_URL}/fortune.html` : 'fortune.html', lastmod: now, priority: '0.8', changefreq: 'weekly' }
  ];
  const sitemapXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapUrls.map(u =>
      `  <url><loc>${escapeXml(u.loc)}</loc><lastmod>${u.lastmod}</lastmod><changefreq>${u.changefreq}</changefreq><priority>${u.priority}</priority></url>`
    ),
    '</urlset>'
  ].join('\n');
  fs.writeFileSync(path.join(DIST, 'sitemap.xml'), sitemapXml, 'utf8');
  console.log('   sitemap.xml');

  console.log('\nDone. Output: dist/');
  console.log('Deploy only the contents of dist/ (no plain JSON included).');
  if (!BASE_URL) {
    console.log('Tip: Set BASE_URL (e.g. https://yoursite.pages.dev) for absolute sitemap URLs.');
  }
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

main();
