# re:Invent Reader

AWS re:Invent のキーノート動画を使って、英語の音読・シャドーイングを練習するためのシンプルなWebアプリです。

GitHub Pagesで公開し、スマートフォンでも使いやすいUIを目指しています。

## Features

- YouTubeのAWS re:Inventキーノートを再生
- 動画の再生位置に合わせて英文Transcriptを自動スクロール
- Transcriptをタップして、その文の位置から再生
- 英語 / 日本語の表示切り替え
- 再生 / 一時停止ボタン
- PWA対応
- スマートフォン向けレイアウト

## How to use

1. Video一覧から動画を選択
2. 動画を再生
3. 現在の発話位置に合わせてTranscriptを確認
4. Transcriptをタップすると、その位置から再生
5. 「EN / 日本語」で表示言語を切り替える

## Project structure

```text
reinvent-reader/
├── index.html
├── index.css
├── index.js
├── reader.html
├── reader.css
├── reader.js
├── videos.json
├── transcripts/
│   ├── werner-vogels-2025.json
│   └── werner-vogels-2025.original.json
├── icons/
│   ├── favicon.ico
│   ├── favicon-16.png
│   ├── favicon-32.png
│   ├── apple-touch-icon.png
│   ├── icon-192.png
│   ├── icon-512.png
│   └── icon-1024.png
└── manifest.json
```

### Main files

- `index.html` / `index.css` / `index.js`
  - Video一覧画面
- `reader.html` / `reader.css` / `reader.js`
  - 動画再生、Transcript表示、言語切り替えなどのReader画面
- `videos.json`
  - 動画のメタデータ
- `transcripts/*.json`
  - Transcriptデータ
  - `text`: 英文
  - `ja`: 日本語訳
  - `start`: 動画内の開始時刻（秒）
- `manifest.json`
  - PWA設定
- `icons/`
  - PWA / favicon用アイコン

## Transcript format

Transcriptは以下の形式のJSON配列です。

```json
[
  {
    "start": 9.728,
    "text": "End of the developer.",
    "ja": "開発者の時代は終わりだ。"
  }
]
```

`werner-vogels-2025.original.json` は、クリーニング前のTranscriptを保存したものです。

## Technologies

- HTML
- CSS
- JavaScript
- YouTube IFrame Player API
- GitHub Pages
- PWA

## YouTube captions

YouTube動画はIFrame Player APIで再生しています。

`cc_load_policy: 0` を設定して、Reader側では字幕をデフォルト表示しないようにしていますが、YouTubeの仕様上、埋め込みプレーヤーで字幕を完全に強制OFFできるとは限りません。

本アプリでは、YouTube字幕とは別にTranscriptを表示しています。

## Deployment

GitHub Pagesで公開できます。

デフォルトブランチの変更をGitHub Pagesに反映します。

## Current video

現在登録されている動画:

- AWS re:Invent 2025 - Keynote with Dr. Werner Vogels
- YouTube video ID: `3Y1G9najGiI`
