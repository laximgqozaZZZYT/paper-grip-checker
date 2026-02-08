# フォーチュンクッキー用データ（別ファイル・難読化）

## ファイル構成

| ファイル | 説明 |
|----------|------|
| `fortune-data.plain.json` | **編集用**。quotes と destructionLaws の平文JSON。各 quote には `category`（例：世界のことわざ、学者の箴言、実在するマンション広告見出し）が付与されている。ここを編集して更新する。 |
| `fortune-data.js` | **本番用**。上記JSONをBase64で難読化したスクリプト。`window.__FORTUNE_DATA__` に代入する。 |
| `index.html` | 先に `fortune-data.js` を読み込み、`quotes` / `destructionLaws` はそこから参照する。 |

## 更新作業の流れ（平文化）

1. **`fortune-data.plain.json` を編集する**  
   箴言・見出し・条文の追加・修正はすべてこのJSONで行う。
2. **難読化して配布用ファイルを更新する**
   ```bash
   node scripts/obfuscate-fortune.js
   ```
3. デプロイ時は `index.html` と `fortune-data.js` の両方を含める。

## 難読化ファイルから平文に戻す（復元）

難読化済みの `fortune-data.js` しかない場合に、平文JSONを復元する:

```bash
node scripts/decode-fortune.js
```

`fortune-data.plain.json` が上書き生成される。

## その他

- **extract-fortune.js** … 旧来どおり `index.html` に直書きされていた `quotes` / `destructionLaws` を抽出し、`fortune-data.plain.json` を生成する。初回の切り出しや、誤って index に戻してしまった場合に使用。
- **patch-html-for-fortune.js** … `index.html` 内の `const quotes = [ ... ]` と `const destructionLaws = [ ... ]` を、`window.__FORTUNE_DATA__` 参照に差し替える。通常は一度実行すればよい。
- **merge-fortune-categories.js** … 切り出し前のコメント（カテゴリ）を git 版 index.html から復元し、`fortune-data.plain.json` の各 quote に `category` を付与する。初回やカテゴリの再割り当て時に実行。
