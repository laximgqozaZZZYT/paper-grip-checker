#!/usr/bin/env node
/**
 * fortune-categories-from-git.json（510件）と fortune-data.plain.json を突き合わせ、
 * 各 quote に category を付与して fortune-data.plain.json を上書きする。
 * 一致しない項目（後に追加された185件等）は author/text から推測して category を付ける。
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PLAIN = path.join(ROOT, 'fortune-data.plain.json');
const GIT_CAT = path.join(ROOT, 'scripts', 'fortune-categories-from-git.json');

const categoryByKey = new Map();
const gitCategories = JSON.parse(fs.readFileSync(GIT_CAT, 'utf8'));
gitCategories.forEach((q) => {
  categoryByKey.set(q.text + '\0' + q.author, q.category);
});

function inferCategory(q) {
  const a = q.author || '';
  const t = (q.text || '') + ' ' + a;
  if (/ことわざ|の国/.test(a)) return '世界のことわざ';
  if (/俳句|芭蕉|一茶|子規|蕪村|山口誓子|秋桜子|虚子|加藤楸邨|杉田久女|種田山頭火|万葉|短歌|和歌|柿本人麻呂|持統天皇|山上憶良|紫式部|藤原定家|西行|式子内親王/.test(a)) return '詩歌（俳句・和歌・漢詩・川柳）';
  if (/漢詩|李白|蘇軾|禅語|雲門|実語教|于武陵|劉希夷|陳子昂|魏徴/.test(a)) return '漢詩';
  if (/日本国憲法|民法|刑法|会社法|労働基準法|著作権法|特許法|教育基本法|道路交通法|廃棄物処理法|個人情報保護法|行政不服審査法|自動車損害賠償|消費者契約法|労働安全衛生/.test(a)) return '日本の法律の条文';
  if (/遊戯王OCG/.test(a)) return '遊戯王の効果モンスターの長過ぎるテキスト';
  if (/ルイズコピペ/.test(a)) return 'ルイズコピペ（全文）';
  if (/ブッシュ|トランプ|クエール|フィリップ殿下|ベルルスコーニ|麻生太郎|プーチン|ボルソナロ|バイデン|サルコジ|マクロン|シラク|ジョンソン|リース＝モッグ|習近平|ムベキ|カラザイ|安倍晋三|菅義偉|日本政府首脳|枝野幸男|蓮舫|志位和夫|松井一郎|玉木雄一郎|小沢一郎|野党党首|野党首脳|立憲民主党|弁解/.test(a)) return '各国首脳・貴賓の迷言';
  if (/シェイクスピア|ゲーテ|ニーチェ|パスカル|カフカ|ドストエフスキー|ピカソ|ゴッホ|ベートーヴェン|プルースト|キルケゴール|ルソー|ショーペンハウアー|モーパッサン|スタンダール|モーム|太宰|漱石|川端|三島|鷗外|黒澤明|ワイルド|芥川/.test(a)) return '実在する作家・芸術家の箴言';
  if (/和辻哲郎|養老孟司|安岡正篤|マックス・ウェーバー|アインシュタイン|福沢諭吉|丸山真男|レヴィ＝ストロース|フーコー|チャーチル|リンカーン|キング|孔子|老子|孫子|曾子|ソクラテス|アリストテレス|デカルト|カント|ヴィトゲンシュタイン|カミュ|サルトル|ヘーゲル|マルクス|宮沢賢治|西郷隆盛|吉田松陰|魯迅|ベーコン|エマーソン|フランクル|ガンディー|エピクテトス|マルクス・アウレリウス|寺山修司|王貞治|羽生善治/.test(a)) return '学者の箴言';
  if (/マンション|分譲|プラウド|ブリリア|パークコート|パークシティ|ザ・パークハウス|迎賓|表参道|六本木|虎ノ門|品川|南麻布|広尾|目黒|東京を頂く|洗練の高台/.test(a) || /劇的に|千葉|ブランドマンション/.test(t)) return '実在するマンション広告見出し';
  if (/東京スポーツ|東スポ|週刊文春|週刊新潮|女性自身|女性セブン|週刊女性|夕刊フジ|フライデー|日刊ゲンダイ|スポーツ報知|サンケイスポーツ|読売|朝日|産経|毎日|NHK/.test(a) && !/逮捕|万引き|書類送検/.test(t)) return '実在する三面記事・ゴシップの見出し（人物名なし）';
  if (/逮捕|万引き|書類送検|窃盗|盗んだ|盗み/.test(t) || (/コンビニ|スーパー|ドンキ|トレカ|から揚げ|試食|返品|図書館の本|苗木|牛丼|百円ショップ|レジ袋|コイン式|賞味期限切れ|おつりが足りない|CDを.*コピー/.test(t) && /逮捕|書類送検/.test(t))) return 'しょうもない悪事の三面記事（実在事件ベース・人物名なし）';
  return '';
}

function main() {
  const data = JSON.parse(fs.readFileSync(PLAIN, 'utf8'));
  let matched = 0;
  let inferred = 0;
  data.quotes = data.quotes.map((q) => {
    const key = q.text + '\0' + q.author;
    let category = categoryByKey.get(key);
    if (category) {
      matched++;
      return { ...q, category };
    }
    category = inferCategory(q);
    if (category) inferred++;
    return { ...q, category: category || 'その他' };
  });
  fs.writeFileSync(PLAIN, JSON.stringify(data, null, 2), 'utf8');
  console.log('Updated', PLAIN);
  console.log('  Matched from git:', matched);
  console.log('  Inferred:', inferred);
  console.log('  Other:', data.quotes.length - matched - inferred);
}

main();
