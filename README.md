# Sorting Visualizer Web

画像を分割したピースをソート対象として扱い、同じ初期シャッフル状態から複数のソートアルゴリズムを同時に走らせる比較サイトです。Canvas でアニメーション表示し、ソートが進むにつれて画像が復元されます。

## 使い方
1. `public/index.html` をブラウザで開きます（Cloudflare Pages など静的ホスティングでも動作）。
2. デフォルト画像が表示されます。別の画像を使う場合はアップロードします。
3. 分割モード（縦ストライプ/タイル）と分割数（タイルは列/行）を調整します。
4. 比較したいアルゴリズムをチェックします。
5. `Shuffle` → `Start` でアニメーション開始。`Pause` で一時停止。

## 仕様メモ
- 画像は最大 640x480 に縮小して扱います（縦横比維持）。
- ピースは `keyIndex` を持ち、比較キーは `keyIndex` の昇順です。
- 全アルゴリズムが同じ初期配列になるよう、Seed 付き乱数でシャッフルします。
- Bubble はピース数が多いと重いので 250 以上では自動的に無効化します。
- 統計値: comparisons / swaps / writes / steps / time を表示。

## 簡易テスト手順
- 画像アップロード → 2〜3アルゴリズム選択 → `Shuffle` → `Start` で復元されることを確認
- Seed を変えるとシャッフルが変わるが、同じ Seed なら同じになることを確認
- 分割数を増減して動作確認（Bubble が自動で無効化されることも確認）

## ファイル構成
- `public/index.html`
- `public/styles.css`
- `public/js/main.js`
- `public/js/renderer.js`
- `public/js/algorithms.js`
- `public/js/rng.js`
- `public/js/image_slicer.js`
