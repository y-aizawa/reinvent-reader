const params = new URLSearchParams(window.location.search);
const videoKey = params.get('video');
const state = { videos: [], currentVideo: null, transcript: [], translations: {}, player: null, currentIndex: -1, language: 'en' };

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

  // 日本語訳は字幕データ本体とは別ファイルで管理する。
  // 翻訳の読み込み失敗がTranscript本体の表示を止めないよう、別途読み込む。
  const transcriptFileName = state.currentVideo.transcript.split('/').pop();
  const translationPath = `./translations/${transcriptFileName}`;
  fetch(translationPath, { cache: 'no-store' })
    .then(response => response.ok ? response.json() : {})
    .then(translations => {
      state.translations = translations || {};
      if (state.language === 'ja' && state.transcript.length > 0) {
        renderLyrics(state.currentIndex < 0 ? 0 : state.currentIndex);
      }
    })
    .catch(error => {
      console.warn('Japanese translation could not be loaded:', error);
    });
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
      ? (state.translations[String(i + 1)] || item.text || item.en || '')
      : (item.text || item.en || '');
    button.addEventListener('click', () => {
      if (!state.player) return;
      // 先にフォーカスを外す。renderLyrics() でDOMを作り直した後だと、
      // Android/Chromeが古いボタンの位置へページ全体をスクロールすることがある。
      button.blur();
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
      container.querySelector('.active'),
      index
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
    setLanguage(button.dataset.language);
  });
}

function onYouTubeIframeAPIReady() {
  state.player = new YT.Player('player', {
    videoId: state.currentVideo.id,
    playerVars: { playsinline: 1, rel: 0, cc_load_policy: 0 },
    events: {
      onReady: () => {
        setInterval(updateCurrentSentence, 250);
      }
    }
  });
}

function updateCurrentSentence() {
  if (!state.player || state.player.getPlayerState() !== YT.PlayerState.PLAYING || state.transcript.length === 0) return;
  const index = getCurrentIndex(state.player.getCurrentTime());
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