import { EventHandler } from 'react';
import { calcMediaSegment } from './detect';
import { makeDescriptorPatch, makePropertyPatch } from './patch';
import { MediaStorage } from './storage';

function start() {
  window.document.body.style.backgroundColor = 'black';
  const storage = new MediaStorage();
  console.debug('%c inject.app start()', 'background: #eeeeee; color: #c00c00');

  function handleSourceBufferUpdateEnd(callback: EventListener) {
    return (e: Event) => {
      if (e.target instanceof SourceBuffer) {
        const sourceBuffer = e.target;
        const { sourceBufferInfo } = storage.findSourceBufferInfo(sourceBuffer);
        if (sourceBufferInfo && sourceBufferInfo.isVideo) {
          const mediaSegment = calcMediaSegment(e.target);
          sourceBufferInfo.segments.push(mediaSegment);
          console.log('handleSourceBufferUpdateEnd', mediaSegment);
        }
      }
      callback(e);
    };
  }

  makePropertyPatch(EventTarget.prototype, 'addEventListener', {
    apply: {
      loggerBefore(_, eventTarget, args) {
        if (args[0] === 'updateend' && eventTarget instanceof SourceBuffer) {
          const sourceBuffer = eventTarget;
          const { sourceBufferInfo } =
            storage.findSourceBufferInfo(sourceBuffer);
          if (sourceBufferInfo && sourceBufferInfo.isVideo) {
            if (sourceBufferInfo.onUpdateEndMock) {
              console.debug(`SKIP SourceBuffer.addEventListener('updateend')`);
            } else {
              sourceBufferInfo.onUpdateEndOriginal = args[1] as EventListener;
              sourceBufferInfo.onUpdateEndMock = handleSourceBufferUpdateEnd(
                sourceBufferInfo.onUpdateEndOriginal,
              );
              args[1] = sourceBufferInfo.onUpdateEndMock;
              console.debug(`SourceBuffer.addEventListener('updateend')`);
            }
          }
        }
      },
    },
  });
  makePropertyPatch(EventTarget.prototype, 'removeEventListener', {
    apply: {
      loggerBefore(_, eventTarget, args) {
        if (args[0] === 'updateend' && eventTarget instanceof SourceBuffer) {
          const sourceBuffer = eventTarget;
          const { sourceBufferInfo } =
            storage.findSourceBufferInfo(sourceBuffer);
          if (sourceBufferInfo && sourceBufferInfo.isVideo) {
            if (sourceBufferInfo.onUpdateEndMock) {
              args[1] = sourceBufferInfo.onUpdateEndMock;
              sourceBufferInfo.onUpdateEndMock = undefined;
              sourceBufferInfo.onUpdateEndOriginal = undefined;
              console.debug(`SourceBuffer.removeEventListener('updateend')`);
            } else {
              console.debug(
                `SKIP SourceBuffer.removeEventListener('updateend')`,
              );
            }
          }
        }
      },
    },
  });
  makeDescriptorPatch(SourceBuffer.prototype, 'timestampOffset', {
    set: {
      loggerBefore(_, value) {
        console.debug(`SourceBuffer.timestampOffset=%s`, value);
      },
    },
  });
  makePropertyPatch(MediaSource.prototype, 'addSourceBuffer', {
    apply: {
      loggerAfter: (sourceBuffer, _, mediaSource, args) => {
        storage.addByMediaSource(mediaSource);
        const mimeType = args[0];
        storage.addMimeType(sourceBuffer, mimeType);
        if (mimeType.includes('video')) {
          console.debug(`MediaSource.addSourceBuffer(video)`, mimeType);
        }
      },
    },
  });
  makePropertyPatch(SourceBuffer.prototype, 'appendBuffer', {
    apply: {
      loggerBefore: (_, sourceBuffer, args) => {
        const { sourceBufferInfo } = storage.findSourceBufferInfo(sourceBuffer);
        if (sourceBufferInfo && sourceBufferInfo.isVideo) {
          if (args[0] instanceof Uint8Array) {
            console.debug(
              `SourceBuffer.appendBuffer(Uint8Array)`,
              args[0].byteOffset,
              args[0].byteLength,
              storage.find({ sourceBuffer }),
            );
          } else if (args[0] instanceof DataView) {
            console.debug(
              `SourceBuffer.appendBuffer(DataView)`,
              args[0].byteOffset,
              args[0].byteLength,
              storage.find({ sourceBuffer }),
            );
          } else if (args[0] instanceof ArrayBuffer) {
            console.debug(
              `SourceBuffer.appendBuffer(ArrayBuffer)`,
              args[0].byteLength,
              storage.find({ sourceBuffer }),
            );
          }
        }
      },
    },
  });
  makePropertyPatch(URL, 'createObjectURL', {
    apply: {
      loggerAfter: (url, _, __, args) => {
        const mediSource = args[0];
        if (mediSource instanceof MediaSource) {
          console.debug(
            `URL.createObjectURL(mediaSource)`,
            storage.assignToAny(
              { mediaSource: mediSource },
              { mediaSource: mediSource, mediaSourceUrl: url },
            ),
          );
        }
      },
    },
  });
}

start();
