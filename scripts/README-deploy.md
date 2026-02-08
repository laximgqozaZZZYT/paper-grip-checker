# 本番デプロイ（平文JSONを上げない）

平文の `fortune-data.plain.json` と `animal-data.plain.json` は本番に含めず、難読化した JS だけを配布する手順です。

## 本番に含めないファイル（デプロイ対象外）

本番環境は **Cloudflare Pages** を想定しています。アップロードするのは **dist/ 内のファイル一式**です。以下は **一切デプロイされません**。

| 対象 | 理由 |
|------|------|
| `fortune-data.plain.json` | 平文のため本番に載せない |
| `animal-data.plain.json` | 同上 |
| `scripts/` 一式 | ビルド・編集用。dist にコピーされない |
| `.gitignore` 等 | 配布物に不要 |

**dist/ にコピーされるのは** `index.html`・`fortune.html`・`fortune-data.js`・`animal-data.js` の4つ（build.js の `DEPLOY_FILES` で固定）。加えて **robots.txt** と **sitemap.xml** がビルド時に生成され、SEO用に dist に出力される。

## 1. ビルドの実行

```bash
node scripts/build.js
```

このスクリプトは次のことをします。

- 平文 JSON から **fortune-data.js** と **animal-data.js** を再生成（難読化）
- **dist/** に次の4ファイルだけをコピーする  
  - `index.html`  
  - `fortune.html`  
  - `fortune-data.js`  
  - `animal-data.js`  

平文 JSON や `scripts/` は **dist に含まれません**。

## 2. デプロイ方法（Cloudflare Pages）

本番は **Cloudflare Pages** でホスティングします。Git リポジトリを接続した場合の設定例です。

| 設定項目 | 値 |
|----------|-----|
| **Build command** | `node scripts/build.js` |
| **Build output directory** | `dist` |
| **Root directory** | （空のまま） |
| **Node.js version** | 18 推奨（`.nvmrc` あり） |

- リポジトリに push すると Cloudflare がビルドし、`dist` の内容を配信します。
- 平文 JSON はビルド結果に含まれないため、本番には出ません。

### 環境変数（任意）

- **BASE_URL** … 本番の絶対URL（例: `https://your-project.pages.dev`）。指定すると `sitemap.xml` と `robots.txt` の URL が絶対パスになります。Cloudflare Pages の「設定 → 環境変数」で追加できます。

### 手動アップロードする場合

- **dist/** の中身だけを Cloudflare Pages の「Direct Upload」や他の CDN にアップロードする運用も可能です。

## 3. オプション: 絶対URL（sitemap / robots.txt）

本番のドメインが決まっている場合、ビルド時に `BASE_URL` を指定すると sitemap.xml と robots.txt の URL が絶対パスになります。

```bash
BASE_URL=https://yoursite.pages.dev node scripts/build.js
```

（Cloudflare Pages の「設定 → 環境変数」で `BASE_URL` に本番URLを設定すると、sitemap が正しく参照されます。）

## 4. 注意

- `dist/` は `.gitignore` に入っているため、通常はリポジトリにはコミットしません。
- 本番に上げるのは **dist 内のファイル一式**（HTML・JS・robots.txt・sitemap.xml）です。平文 JSON は dist に含まれません。
