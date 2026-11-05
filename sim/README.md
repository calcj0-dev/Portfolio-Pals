# sim：判定の参照実装と検証

| ファイル | 中身 |
| --- | --- |
| `judge.mjs` | 指標の計算と判定（rules.json を上から評価）。**参照実装** |
| `sample.mjs` | 実際にありそうな構成比のサンプルを作る（シード固定） |
| `dist.mjs` | サンプルでの出現割合（`node dist.mjs rules.json 10000 persona`） |
| `enumerate.mjs` | 5%刻み・12区分の全組み合わせ（84,672,315通り。約3分。`node enumerate.mjs rules.json`） |
| `examples.mjs` | 入力例の判定（`node examples.mjs rules.json`） |
| `rules.json`・`categories.json`・`names.json` | 判定に使うデータ（rules と categories は `..\data\` と同じもの。names はスクリプト表示用のキャラ名） |
| `personas.json`・`personas_indexheavy.json` | サンプルの型と重み（ふつうの仮定・投信だけの人が多い仮定） |
| `dist_10000.md`・`dist_indexheavy_10000.md`・`enumerate_all.md`・`examples.md` | 実行結果（04章の表の元） |

投信だけの人が多い仮定で回すとき：`PERSONAS=personas_indexheavy.json node dist.mjs rules.json 10000`（Windows の PowerShell では `$env:PERSONAS="personas_indexheavy.json"; node dist.mjs rules.json 10000`）

## このリポジトリでの変更
- 2026-10-30：キャラの修正に合わせ、`turtle` を `koala`（石橋を叩くコアラ）、`yutai` を `mekiki`（日本株の目利き）に直した（rules.json・names.json と結果の .md の名前）。判定の条件は変えていないので、結果の数字は同じ
- 2026-11-05：公開時の10体用に rules.json を v2 に組み直した（案A。カワウソは個別株・暗号資産のキャラのあと）。names.json の名前を新しいキャラ名にし、dist・examples・enumerate_all の .md を作り直した。外した12体は rules.json にない（データは src/data に残す）
