# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Project memory (user profile, decisions; index only, open linked files when relevant):

@.claude/memory/MEMORY.md

## What this is

A browser page that renders a rotating 3D Christmas tree out of ASCII glyphs on a `<canvas>`. Around the tree there is snow and presents falling from the sky. A glass-style music player plays a looping carol.

The app is three files with no build step: `index.html` (markup only), `style.css` and `script.js` (one IIFE, loaded by a plain `<script src>` at the end of `<body>`, so the DOM already exists when it runs). There is no build step, no package manager, no dependencies and no test suite. The only external loads are Google Fonts. The folder is not a git repository, so deletions cannot be undone. Move files to the Trash with `/usr/bin/trash` instead of using `rm`.

The user communicates in Korean. UI strings and README.md are written in Korean, while code comments are in English.

## Running and checking

- **Run.** Open `index.html` with VS Code Live Server on port 5500, or serve the folder with `python3 -m http.server`. Opening it via `file://` may block `carol.mp3`, so the page falls back to the music box. Browsers block audio until the first click or keypress; the page handles that itself (see Music). A launcher script that opened Chrome with `--autoplay-policy=no-user-gesture-required` existed but the user deleted it, so do not recreate it unless asked.
- **Syntax check:**
  ```sh
  node --check script.js
  ```
- **Headless smoke tests.** `script.js` can be `eval`ed in Node with stubbed `document`, `window`, `Audio`, canvas `ctx` and `requestAnimationFrame`. You can then step `performance.now()` and call the queued rAF callbacks to render N frames, or dump the `fillText` calls as a text snapshot. These harnesses are not kept in the repo; recreate them in the scratchpad when needed. Stub elements need `setAttribute`, `getAttribute`, `contains`, `focus`, `style.setProperty` and `classList.toggle`.
- **Determinism.** `?seed=N` fixes the layout (mulberry32 RNG) and `?speed=N` scales the intro.

## Publishing

`index.html` is also published as a claude.ai artifact at https://claude.ai/artifact/QU74eET2PagUCeT6cP9QSh.

- Republish with the Artifact tool, using the same file path and `files: {"style.css": "style.css", "script.js": "script.js", "carol.mp3": "carol.mp3"}`. These are served next to the page and referenced by relative paths; leaving one out of `files` keeps the previously published copy, so always pass the edited ones.
- An older artifact at https://claude.ai/artifact/4hc2J1YhovFjBqsd9GewZu came from a `tree3d.html` copy that no longer exists. It is no longer updated.

Keep the full document skeleton: `<!doctype html>`, `<meta charset>`, `<head>` and `<body>`. Live Server injects its reload script before `</body>`. Without that tag it injects the script inside `</svg>` elements, which corrupts the DOM and stops the page.

## Architecture (inside `script.js`'s single IIFE)

Data flows one way: **world constants → `buildCloud()` → `Renderer.frame()` → `draw()`**. The steps are driven by `frame()` at 30 fps via rAF.

- **World and camera constants** are at the top. The floor is at y=0 and the tree axis is y. The camera sits on -z (`CAM_D`, `CAM_H`, `PITCH`). `coneR(y)` gives the tiered silhouette.
- **`buildCloud(rng, introSpeed)`** builds the scene once, as parallel typed arrays. For each point it stores:
  - position and normal;
  - colour;
  - `kind` (`K_NEEDLE`, `K_GARLAND`, `K_ORN`, `K_LIGHT`, `K_TRUNK` or `K_GIFT`);
  - `ao`;
  - `aux` (per-kind extra: glyph jitter, light phase, or ribbon flag);
  - `t0` (when the point appears);
  - an anchor (`ax`/`ay`/`az`) used for pop-in and tumble animations.

  The intro is purely data. Each element group gets a start time from a stage schedule (`T_TREE`, `T_TIER`, `T_GARLAND` … `T_TEXT`). `at()` divides by `introSpeed`, and `introSpeed = 0` means "already built".
- **`Renderer`** owns the character grid buffers: `zbuf`, `ch` (glyph codes), `rgb` and `glow`. Everything is drawn through `write(cell, depth, ...)`, which is a per-cell z-test. `project()` returns the camera depth, or -1 when the point is off-screen.
  - The floor is projected once into its own buffers, because it does not rotate.
  - `frame()` draws, in order: floor, sky, tree points, `dropPresents()`, star, snow, then the greeting text.
  - The greeting text uses depth -1, so it is always on top.
  - Shading is half-Lambert plus depth fog. The light value picks a glyph from ramps like `NEEDLE_RAMP`; ornaments add a Blinn specular term.
  - Points whose age is still under `HOT`/`FLASH` are tinted toward white.
- **Falling presents** (`dropPresents`) are separate from the cloud.
  - They are spawned at runtime after `introEnd`.
  - Simple gravity physics, a tumble about the box's local x-axis, and a snap to the nearest quarter-turn on landing. This is why drop boxes use `h === d`.
  - Each rests for `REST` seconds, then fades out.
  - `boxPoints()` is shared with the static gifts under the tree.
- **`draw()`** paints the grid with `fillText`, then does a second pass with `shadowBlur` for cells marked `glow`.
- **`build(withIntro)`** rebuilds the cloud and Renderer. A resize redraws the finished tree, while the `R` key or the "다시 쌓기" button replays the intro.

### Music

- **Primary source:** an `Audio` element for `carol.mp3`, looping.
- **Fallback:** `CarolPlayer`, a Web Audio music box.
  - It plays a `SONGS` table of public-domain carols written in note tokens.
  - Each song is scheduled in full up front. That is why `skip()` closes the AudioContext and builds a new one, and why the 250 ms timer is created only once.
  - It takes over when the mp3 errors, or when the user switches source in the ⋯ menu.
- **Autoplay.** `startMusic()` runs on page load. If `play()` rejects with `NotAllowedError`, `armGesture()` listens in the capture phase for the first `keydown`, `pointerdown`, `pointerup` or `touchend`, and starts playback then. The play button and the `M` key are excluded from this listener; otherwise that one gesture would start the music and then immediately toggle it off.
- **UI sync.** `syncMusic()` and `syncTime()` are the single place that reflects state into the player card. They update classes (`is-playing`, `is-loading`, `is-muted`), aria attributes and the labels. Icon swaps are CSS-only (`.when-on` / `.when-off`).
- **Persistence.** The like and folded states use `localStorage` through a try/catch `store` wrapper.

### Reduced motion

`prefers-reduced-motion` changes several things:
- no intro;
- slower spin;
- 150 snowflakes instead of 2200;
- no runtime falling presents;
- a static equalizer in the folded player pill.

## Music license

`carol.mp3` is "Christmas Jazz" by Tunetank, from Pixabay (Pixabay Content License, no attribution required). Do not download music from YouTube or other copyrighted sources; this request was previously declined.
