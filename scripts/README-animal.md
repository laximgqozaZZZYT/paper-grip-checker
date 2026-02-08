# 動物データ（別ファイル・難読化）

## ファイル構成

| ファイル | 説明 |
|----------|------|
| `animal-data.plain.json` | **編集用**。animalTiers（握力帯ごとの動物一覧）の平文JSON。 |
| `animal-data.js` | **本番用**。上記を Base64 で難読化したスクリプト。`window.__ANIMAL_DATA__` に代入する。 |
| `index.html` | 先に `animal-data.js` を読み込み、`animalTiers` はそこから参照する。 |

## 更新作業の流れ

1. **`animal-data.plain.json` を編集する**
2. **難読化して配布用ファイルを更新する**
   ```bash
   node scripts/obfuscate-animal.js
   ```
3. デプロイ時は `index.html` と `animal-data.js` の両方を含める。

## 難読化ファイルから平文に戻す

```bash
node scripts/decode-animal.js
```

## その他

- **extract-animal.js** … `index.html` に直書きされていた `animalTiers` を抽出し、`animal-data.plain.json` を生成する。
- **patch-html-for-animal.js** … `index.html` 内の `const animalTiers = [ ... ]` を `window.__ANIMAL_DATA__.animalTiers` 参照に差し替える。通常は一度実行すればよい。
