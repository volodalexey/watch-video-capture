import { printTimeRanges } from './detect';
import { makeDescriptorPatch, makePropertyPatch } from './patch';
import { MediaStorage } from './MediaStorage';
import { sendInjectMessage } from '../common/message';

function start() {
  const storage = new MediaStorage();
  console.debug('%c inject.app start()', 'background: #eeeeee; color: #c00c00');

  function handleSourceBufferUpdateEnd(callback: EventListener) {
    return (e: Event) => {
      if (e.target instanceof SourceBuffer) {
        const sourceBuffer = e.target;
        const { item, sourceBufferInfo } =
          storage.findSourceBufferInfo(sourceBuffer);
        if (sourceBufferInfo && sourceBufferInfo.isVideo) {
          console.debug(
            item.mediaSource.duration,
            item.htmlVideoElement.duration,
          );
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
            sendInjectMessage({
              type: 'buffer',
              payload: { buffer: Array.from(args[0]) },
            });
            console.debug(
              `SourceBuffer.appendBuffer(Uint8Array)`,
              args[0].byteOffset,
              args[0].byteLength,
              storage.find({ sourceBuffer }),
            );
          } else if (args[0] instanceof DataView) {
            sendInjectMessage({
              type: 'buffer',
              payload: {
                buffer: Array.from(new Uint8Array(args[0].buffer)),
              },
            });
            console.debug(
              `SourceBuffer.appendBuffer(DataView)`,
              args[0].byteOffset,
              args[0].byteLength,
              storage.find({ sourceBuffer }),
            );
          } else if (args[0] instanceof ArrayBuffer) {
            sendInjectMessage({
              type: 'buffer',
              payload: { buffer: Array.from(new Uint8Array(args[0])) },
            });
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
        const mediaSource = args[0];
        if (mediaSource instanceof MediaSource) {
          const item = storage.addByMediaSource(mediaSource);
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
          const { item } = storage.find({ mediaSourceUrl: value });
          if (item) {
            item.htmlSourceElement = target;
            if (
              target.parentElement &&
              target.parentElement instanceof HTMLVideoElement
            ) {
              MediaStorage.setHTMLVideoElement(item, target.parentElement);
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
          const { item } = storage.find({ mediaSourceUrl: value });
          if (item) {
            if (target instanceof HTMLVideoElement) {
              MediaStorage.setHTMLVideoElement(item, target);
              console.debug(`HTMLVideoElement.src=%s`, value);
            } else if (
              target.parentElement &&
              target.parentElement instanceof HTMLVideoElement
            ) {
              MediaStorage.setHTMLVideoElement(item, target.parentElement);
              console.debug(`[parent]HTMLVideoElement.src=%s`, value);
            }
          }
        }
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
          const { item } = storage.find({ htmlSourceElement: value });
          if (item) {
            MediaStorage.setHTMLVideoElement(item, node);
            console.debug(`HTMLVideoElement.appendChild(HTMLSourceElement)`);
          }
        }
      },
    },
  });
}

start();
