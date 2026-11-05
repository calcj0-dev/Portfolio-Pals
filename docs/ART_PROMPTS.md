# キャラの絵の作り方（画像生成AIで作る）

- オーナーが画像生成AI（ChatGPT または Grok）で画像を作り、開発担当が切り抜いてアプリに組み込む
- 既存キャラの名前（作品名・キャラ名）は指示文に入れない。絵柄は言葉で説明する（そっくりな絵が出るのを避けるため）
- 人気が出るよう、表情は基本的に明るくする（困った顔・悲しい顔・怒った顔にしない）。キャラの性格（様子見・迷っている など）は、表情ではなく持ち物やしぐさで見せる

## 手順
1. 下の「共通の指示」と「キャラごとの指示」をつなげて入れる（英語のまま貼るのがおすすめ）
   - ChatGPT のときは、共通の指示の `Plain pure white background` を `Transparent background (PNG)` に置き換える（背景が透明の PNG で出せる）
2. 何枚か作り、気に入った1枚を、できるだけ大きいサイズで保存する
3. `art/raw/<タイプID>.png`（または .jpg）として置く。例：`art/raw/monk.png`
4. 開発担当に「置いた」と伝える → `python tools/art/process.py <タイプID>` で背景を切り抜き、`public/chars/<ID>.webp`（画面用）と `art/png/<ID>.png`（OGP 画像の材料）を作る
   - 明るい色の小物（岩など）が透けてしまうときは、`tools/art/process.py` の `LIGHT_MIN_BY_ID` にそのキャラを足す

### うまく作るコツ
- 最初の1体（絵柄の OK が出たもの）ができたら、2体目からはその画像を添付して「Same art style as the attached image.」を先頭に付けると、絵柄がそろいやすい
- 背景が白（ChatGPT なら透明）にならないときは「plain pure white background」を強調するか、作り直す
- 画像の中に文字やサインが入っていたら使えないので作り直す
- 白っぽいキャラ（うさぎ・ヒツジ）は、背景と見分けやすいよう毛の色をクリーム色にしている。輪郭の線が途切れていると体が透けるので、線がつながっている1枚を選ぶ

## 共通の指示（全キャラの先頭に付ける）
```
Simple Japanese kawaii chibi character illustration. Hand-drawn look with thin, slightly wobbly dark brown-black outlines. Soft pastel colors with very gentle soft shading. A small round body merged with a big round head (about 1.5 heads tall), short stubby arms and legs. Small, widely spaced black bead eyes with a tiny white highlight, a very small mouth, soft pink blush on the cheeks with a few short diagonal blush lines. Bright, cheerful, happy and heartwarming mood, always with a happy smiling expression (never sad, worried, troubled or angry). Full body, centered, facing the viewer, filling most of the frame. Plain pure white background, no text, no logo, no signature, no frame, no scenery. Square 1:1.
```

## キャラごとの指示

### monk（悟りを開いたカピバラ）
```
The character: a small capybara monk. Boxy rounded head, very small ears, a wide flat dark nose, light tan fur. Wearing an orange Buddhist robe draped over one shoulder. Paws pressed together in front of the chest as if praying. Calm, peaceful, content smile.
```

### craftsman（王道インデックスのビーバー）
```
The character: a small beaver craftsman. Round head, small round ears, two little white front teeth, light brown fur with a cream belly, a flat paddle-shaped tail. Wearing a white twisted headband tied at the side of the head. Holding a small wooden log in both paws. Proud, cheerful smile.
```

### otter（様子見のカワウソ）
```
The character: a small river otter peeking over the top of a gray rock, only the upper body visible above the rock. Wide flat head, tiny ears on the sides, brown fur with a cream muzzle, little whiskers. Holding a pair of binoculars in both paws, resting on the rock. Bright, happy, curious smile.
```

### mediator（論争を終わらせたうさぎ）
```
The character: a small rabbit with long upright ears with pink insides, soft light cream fur (not pure white), a tiny pink nose. Holding a small golden balance scale in both paws in front of the body, the two pans perfectly level. Sweet, happy, gentle smile.
```

### rocket_cat（月を目指すロケット猫）
```
The character: a small orange tabby cat riding astride a small red-and-white cartoon rocket that points diagonally up to the upper right, with a small round flame at the back. Small round goggles pushed up on the forehead. One paw raised high in excitement. Sparkling eyes, big excited happy grin.
```

### mekiki（日本株の目利きタヌキ）
```
The character: a small tanuki (Japanese raccoon dog) with round ears, brown fur, a dark brown mask-like patch around the eyes, a cream muzzle and a fluffy tail with dark stripes. Holding up a big round magnifying glass with a wooden handle next to the face. Curious, delighted happy smile.
```

### tech（夜ふかしのテック好きフェネック）
```
The character: a small fennec fox with very large pointed ears, sandy cream fur, a tiny black nose and a fluffy tail with a dark tip. Wearing big mint-green over-ear headphones resting around the neck. Holding a small tablet with a blank glowing screen in both paws. Sparkling eyes, excited happy smile.
```

### pioneer（米国びいきのプレーリードッグ）
```
The character: a small prairie dog with light sandy-brown fur and a cream belly, small round ears. Riding in a tiny toy-like covered wagon with a white canvas top (just the wagon, no horse), the upper body leaning out of the front, one paw pointing forward. Confident, bright, happy grin.
```

### owl（バランス型の賢者フクロウ）
```
The character: a small round owl with light brown feathers, a cream belly and face, small ear tufts, tiny round glasses. Holding an open book against the chest with both wings. Wise, warm, happy smile.
```

### sheep（迷えるヒツジ）
```
The character: a small fluffy sheep with soft light cream wool (not pure white), a light beige face, small floppy ears. Head tilted to one side, looking around with curiosity, one hoof raised to the cheek. Bright, happy, curious smile.
```
