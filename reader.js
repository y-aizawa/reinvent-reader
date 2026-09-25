const params = new URLSearchParams(window.location.search);
const videoKey = params.get('video');

const REPEATING_PAUSE_LEAD = 0.3;
const REPEATING_PAUSE_MULTIPLIER = 1.5;
const REPEATING_PAUSE_MIN = 500;
const SENTENCE_UPDATE_INTERVAL = 250;
const state = {
  videos: [],
  currentVideo: null,
  transcript: [],
  player: null,
  currentIndex: -1,
  language: 'en',
  playbackMode: 'continuous',
  pauseTimer: null,
  repeatingAutoPaused: false,
  videoVisible: true
};

async function loadData() {
  const [videosResponse] = await Promise.all([
    fetch('./videos.json', { cache: 'no-store' })
  ]);
  if (!videosResponse.ok) throw new Error(`videos.json: HTTP ${videosResponse.status}`);
  state.videos = await videosResponse.json();
  state.currentVideo = state.videos.find(v => v.key === videoKey);
  if (!state.currentVideo) throw new Error('Video not found');
  document.getElementById('videoTitle').textContent = state.currentVideo.title;

  const transcriptResponse = await fetch(`./${state.currentVideo.transcript}`, { cache: 'no-store' });
  if (!transcriptResponse.ok) throw new Error(`transcript: HTTP ${transcriptResponse.status}`);
  state.transcript = await transcriptResponse.json();
  if (!Array.isArray(state.transcript) || state.transcript.length === 0) throw new Error('Transcript is empty');
}

function getCurrentIndex(time) {
  let index = 0;
  for (let i = 0; i < state.transcript.length; i++) {
    if (Number(state.transcript[i].start) <= time) index = i;
    else break;
  }
  return index;
}

function moveCurrentLine(container, element) {
  if (!element) return;

  // 現在の字幕を「字幕表示エリア」の最上部に置く。
  // document/body のスクロールではなく、.lyrics 自体だけをスクロールする。
  const containerRect = container.getBoundingClientRect();
  const elementRect = element.getBoundingClientRect();
  const nextScrollTop = Math.max(
    0,
    container.scrollTop + elementRect.top - containerRect.top
  );

  container.scrollTo({
    top: nextScrollTop,
    behavior: 'auto'
  });
}

function renderLyrics(index) {
  const container = document.getElementById('lyrics');
  container.innerHTML = '';
  state.transcript.forEach((item, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'line';
    if (i === index) button.classList.add('active');
    else if (Math.abs(i - index) === 1) button.classList.add('near');
    button.textContent = state.language === 'ja'
      ? (item.ja || item.text || item.en || '')
      : (item.text || item.en || '');
    button.addEventListener('click', () => {
      if (!state.player) return;
      // 先にフォーカスを外す。renderLyrics() でDOMを作り直した後だと、
      // Android/Chromeが古いボタンの位置へページ全体をスクロールすることがある。
      button.blur();
      clearPauseTimer();
      state.repeatingAutoPaused = false;
      state.player.seekTo(Number(item.start), true);
      state.player.playVideo();
      state.currentIndex = i;
      renderLyrics(i);
    });
    container.appendChild(button);
  });

  // DOM反映後に実際の表示位置を測ってスクロールする。
  requestAnimationFrame(() => {
    moveCurrentLine(
      container,
      container.querySelector('.active')
    );
  });

  document.getElementById('info').textContent = `Sentence ${index + 1} / ${state.transcript.length}`;
}

function setLanguage(language) {
  state.language = language;
  document.querySelectorAll('.language-button').forEach(button => {
    button.classList.toggle('active', button.dataset.language === language);
  });
  renderLyrics(state.currentIndex < 0 ? 0 : state.currentIndex);
}

document.querySelectorAll('.language-button').forEach(button => {
  button.addEventListener('click', () => {
    button.blur();
    setLanguage(button.dataset.language);
    showToast(button.dataset.language === 'en' ? 'English' : '日本語');
  });
});

let toastTimer = null;

function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 1000);
}

function updateVideoToggle() {
  const app = document.querySelector('.app');
  const button = document.getElementById('videoToggle');
  if (!app || !button) return;

  app.classList.toggle('video-hidden', !state.videoVisible);
  button.classList.toggle('active', state.videoVisible);
  button.setAttribute('aria-pressed', String(state.videoVisible));
  button.setAttribute('aria-label', state.videoVisible ? '動画を非表示' : '動画を表示');
  button.setAttribute('title', state.videoVisible ? '動画を非表示' : '動画を表示');

  const icon = button.querySelector('.video-toggle-icon');
  if (icon) {
    icon.innerHTML = state.videoVisible
      ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"></path><circle cx="12" cy="12" r="2.5"></circle></svg>'
      : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 3l18 18"></path><path d="M10.6 6.2C11.1 6.1 11.5 6 12 6c6 0 9.5 6 9.5 6-.8 1.3-1.8 2.4-3 3.3M7.2 7.5C4.1 8.9 2.5 12 2.5 12s3.5 6 9.5 6c1.1 0 2.1-.2 3-.5"></path></svg>';
  }
}

document.getElementById('videoToggle').addEventListener('click', () => {
  state.videoVisible = !state.videoVisible;
  updateVideoToggle();
  showToast(state.videoVisible ? '動画表示' : '動画非表示');
});
function clearPauseTimer() {
  if (state.pauseTimer) {
    clearTimeout(state.pauseTimer);
    state.pauseTimer = null;
  }
}

function updateModeButton() {
  document.querySelectorAll('.mode-button').forEach(button => {
    button.classList.toggle('active', button.dataset.mode === state.playbackMode);
  });
}

document.querySelectorAll('.mode-button').forEach(button => {
  button.addEventListener('click', () => {
    button.blur();
    setPlaybackMode(button.dataset.mode);
  });
});

function setPlaybackMode(mode) {
  if (mode === state.playbackMode) return;
  state.playbackMode = mode;
  state.repeatingAutoPaused = false;
  clearPauseTimer();
  updateModeButton();
  showToast(mode === 'continuous' ? '連続再生' : 'リピーティング');

  if (
    mode === 'pause' &&
    state.player &&
    state.player.getPlayerState() === YT.PlayerState.PLAYING
  ) {
    scheduleRepeatingPause();
  }
}

function updatePlaybackButton() {
  const button = document.getElementById('playbackButton');
  const icon = document.getElementById('playbackIcon');
  if (!button || !icon) return;

  const isPlaying = state.player &&
    state.player.getPlayerState() === YT.PlayerState.PLAYING;

  icon.innerHTML = isPlaying
    ? '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="4" width="5" height="16" rx="1"></rect><rect x="14" y="4" width="5" height="16" rx="1"></rect></svg>'
    : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.87l10-6.5a1.03 1.03 0 0 0 0-1.74l-10-6.5A1 1 0 0 0 8 5.5Z"></path></svg>';
  button.setAttribute('aria-label', isPlaying ? '一時停止' : '再生');
}

document.getElementById('playbackButton').addEventListener('click', () => {
  if (!state.player) return;

  clearPauseTimer();

  if (state.player.getPlayerState() === YT.PlayerState.PLAYING) {
    state.repeatingAutoPaused = false;
    state.player.pauseVideo();
  } else {
    if (state.playbackMode === 'pause' && state.repeatingAutoPaused) {
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.transcript.length) return;

      state.repeatingAutoPaused = false;
      state.currentIndex = nextIndex;
      state.player.seekTo(Number(state.transcript[nextIndex].start), true);
      renderLyrics(nextIndex);
      state.player.playVideo();
      scheduleRepeatingPause();
      return;
    }

    state.repeatingAutoPaused = false;
    state.player.playVideo();
    if (state.playbackMode === 'pause') {
      const index = getCurrentIndex(state.player.getCurrentTime());
      if (index !== state.currentIndex) {
        state.currentIndex = index;
        renderLyrics(index);
      }
      scheduleRepeatingPause();
    }
  }
});

function onYouTubeIframeAPIReady() {
  state.player = new YT.Player('player', {
    videoId: state.currentVideo.id,
    playerVars: { playsinline: 1, rel: 0, cc_load_policy: 0 },
    events: {
      onReady: () => {
        updatePlaybackButton();
        updateModeButton();
        setInterval(updateCurrentSentence, SENTENCE_UPDATE_INTERVAL);
      },
      onStateChange: () => {
        updatePlaybackButton();
      }
    }
  });
}

function scheduleRepeatingPause() {
  if (
    !state.player ||
    state.playbackMode !== 'pause' ||
    state.player.getPlayerState() !== YT.PlayerState.PLAYING ||
    state.pauseTimer ||
    state.currentIndex < 0
  ) return;

  const item = state.transcript[state.currentIndex];
  if (!item) return;

  const now = state.player.getCurrentTime();
  const remainingToEnd = Math.max(0, Number(item.end) - now);
  const pauseLead = remainingToEnd > REPEATING_PAUSE_LEAD ? REPEATING_PAUSE_LEAD : 0;
  const remaining = Math.max(0, remainingToEnd - pauseLead);

  state.pauseTimer = setTimeout(() => {
    state.pauseTimer = null;

    if (
      !state.player ||
      state.playbackMode !== 'pause' ||
      state.player.getPlayerState() !== YT.PlayerState.PLAYING
    ) return;

    state.player.pauseVideo();
    state.repeatingAutoPaused = true;

    const duration = Math.max(0, Number(item.end) - Number(item.start));
    const pauseDuration = Math.max(REPEATING_PAUSE_MIN, duration * 1000 * REPEATING_PAUSE_MULTIPLIER);
    const nextIndex = state.currentIndex + 1;

    if (nextIndex >= state.transcript.length) return;

    state.pauseTimer = setTimeout(() => {
      state.pauseTimer = null;

      if (!state.player || state.playbackMode !== 'pause') return;

      state.currentIndex = nextIndex;
      state.player.seekTo(Number(state.transcript[nextIndex].start), true);
      renderLyrics(nextIndex);
      state.player.playVideo();
      scheduleRepeatingPause();
    }, pauseDuration);
  }, remaining * 1000);
}

function updateCurrentSentence() {
  if (!state.player || state.player.getPlayerState() !== YT.PlayerState.PLAYING || state.transcript.length === 0) return;
  const index = getCurrentIndex(state.player.getCurrentTime());
  if (state.playbackMode === 'pause') {
    if (index !== state.currentIndex) {
      state.currentIndex = index;
      renderLyrics(index);
    }
    scheduleRepeatingPause();
    return;
  }

  if (index !== state.currentIndex) {
    state.currentIndex = index;
    renderLyrics(index);
  }
}

(async () => {
  try {
    if (!videoKey) throw new Error('Missing video parameter');
    await loadData();

    // TranscriptはYouTube APIの準備を待たずに表示する。
    // YouTube側で問題が起きても字幕一覧自体は確認できるようにする。
    state.currentIndex = 0;
    updateModeButton();
    updateVideoToggle();
    renderLyrics(0);

    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(script);
  } catch (error) {
    console.error(error);
    document.getElementById('lyrics').innerHTML = '<div class="loading">動画またはTranscriptの読み込みに失敗しました。</div>';
    document.getElementById('info').textContent = 'Load error';
  }
})();