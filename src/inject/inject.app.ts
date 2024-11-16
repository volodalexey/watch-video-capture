import { makeMethodPatch } from './patch';
import { MediaStorage } from './storage';

function start() {
  const storage = new MediaStorage();
  console.debug('%c inject.app start()', 'background: #eeeeee; color: #c00c00');

  makeMethodPatch(EventTarget.prototype, 'addEventListener', {
    apply: {
      loggerBefore(_, eventTarget, args) {
        if (eventTarget instanceof MediaSource) {
          console.debug(`MediaSource.addEventListener()`, args);
        } else if (eventTarget instanceof SourceBuffer) {
          console.debug(`SourceBuffer.addEventListener()`, args);
        }
      },
    },
  });
  makeMethodPatch(MediaSource.prototype, 'addSourceBuffer', {
    apply: {
      loggerAfter: (sourceBuffer, _, mediaSource, args) => {
        storage.addByMediaSource(mediaSource);
        const mimeType = args[0];
        sourceBuffer.mimeType = mimeType;
        if (mimeType.includes('audio')) {
          console.debug(`MediaSource.addSourceBuffer(audio)`, mimeType);
        } else if (mimeType.includes('video')) {
          console.debug(`MediaSource.addSourceBuffer(video)`, mimeType);
        }
      },
    },
  });
  makeMethodPatch(SourceBuffer.prototype, 'appendBuffer', {
    apply: {
      loggerBefore: (_, sourceBuffer, args) => {
        if (args[0] instanceof Uint8Array) {
          console.debug(
            `SourceBuffer.appendBuffer(Uint8Array)`,
            sourceBuffer.buffered.length > 0
              ? sourceBuffer.buffered.start(0)
              : -1,
            sourceBuffer.buffered.length > 0
              ? sourceBuffer.buffered.end(0)
              : -1,
            sourceBuffer.timestampOffset,
            args[0].byteLength,
            storage.find({ sourceBuffer }),
          );
        } else if (args[0] instanceof DataView) {
          console.debug(
            `SourceBuffer.appendBuffer(DataView)`,
            sourceBuffer.buffered.length > 0
              ? sourceBuffer.buffered.start(0)
              : -1,
            sourceBuffer.buffered.length > 0
              ? sourceBuffer.buffered.end(0)
              : -1,
            sourceBuffer.timestampOffset,
            args[0].byteLength,
            storage.find({ sourceBuffer }),
          );
        }
      },
    },
  });
  makeMethodPatch(URL, 'createObjectURL', {
    apply: {
      loggerAfter: (url, _, __, args) => {
        if (args[0] instanceof MediaSource) {
          console.debug(
            `createObjectURL(mediaSource)`,
            storage.assignToAny(
              { mediaSource: args[0] },
              { mediaSource: args[0], mediaSourceUrl: url },
            ),
          );
        }
      },
    },
  });
}

start();
