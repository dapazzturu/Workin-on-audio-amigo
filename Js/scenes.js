
(() => {
  const ids = ['intro', 'descent', 'whitehole', 'universe', 'letter', 'finale'];
  const labels = ['Prologue', 'The descent', 'The other side', 'A new universe', 'A little letter', 'The finale'];
  const dayScenes = ['whitehole', 'universe', 'letter'];

  const scenes = document.querySelectorAll('.scene');
  const chapterLabel = document.getElementById('chapterLabel');
  const video = document.getElementById('blackHoleVideo');
  const flash = document.getElementById('sceneFlash');

  let current = 'intro';

  // The black-hole video is only seen in the Introduction and the Descent.
  // Pausing it elsewhere saves battery and decoding work on phones.
  function syncVideo(name) {
    if (!video) return;

    const wanted = name === 'intro' || name === 'descent';

    if (wanted) {
      const p = video.play();
      if (p && p.catch) p.catch(() => {});
    } else {
      // let the fade-out finish before freezing the frame
      clearTimeout(video._pauseTimer);
      video._pauseTimer = setTimeout(() => {
        if (current !== 'intro' && current !== 'descent') video.pause();
      }, 1400);
    }
  }

  // A short wash of light that carries the Descent into the White Hole.
  function playFlash() {
    if (!flash) return;
    flash.classList.remove('go');
    void flash.offsetWidth; // restart the animation
    flash.classList.add('go');
  }

  function show(name) {
    if (!ids.includes(name)) return;

    const previous = current;
    current = name;

    scenes.forEach(s => s.classList.toggle('scene-active', s.dataset.scene === name));

    chapterLabel.textContent = labels[ids.indexOf(name)] || 'Beyond';

    document.body.dataset.scene = name;
    document.body.classList.toggle('is-descending', name === 'descent');

    // Every scene begins at its own top.
    const active = document.querySelector('.scene-active');
    if (active) active.scrollTop = 0;

    // the night world becomes a day world at the white hole, and returns for the finale
    window.BeyondStarfield?.setTone(dayScenes.includes(name) ? 'day' : 'night');

    if (previous === 'descent' && name === 'whitehole') playFlash();

    syncVideo(name);

    document.dispatchEvent(new CustomEvent('beyond:scene', { detail: { name, previous } }));
  }

  window.BeyondScenes = { show, get current() { return current; } };
})();
