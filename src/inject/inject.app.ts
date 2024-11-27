import { printTimeRanges } from './detect';
import { makeDescriptorPatch, makePropertyPatch } from './patch';
import { MediaStorage } from './MediaStorage';
import { IndexedDBStorage } from './IndexedDBStorage';
import { hashCode } from '../common/browser';
import {
  checkMediaId,
  setHTMLVideoElement,
} from './MediaStorage/MediaStorage.utils';
import { createBufferItem } from './IndexedDBStorage/IndexedDBStorage.utils';

function start() {
  const mediaStorage = new MediaStorage();
  const indexedDbStorage = new IndexedDBStorage();
  indexedDbStorage.tryInit();
  console.debug('%c inject.app start()', 'background: #eeeeee; color: #c00c00');

  function handleSourceBufferUpdateEnd(callback: EventListener) {
    return (e: Event) => {
      if (e.target instanceof SourceBuffer) {
        const sourceBuffer = e.target;
        const { item, sourceBufferInfo } =
          mediaStorage.findSourceBufferInfo(sourceBuffer);
        if (sourceBufferInfo && sourceBufferInfo.isVideo) {
          console.debug(
            'handleSourceBufferUpdateEnd buffered=%s seekable=%s',
            printTimeRanges(item.htmlVideoElement.buffered),
            printTimeRanges(item.htmlVideoElement.seekable),
          );
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
            mediaStorage.findSourceBufferInfo(sourceBuffer);
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
            mediaStorage.findSourceBufferInfo(sourceBuffer);
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
  makeDescriptorPatch(MediaSource.prototype, 'duration', {
    set: {
      loggerBefore(_, value) {
        console.debug(`MediaSource.duration=%s`, value);
      },
    },
  });
  makePropertyPatch(MediaSource.prototype, 'addSourceBuffer', {
    apply: {
      loggerAfter: (sourceBuffer, _, mediaSource, args) => {
        mediaStorage.addByMediaSource(mediaSource);
        const mimeType = args[0];
        mediaStorage.addMimeType(sourceBuffer, mimeType);
        if (mimeType.includes('video')) {
          console.debug(`MediaSource.addSourceBuffer(video)`, mimeType);
        }
      },
    },
  });
  makePropertyPatch(SourceBuffer.prototype, 'appendBuffer', {
    apply: {
      loggerBefore: (_, sourceBuffer, args) => {
        const { sourceBufferInfo, item } =
          mediaStorage.findSourceBufferInfo(sourceBuffer);
        if (sourceBufferInfo && sourceBufferInfo.isVideo) {
          checkMediaId(item);
          console.debug(item.mediaId, item.mediaIdHash);
          if (args[0] instanceof Uint8Array) {
            indexedDbStorage.saveBlob(
              createBufferItem(
                item.mediaIdHash,
                sourceBufferInfo,
                args[0].buffer,
              ),
            );
            console.debug(
              `SourceBuffer.appendBuffer(Uint8Array)`,
              args[0].byteOffset,
              args[0].byteLength,
              mediaStorage.find({ sourceBuffer }),
            );
          } else if (args[0] instanceof DataView) {
            console.debug(
              `SourceBuffer.appendBuffer(DataView)`,
              args[0].byteOffset,
              args[0].byteLength,
              mediaStorage.find({ sourceBuffer }),
            );
          } else if (args[0] instanceof ArrayBuffer) {
            console.debug(
              `SourceBuffer.appendBuffer(ArrayBuffer)`,
              args[0].byteLength,
              mediaStorage.find({ sourceBuffer }),
            );
          }
        }
      },
    },
  });
  makePropertyPatch(URL, 'createObjectURL', {
    apply: {
      loggerAfter: (url, _, __, args) => {
        const mediaSource = args[0];
        if (mediaSource instanceof MediaSource) {
          const item = mediaStorage.addByMediaSource(mediaSource);
          item.mediaSourceUrl = url;
          console.debug(`URL.createObjectURL(mediaSource)`, item);
        }
      },
    },
  });
  makeDescriptorPatch(HTMLSourceElement.prototype, 'src', {
    set: {
      loggerBefore(target, value) {
        if (target instanceof HTMLSourceElement) {
          const { item } = mediaStorage.find({ mediaSourceUrl: value });
          if (item) {
            item.htmlSourceElement = target;
            if (
              target.parentElement &&
              target.parentElement instanceof HTMLVideoElement
            ) {
              setHTMLVideoElement(item, target.parentElement);
            }
            console.debug(`HTMLSourceElement.src=%s`, value);
          }
        }
      },
    },
  });
  makeDescriptorPatch(HTMLMediaElement.prototype, 'src', {
    set: {
      loggerBefore(target, value) {
        if (target instanceof HTMLElement) {
          const { item } = mediaStorage.find({ mediaSourceUrl: value });
          if (item) {
            if (target instanceof HTMLVideoElement) {
              setHTMLVideoElement(item, target);
              console.debug(`HTMLVideoElement.src=%s`, value);
            } else if (
              target.parentElement &&
              target.parentElement instanceof HTMLVideoElement
            ) {
              setHTMLVideoElement(item, target.parentElement);
              console.debug(`[parent]HTMLVideoElement.src=%s`, value);
            }
          }
        }
      },
    },
  });
  makeDescriptorPatch(HTMLMediaElement.prototype, 'duration', {
    set: {
      loggerBefore(_, value) {
        console.debug(`HTMLMediaElement.duration=%s`, value);
      },
    },
  });
  makePropertyPatch(Node.prototype, 'appendChild', {
    apply: {
      loggerBefore(_, node, args) {
        const value = args[0];
        if (
          node instanceof HTMLVideoElement &&
          value instanceof HTMLSourceElement
        ) {
          const { item } = mediaStorage.find({ htmlSourceElement: value });
          if (item) {
            setHTMLVideoElement(item, node);
            console.debug(`HTMLVideoElement.appendChild(HTMLSourceElement)`);
          }
        }
      },
    },
  });
}

if (globalThis.top === globalThis.self) {
  start();
}
