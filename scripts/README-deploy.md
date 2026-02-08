# 本番デプロイ（平文JSONを上げない）

平文の `fortune-data.plain.json` と `animal-data.plain.json` は本番に含めず、難読化した JS だけを配布する手順です。

## 1. ビルドの実行

```bash
node scripts/build.js
```

このスクリプトは次のことをします。

- 平文 JSON から **fortune-data.js** と **animal-data.js** を再生成（難読化）
- **dist/** に次の3ファイルだけをコピーする  
  - `index.html`  
  - `fortune-data.js`  
  - `animal-data.js`  

平文 JSON や `scripts/` は **dist に含まれません**。

## 2. デプロイ方法

### パターンA: dist の中身だけをアップロードする

- 手動でサーバーや CDN にアップロードする場合は、**dist/** フォルダの中身だけをアップロードする。
- ルートに `index.html`, `fortune-data.js`, `animal-data.js` が並ぶようにする。

### パターンB: Cloudflare Pages など「ビルドコマンド」がある場合

- **Build command:** `node scripts/build.js`  
  （Node が使える環境である必要があります。未インストールの場合は「ビルドなし」で、あらかじめローカルで作った dist の中身をルートとして push する運用でも可）
- **Build output directory:** `dist`
- リポジトリには平文 JSON が含まれていても、ビルド結果の `dist` にはコピーされないため、本番には平文は出ません。

## 3. 注意

- `dist/` は `.gitignore` に入っているため、通常はリポジトリにはコミットしません。
- 本番に上げるのは **dist 内の3ファイルだけ**にすると、平文 JSON を本番環境に上げずに運用できます。
