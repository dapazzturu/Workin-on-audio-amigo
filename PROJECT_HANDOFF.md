# PROJECT_HANDOFF — "Night side / Day side" restyle (v2)

## Update: White Hole sound (homecoming)
- `assets/audio/SFX/whitehole.wav` replaced twice this session. Current version: warm, sweet "coming home" sound (rising sparkle bells, soft pad and "aah" voices, a tender music-box phrase resolving in D major; 5.2 s, mono 44.1 kHz, loudness matched to the original). A darker horror experiment was tried and discarded.
- The previous (original) sound is saved outside the project as whitehole_original_backup.wav. Planet tap again plays the White Hole sound, as originally.
- Not heard by a human yet: only waveform/spectrogram and loudness were checked.

## Update: Sagittarius in the intro
- `index.html`: inline SVG `<figure class="sagittarius">` in `#scene-intro` (the Teapot: 8 main stars, 4 faint ones, 10 lines, from real J2000 positions; Kaus Australis and Nunki get a ring). Caption "Sagittarius" with a small arrow glyph.
- `css/main.css` section 27: draws itself once on entering the intro (lines via stroke-dashoffset, stars fade), two bright stars twinkle slowly. Transform/opacity only, `pointer-events:none`.
- Desktop: top-right corner, clear of the headline and black hole. Phones: sits in the empty band under the header and the text is pushed down. Phones shorter than 600px tall: hidden to avoid crowding.
- Verified: 132 + 60 checks pass, reduced-motion flow reaches finale, no horizontal overflow at 1366x768, 1366x650, 390x844, 360x640, letter identical.
- To remove: delete the `<figure class="sagittarius">` block and section 27.


This folder is a RESTYLED COPY of the repaired project. Same words, same six scenes, same scripts and flow. The previous look (violet + gold, Cormorant Garamond) lives in the other zip (Peter_updated.zip).

## What changed in v2
- css/main.css rewritten from scratch (same class names / state classes, so no logic changed).
- Concept: NIGHT world (intro, descent, finale) -> flash -> DAY world (white hole, universe, letter) -> NIGHT again for the finale. Colours are registered CSS properties (@property) so the whole page morphs between worlds; body[data-scene] picks the world.
- Palette: Void #070b16, Starlight #ecefF7, Ember #ff8a3d (from the video; buttons + seals only), Dawn #eef2fa, Ink #0e1733, Prussian #243f93.
- Type: Bricolage Grotesque (headlines/UI) + Newsreader (reading, italics). Loaded from Google Fonts in index.html. Fallbacks: Inter / Charter / Georgia.
- Stars: starfield.js gained setTone('night'|'day') (light stars at night, ink dots by day); canvas dims while the letter is read.
- Labels set in sentence case instead of tracked capitals (wording unchanged; HTML/JS strings edited: loading facts, chapter labels, buttons, hints). "SURPRISEE!" and "THERE WAS LIGHT." deliberately stay capitals. The letter's own "TO SOMEONE WONDERFUL" line is untouched.
- Decoration removed: glow, grain/vignette overlays, gradients, arrow icons on primary buttons, floating letter-orbit rings.
- White hole is now a hairline diagram (rings + rays + one orbiting ember). Envelope is a flat ink-blue object with an ember seal. Planet is a flat disc with one ring.

## Verified (same automated suite as v1): 128 checks, 0 failures
No horizontal overflow at 360/320/1366/1280x600; buttons in viewport; flow intro->...->finale->replay; letter text identical to the original (685 words, same checksum); volume bar hidden/shown; Escape mid-descent; reduced-motion run reaches finale with no errors.

## Universe scene: one scene per star (added after the restyle)
- The four stars each open their own scene on the big stage (config-driven: `messages` + `stageNames` in js/config.js):
  1 The quiet world - planet that turns (latitude bands drift at different speeds, a storm spot travels) with a ring of light circling it, back half behind the planet and front half in front.
  2 The patient moon - phases slowly changing, one ember satellite on a dotted orbit.
  3 The long way home - a comet crossing toward a small waiting light.
  4 Where I keep you - a heart that draws itself out of stars, gently beating.
- Next star / tapping a chart star -> message + scene + highlighted star + label ("The quiet world 01 / 04"). After star 4, Next wraps to star 1.
- New messages (first person, missing her, supportive) replaced the four generic ones. These are NOT the letter; the letter is unchanged and still verified identical.
- Layout fixes found while testing: on desktop the floating Continue button used to cover the message on short windows -> now in normal flow; the art is sticky on the right; compact tiers at max-height 1000px and 700px make 600-900px-tall windows fit without scrolling. On phones the order is heading -> art -> message (Next star) -> Continue -> star chart.
- Motion: CSS animations pause for hidden stages/scenes; SMIL (moon satellite, comet) is paused unless visible; reduced motion freezes SMIL at a visible frame.
- Verified: 60 stage checks (each star shows exactly one active scene, message/label/count match config, rotation actually changes over time, heart built, wrap-around, no overflow, no console errors) at 1366x768 and 360x740, plus the 132-check regression suite.

## Not verified
- Fonts: the sandbox is offline, so screenshots were reviewed with the fallback fonts (Inter/Charter). Bricolage at 80% width is narrower than Inter, so headlines will sit tighter on real devices. Check "SURPRISEE!" on a 320px phone once the real fonts load.
- Real Android device, audio output and ambient.mp3 (still missing) as noted in the v1 handoff below.

---

# PROJECT_HANDOFF — Beyond the Event Horizon

Last updated: session 1 (2026-11-11). **Read this before continuing. Do not repeat the audit.**

## Architecture (unchanged file layout)
```
index.html            markup for all 6 scenes, audio dock, flash overlay, black-hole <video>
css/main.css          single stylesheet (sections 01–26)
js/config.js          BEYOND_CONFIG: messages, loadingFacts, loadingFactInterval, descentDuration, musicPath, sfxPath
js/audio.js           BeyondAudio (music + SFX, volume, dock buttons)
js/scenes.js          BeyondScenes.show(name); sets body[data-scene], flash, video play/pause, fires "beyond:scene"
js/starfield.js       canvas stars + BeyondStarfield.setWarp(0..1) (streaming stars during Descent)
js/interactions.js    scene flow, descent timer, loading facts, constellation, letter, finale, replay/Escape
js/app.js             tiny bootstrap + module-missing warnings
assets/audio/SFX/*.wav   5 synthesized SFX      assets/video/Black_Hole_..._1080.webm
```
Scene flow: intro → descent (timed, descentDuration) → whitehole → universe → letter → finale (replay → intro).

## Completed this session
- **Black-hole video** was a loose element visible on EVERY scene and caused horizontal overflow on phones (page was 450px wide on a 360px screen). Now ONE fixed layer, visible only in Intro/Descent, paused otherwise. Descent drives it (`--descent` 0..1): it slides to centre, grows, fades; starfield streams outward.
- **Scene flow bug:** the White Hole button went straight to the Letter and the Universe scene was unreachable. Now White Hole → Universe → Letter. Button relabelled "OPEN YOUR LETTER" → "ENTER THE UNIVERSE" (one-line revert in index.html `#emergeButton` + interactions.js if the skip was intentional).
- **Audio:** SFX paths used `assets/audio/sfx/` but the folder is `SFX` (404 on case-sensitive hosts). Fixed + paths now in config. Duplicate `id="soundToggle"` removed (the header ♫ button was a dead duplicate; the dock SFX button now works). Volume bar was permanently `display:none !important` on mobile — now hidden by default, shown on VOL tap. SFX no longer stack (previous fades out). Auto-start never overrides a user pause. Status text is now screen-reader-only (dock stays minimal). Music element no longer requests the file until play.
- **Loading facts** now read from `config.loadingFacts` (same displayed text as before), 1700 ms interval, fade swap, timers cleaned on every exit from Descent (Escape during descent previously still jumped to the White Hole).
- **Letter presentation only:** removed `white-space: pre-line` that broke the first paragraph at every source line; fixed `<h1>…</h2>` mismatch (now h2) and "Dear K'Vitha," h2→h3 (tag only); refined title/salutation hierarchy, 21px/1.7 body, mobile padding; envelope "For you" no longer clipped by the flap; opening twice no longer replays chime; letter scene scroll resets.
- **CSS repairs:** invalid `opacity: 0,3`, `line-height: 1,05`, wrong keyframe name `rayPulseA`, animated `filter: blur` removed, duplicate `.black-hole` rules merged, unused `.blackhole-video` block merged, `#experience{overflow:hidden}` (inactive scenes' scale overshoot widened the page), scenes `overflow-x:hidden`.
- **Universe layout:** mobile was a squeezed horizontal flex row (fixed: column). Desktop now a grid (was absolute offsets that overlapped on ≤768px-tall windows); NEXT/Continue button sticky so it can never fall below the fold.
- **Buttons:** primary buttons 12px text, ≥50px tall. Dock buttons 34px (38px mobile).
- **Transitions added:** white flash Descent→White Hole; depth-scale entrance for Descent; slow rise for Finale; twinkling finale stars (the `.finale-stars` div previously had no content/CSS).
- **Performance:** starfield pauses on hidden tab / reduced motion, resize debounced, pointer listener removed; video paused off-scene; white-hole split-ray pseudo layers disabled on phones.
- Removed dead markup: empty intro `div.black-hole` (`.bh-*` had no CSS); removed global click handler in app.js that called `playSfx()` with no name (console warning on every click).

## Files modified
index.html, css/main.css, js/config.js, js/audio.js, js/scenes.js, js/starfield.js, js/interactions.js, js/app.js, README.txt (+ this file). Assets untouched. Original backup was kept outside the project during the session.

## Verified (automated, headless Chromium, real clicks) — 128 checks, 0 failures
Sizes: 360×740, 320×640 (touch/mobile), 1366×768, 1280×600. Checked: no horizontal overflow on intro/descent/white hole/universe/letter/finale; intro & NEXT buttons inside viewport and ≥44px; volume bar hidden → shown on VOL → hidden; SFX toggle; loading facts shown in order, interval ≈1.7 s; descent ≈ 5.2 s; flow intro→descent→whitehole→universe→letter→finale→replay; letter scrolls and final button visible and not under dock; Escape mid-descent leaves no stray timer; no duplicate ids; no console errors (besides expected missing music); no SFX 404s; reduced-motion full run reaches finale with no errors. Universe overlap measurement at 6 viewport sizes: no overlaps.
Also compared screenshots by eye for all scenes at mobile and desktop.

## NOT verified / known issues
- **`assets/audio/ambient.mp3` does not exist in the project.** Music button therefore cannot play; a toast says so when the user taps it. Add the file (or change `musicPath` in config.js). Audible playback of music/SFX could not be verified (headless browser has no audio output); only that requests succeed and no errors occur.
- Real Android device/browser testing not possible; tested with emulated viewports only. Frame rate / battery not measured.
- Google Fonts could not load in the test sandbox (no network) → tested with fallback fonts; check Cormorant Garamond / DM Sans spacing once online.
- Black-hole video shows a hard horizontal edge in the lower arc when scaled during Descent; this looks inherent to the video content. Not changed.
- Intro scroll-note still says "A JOURNEY IN FIVE CHAPTERS" while there are six scenes (kept: user wording).
- Intro/White Hole buttons stay left-aligned with their left-aligned text blocks (Universe & Letter buttons are centered).
- On a 320×640 phone the sticky Continue button can touch the "THE QUIET WORLD" label at first view.

## Letter preservation confirmation
Text of `<article id="letterContent">` (685 words incl. headings/signature) is **byte-identical after whitespace normalization** to the original (SHA-256 `9758351ff5bc816a6ee98cf39c9f7e245f861fe72edcc0e07c92b56dc8a0a446`), and the rendered text in the browser matched it on all 4 viewports. No wording changed. Only tags/CSS around it changed (see above).

## Design decisions to keep
Cinematic palette (ink/gold/violet), Cormorant Garamond + DM Sans, per-scene directional entrances (WhiteHole rises from below, Universe pieces from top/left/right/bottom, Letter from right, Descent scales from depth, Finale rises). Audio UI stays minimal (VOL reveals the slider).

## Next steps
1. Add `assets/audio/ambient.mp3`; test audio on a real Android phone.
2. Decide whether the White Hole → Universe routing/label is what you want.
3. Optional polish: Finale composition (stars + closing line), per-scene SFX timing, intro/white-hole button centering on mobile.
