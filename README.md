# re:Invent Reader

**re:Invent Reader** is a web application for practicing English listening, reading aloud, and repeating sentences with AWS re:Invent keynote videos.

**Demo:** https://y-aizawa.github.io/reinvent-reader/

The app combines video playback with a synchronized transcript so that learners can follow the speaker's words while listening.

Tapping a transcript sentence jumps directly to that point in the video.

The reader supports two playback modes: **continuous playback** and **repeating playback**. Repeating playback gives learners time to repeat each sentence before moving on to the next one.

The transcript can be switched between English and Japanese using the language buttons.

The interface is designed primarily for mobile devices. The project is published through GitHub Pages and can also be installed as a PWA on supported devices.

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

The transcript data is stored as JSON, with the original English text, Japanese translation, and the corresponding start and end times for each sentence in the video.

