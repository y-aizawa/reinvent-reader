async function loadVideos() {
  const list = document.getElementById('videoList');
  try {
    const response = await fetch('./videos.json', { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const videos = await response.json();
    if (!Array.isArray(videos) || videos.length === 0) {
      list.innerHTML = '<div class="empty">動画が登録されていません。</div>';
      return;
    }
    list.innerHTML = '';
    for (const video of videos) {
      const card = document.createElement('a');
      card.className = 'card';
      card.href = `reader.html?video=${encodeURIComponent(video.key)}`;

      const thumb = document.createElement('div');
      thumb.className = 'thumb';
      thumb.style.backgroundImage = `url("https://i.ytimg.com/vi/${encodeURIComponent(video.id)}/hqdefault.jpg")`;

      const body = document.createElement('div');
      body.className = 'card-body';

      const tag = document.createElement('div');
      tag.className = 'tag';
      tag.textContent = video.category || 'AWS re:Invent';

      const title = document.createElement('div');
      title.className = 'title';
      title.textContent = video.title;

      body.append(tag, title);

      if (Array.isArray(video.chapters) && video.chapters.length > 0) {
        const totalDuration = Math.max(...video.chapters.map(chapter => Number(chapter.end) || 0));
        const minutes = Math.floor(totalDuration / 60);
        const seconds = String(Math.floor(totalDuration % 60)).padStart(2, '0');
        const meta = document.createElement('div');
        meta.className = 'chapter-meta';
        meta.textContent = `${video.chapters.length} chapters · ${minutes >= 60 ? `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, '0')}` : `${minutes}:${seconds}`}`;
        body.appendChild(meta);
      }

      if (video.description) {
        const desc = document.createElement('div');
        desc.className = 'desc';
        desc.textContent = video.description;
        body.appendChild(desc);
      }

      card.append(thumb, body);
      list.appendChild(card);
    }
  } catch (error) {
    console.error(error);
    list.innerHTML = '<div class="empty">動画一覧の読み込みに失敗しました。</div>';
  }
}

loadVideos();