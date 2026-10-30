# キャラの絵の作り方（Grok で生成）

- オーナーが Grok（X のアプリまたは grok.com）で画像を作り、開発担当が切り抜いてアプリに組み込む
- 既存キャラの名前（作品名・キャラ名）は指示文に入れない。絵柄は言葉で説明する（そっくりな絵が出るのを避けるため）

## 手順
1. 下の「共通の指示」と「キャラごとの指示」をつなげて Grok に入れる（英語のまま貼るのがおすすめ）
2. 何枚か作り、気に入った1枚を、できるだけ大きいサイズで保存する
3. `art/raw/<タイプID>.png`（または .jpg）として置く。例：`art/raw/monk.png`
4. 開発担当に「置いた」と伝える → 背景を切り抜き、大きさをそろえて `public/chars/` に入れる

### うまく作るコツ
- 最初の1体（絵柄の OK が出たもの）ができたら、2体目からはその画像を Grok に添付して「Same art style as the attached image.」を先頭に付けると、絵柄がそろいやすい
- 背景が白にならないときは「plain pure white background」を強調するか、作り直す
- 画像の中に文字やサインが入っていたら使えないので作り直す

## 共通の指示（全キャラの先頭に付ける）
```
Simple Japanese kawaii chibi character illustration. Hand-drawn look with thin, slightly wobbly dark brown-black outlines. Soft pastel colors with very gentle soft shading. A small round body merged with a big round head (about 1.5 heads tall), short stubby arms and legs. Small, widely spaced black bead eyes with a tiny white highlight, a very small mouth, soft pink blush on the cheeks with a few short diagonal blush lines. Gentle, cute, heartwarming mood. Full body, centered, facing the viewer, filling most of the frame. Plain pure white background, no text, no logo, no signature, no frame, no scenery. Square 1:1.
```

## キャラごとの指示

### monk（悟りを開いた僧侶）
```
The character: a small capybara monk. Boxy rounded head, very small ears, a wide flat dark nose, light tan fur. Wearing an orange Buddhist robe draped over one shoulder. Paws pressed together in front of the chest as if praying. Calm, peaceful, content smile.
```

### craftsman（王道インデックス職人）
```
The character: a small beaver craftsman. Round head, small round ears, two little white front teeth, light brown fur with a cream belly, a flat paddle-shaped tail. Wearing a white twisted headband tied at the side of the head. Holding a small wooden log in both paws. Proud, cheerful smile.
```

### otter（様子見のカワウソ）
```
The character: a small river otter peeking over the top of a gray rock, only the upper body visible above the rock. Wide flat head, tiny ears on the sides, brown fur with a cream muzzle, little whiskers. Holding a pair of binoculars in both paws, resting on the rock. Slightly worried, hesitant expression with raised eyebrows.
```
