
// app.js
// Per-button behaviour lives in interactions.js (scene flow) and audio.js (sound).
// Each button already triggers its own sound effect, so no global click handler is needed
// (the previous one called playSfx() with no name and only produced console warnings).

(() => {
  // Make sure the experience always begins in a clean, known state.
  if (window.BeyondScenes && window.BeyondScenes.current !== 'intro') {
    window.BeyondScenes.show('intro');
  }

  // Missing-module guard: tells the developer immediately if a script failed to load.
  ['BEYOND_CONFIG', 'BeyondAudio', 'BeyondScenes', 'BeyondStarfield', 'BeyondToast'].forEach((name) => {
    if (!window[name]) console.warn('[Beyond] module missing:', name);
  });
})();
