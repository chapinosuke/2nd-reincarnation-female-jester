# 透過キャラクター立ち絵

2026-09-05、内蔵 imagegen で元の三面図を参照し、一人ずつ再生成しました。
全4点は1024×1536のRGBA PNG。背景はアルファチャンネルによる透過です。
サイト用WebPも透明度を保持しています。

- [mia PNG](mia-v1.png) → web/public/characters/standees/mia-v1.webp
- [alto PNG](alto-v1.png) → web/public/characters/standees/alto-v1.webp
- [sera PNG](sera-v1.png) → web/public/characters/standees/sera-v1.webp
- [gold PNG](gold-v1.png) → web/public/characters/standees/gold-v1.webp

全プロンプトと透過検証結果は [generation-v1.json](generation-v1.json) に記録しています。
