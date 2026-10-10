# 現在の構成

このリポジトリは、GitHub Pages で公開する静的 Web アプリです。ビルドツールやサーバーは使っていません。

```text
/
├── index.html / index.css / index.js  # 動画一覧
├── reader.html / reader.css / reader.js # 学習用プレイヤー
├── videos.json                        # 動画カタログとチャプター
├── transcripts/                       # 文単位の字幕データ
├── icons/                             # PWA・ファビコン用アイコン
├── manifest.json                      # PWA 設定
├── docs/                              # 仕様・設計・意思決定
└── AGENTS.md                          # 開発ルール
```

現時点では、画面に必要な静的ファイルをルートに保つ。ビルドツールやモノレポ構成は、複数アプリ・共有コード・テスト基盤が実際に必要になった時点で導入を検討する。

