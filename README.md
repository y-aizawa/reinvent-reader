# re:Invent Reader

**re:Invent Reader** is a web application for practicing English listening, reading aloud, and shadowing with AWS re:Invent keynote videos.

The app combines video playback with a synchronized transcript so that learners can follow the speaker's words while listening. English and Japanese translations are provided together to make it easier to check the meaning of each sentence while practicing.

The project is designed with a simple, mobile-friendly interface and is published through GitHub Pages. It can also be installed as a PWA on supported devices.

## Project Structure

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

The project is intentionally kept as a small static web application. The main pages and their styles and scripts are separated into HTML, CSS, and JavaScript files, while video information is managed in `videos.json` and transcript data is stored in the `transcripts/` directory.

## Technologies

- HTML
- CSS
- JavaScript
- YouTube IFrame Player API
- GitHub Pages
- Progressive Web App (PWA)

## Current Content

The project currently includes the AWS re:Invent 2025 keynote featuring Dr. Werner Vogels.

The transcript data is stored as JSON, with the original English text, Japanese translation, and the corresponding start time in the video.

