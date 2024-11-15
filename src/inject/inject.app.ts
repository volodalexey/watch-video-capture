import { makeMethodPatch } from './patch';

function start() {
  let captured: {
    mediaSourceUrl: string | null;
    mediaSource: MediaSource | null;
    audioSourceBuffer: SourceBuffer | null;
    videoSourceBuffer: SourceBuffer | null;
  } = {
    mediaSourceUrl: null,
    mediaSource: null,
    audioSourceBuffer: null,
    videoSourceBuffer: null,
  };
  console.debug('%c inject.app start()', 'background: #eeeeee; color: #c00c00');

  makeMethodPatch(MediaSource.prototype, 'addSourceBuffer', {
    apply: {
      loggerAfter: (sourceBuffer, _, mediaSource, args) => {
        captured.mediaSource = mediaSource;
        const mimeType = args[0];
        if (mimeType.includes('audio')) {
          captured.audioSourceBuffer = sourceBuffer;
        } else if (mimeType.includes('video')) {
          captured.videoSourceBuffer = sourceBuffer;
        }
        console.debug(`MediaSource.addSourceBuffer(mimeType="%s")`, mimeType);
      },
    },
  });
  makeMethodPatch(SourceBuffer.prototype, 'appendBuffer', {
    apply: {
      loggerBefore: (_, __, args) => {
        if (args[0] instanceof Uint8Array) {
          console.debug(`SourceBuffer.appendBuffer(BufferSource)`, args[0]);
        }
      },
    },
  });
  makeMethodPatch(URL, 'createObjectURL', {
    apply: {
      loggerAfter: (url, _, __, args) => {
        if (args[0] instanceof MediaSource) {
          captured.mediaSourceUrl = url;
          console.debug(`createObjectURL(mediaSource)`, url);
        }
      },
    },
  });
}

start();
