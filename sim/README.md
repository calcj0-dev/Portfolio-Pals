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
