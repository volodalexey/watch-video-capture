# Browser extension - Watch any video and capture it

- [Chrome Web Store](https://chromewebstore.google.com/detail/watch-video-capture/injfmoogklccgcgdfldnkfhhjlbmmbio)

- [Firefox Extensions](https://addons.mozilla.org/en-US/firefox/addon/watch-video-capture/)

## Overview

This extension captures/copies video/audio segments when they are sent into `video`/`audio` (`HTMLVideoElement`/`HTMLAudioElement`/`HTMLSourceElement`).

If you open `Web Developer Tools` and see `blob:http` in `url`:

```html
<video
  src="blob:https://somedomain.com/457f8e80-1092-4d03-9815-3e0fab05268b"
></video>
```

Or this

```html
<video>
  <source
    src="blob:https://somedomain.com/d14a888e-c685-48b4-a127-aa78a626aef4"
  />
</video>
```

Or this

```html
<audio
  src="blob:https://somedomain.com/48cdd6ed-a595-4ed9-9994-19322612d2f1"
></audio>
```

In all above cases this extension should work.

## Steps to do (Quick start guide)

- Install extension
- Reload current page with video/audio that needs to be captured
- Rewind the video/audio to the beginning, select preferred quality and click play
- Watch/listen to the end
- Open extension dialog, click on 💾 icon
- You should see download modal
- Click on `output` files video/audio if available
- Merge downloaded video and audio into one file with external program (e.g. `ffmpeg -i video.mp4 -i audio.m4a -map 0:v -map 1:a -c copy -shortest merged.mkv`)

## Caveats

- Use this extension only if you need to capture video/audio segments. Using it on daily basis overflow your storage (IndexedDB)!
- Clear all captured items when they don't need anymore
- Size of segments that can be stored in browser depends on the browser

# How it works

DOM `<source>` element in BOM is `HTMLSourceElement`.
In most cases JavaScript code creates `MediaSource` and appends `SourceBuffer` segments.
Extension patches above methods and saves captured segments into `IndexedDB`.

# Development

## Install packages

```sh
npm i
```

## Build extension files

For _Chromium_

```sh
npm run build
```

Or

```sh
npm run build-chromium
```

For _Firefox_

```sh
npm run build-firefox
```

Copy result `dist` folder to browser extensions or specify `dist` folder as unpacked extension in developer mode

## Develop mode

For _Chromium_

```sh
npm run dev
```

Or

```sh
npm run dev-chromium
```

For _Firefox_

```sh
npm run dev-firefox
```

Above starts Vite in build and watch mode. Whenever you change files Vite will re-build all files for browser extension (hot reload impossible to implement for background scripts, only manual browser extension reload).
