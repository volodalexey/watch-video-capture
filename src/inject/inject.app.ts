import { makeDescriptorPatch, makePropertyPatch } from './patch';
import {
  MediaStorage,
  checkMediaId,
  serializeMediaStorageItem,
  setHTMLVideoElement,
  setItemHtmlSourceUrl,
  setItemMediaSourceUrl,
} from './MediaStorage';
import {
  IndexedDBStorage,
  createBufferItem,
  getSerializedBufferItems,
  saveBufferItem,
} from './IndexedDBStorage';
import {
  logInjectApp,
  logInjectSourceBufferTimestamp,
  logInjectSourceBufferEvent,
  logInjectMediaSourceDuration,
  logInjectMediaSourceAppend,
  logInjectMediaSourceRemove,
  logInjectMediaSourceEnd,
  logInjectMediaSourceRange,
  logInjectSourceBufferChange,
  logInjectSourceBufferRemove,
  logInjectSourceBufferAppend,
  logInjectUrlCreate,
  logInjectHtmlSourceSrc,
  logInjectHtmlVideoSrc,
  logInjectHtmlMediaDuration,
  logInjectHtmlVideoAppend,
} from '@/common/logger';
import { showDownloadPopup } from './ui';
import { isContentMessage, sendInjectMessage } from '@/common/message';

function start() {
  const mediaStorage = new MediaStorage();
  const indexedDbStorage = new IndexedDBStorage();
  indexedDbStorage.tryInit();
  logInjectApp('%c inject.app start()', 'background: #eeeeee; color: #c00c00');

  globalThis.addEventListener(
    'message',
    async (e) => {
      if (isContentMessage(e.data)) {
        switch (e.data.type) {
          case 'downloadMediaStorageItem':
            const mediaIdHash = e.data.payload;
            const { item } = mediaStorage.find({ mediaIdHash });
            if (item) {
              showDownloadPopup(indexedDbStorage, item);
            }
            break;
          case 'refreshAllMediaStorageItems':
            for (const item of mediaStorage.store) {
              if (item.mediaIdHash) {
                const captured = await getSerializedBufferItems(
                  indexedDbStorage,
                  item.mediaIdHash,
                );
                sendInjectMessage({
                  type: 'IDBStorageItems',
                  payload: { mediaIdHash: item.mediaIdHash, captured },
                });
              }
            }
            break;
        }
      }
    },
    false,
  );

  function handleSourceBufferUpdateEnd(e: Event) {
    if (e.target instanceof SourceBuffer) {
      const sourceBuffer = e.target;
      const { item, sourceBufferInfo } =
        mediaStorage.findSourceBufferInfo(sourceBuffer);
      if (sourceBufferInfo) {
        const serializedMediaStorageItem = serializeMediaStorageItem(item);
        sendInjectMessage({
          type: 'mediaStorageItem',
          payload: serializedMediaStorageItem,
        });
        logInjectSourceBufferEvent(
          'handleSourceBufferUpdateEnd(%s)',
          sourceBufferInfo.mimeType,
        );
      }
    }
  }

  makeDescriptorPatch(SourceBuffer.prototype, 'timestampOffset', {
    set: {
      loggerBefore(_, value) {
        logInjectSourceBufferTimestamp(
          `SourceBuffer.timestampOffset=%s`,
          value,
        );
      },
    },
  });
  makeDescriptorPatch(MediaSource.prototype, 'duration', {
    set: {
      loggerBefore(_, value) {
        logInjectMediaSourceDuration(`MediaSource.duration=%s`, value);
      },
    },
  });
  makePropertyPatch(MediaSource.prototype, 'addSourceBuffer', {
    apply: {
      loggerAfter: (sourceBuffer, _, mediaSource, args) => {
        mediaStorage.addByMediaSource(mediaSource);
        const mimeType = args[0];
        mediaStorage.addMimeType(
          sourceBuffer,
          mimeType,
          handleSourceBufferUpdateEnd,
        );
        logInjectMediaSourceAppend(`MediaSource.addSourceBuffer()`, mimeType);
      },
    },
  });
  makePropertyPatch(MediaSource.prototype, 'removeSourceBuffer', {
    apply: {
      loggerBefore: (_, __, args) => {
        const sourceBuffer = args[0];
        mediaStorage.clearSourceBuffer(sourceBuffer);
        logInjectMediaSourceRemove(
          `MediaSource.removeSourceBuffer()`,
          sourceBuffer,
        );
      },
    },
  });
  makePropertyPatch(MediaSource.prototype, 'endOfStream', {
    apply: {
      loggerBefore: () => {
        logInjectMediaSourceEnd(`MediaSource.endOfStream()`);
      },
    },
  });
  makePropertyPatch(MediaSource.prototype, 'setLiveSeekableRange', {
    apply: {
      loggerBefore: (_, __, args) => {
        const start = args[0];
        const end = args[1];
        logInjectMediaSourceRange(
          `MediaSource.setLiveSeekableRange(${start}, ${end})`,
        );
      },
    },
  });
  makePropertyPatch(MediaSource.prototype, 'clearLiveSeekableRange', {
    apply: {
      loggerBefore: () => {
        logInjectMediaSourceRange(`MediaSource.clearLiveSeekableRange()`);
      },
    },
  });
  makePropertyPatch(SourceBuffer.prototype, 'changeType', {
    apply: {
      loggerBefore: (_, __, args) => {
        const type = args[0];
        logInjectSourceBufferChange(`SourceBuffer.changeType(${type})`);
      },
    },
  });
  makePropertyPatch(SourceBuffer.prototype, 'remove', {
    apply: {
      loggerBefore: (_, sourceBuffer, args) => {
        const { sourceBufferInfo } =
          mediaStorage.findSourceBufferInfo(sourceBuffer);
        if (sourceBufferInfo) {
          const start = args[0];
          const end = args[1];
          logInjectSourceBufferRemove(
            `SourceBuffer(${sourceBufferInfo.mimeType}).remove(${start}, ${end})`,
          );
        }
      },
    },
  });
  makePropertyPatch(SourceBuffer.prototype, 'appendBuffer', {
    apply: {
      loggerBefore: (_, sourceBuffer, args) => {
        const { sourceBufferInfo, item } =
          mediaStorage.findSourceBufferInfo(sourceBuffer);
        if (sourceBufferInfo) {
          logInjectSourceBufferAppend(
            `${sourceBufferInfo.mimeType} SourceBuffer.appendBuffer()`,
          );
          checkMediaId(item);
          if (ArrayBuffer.isView(args[0])) {
            const typedArray = args[0];
            const buffer = typedArray.buffer.slice(
              typedArray.byteOffset,
              typedArray.byteOffset + typedArray.byteLength,
            );
            saveBufferItem(
              indexedDbStorage,
              createBufferItem({
                item,
                sourceBufferInfo,
                buffer,
                byteOffset: typedArray.byteOffset,
                isView: true,
              }),
            ).then((response) => {
              sendInjectMessage({
                type: 'IDBStorageItems',
                payload: { mediaIdHash: item.mediaIdHash, captured: response },
              });
            });
          } else if (args[0] instanceof ArrayBuffer) {
            const arrayBuffer = args[0];
            saveBufferItem(
              indexedDbStorage,
              createBufferItem({
                item,
                sourceBufferInfo,
                buffer: arrayBuffer,
                isView: false,
              }),
            ).then((response) => {
              sendInjectMessage({
                type: 'IDBStorageItems',
                payload: { mediaIdHash: item.mediaIdHash, captured: response },
              });
            });
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
          setItemMediaSourceUrl(item, url);
          logInjectUrlCreate(`URL.createObjectURL(mediaSource)`, item);
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
            setItemHtmlSourceUrl(item, target);
            if (
              target.parentElement &&
              target.parentElement instanceof HTMLVideoElement
            ) {
              setHTMLVideoElement(item, target.parentElement);
            }
            logInjectHtmlSourceSrc(`HTMLSourceElement.src=%s`, value);
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
              logInjectHtmlVideoSrc(`HTMLVideoElement.src=%s`, value);
            } else if (
              target.parentElement &&
              target.parentElement instanceof HTMLVideoElement
            ) {
              setHTMLVideoElement(item, target.parentElement);
              logInjectHtmlVideoSrc(`[parent]HTMLVideoElement.src=%s`, value);
            }
          }
        }
      },
    },
  });
  makeDescriptorPatch(HTMLMediaElement.prototype, 'duration', {
    set: {
      loggerBefore(_, value) {
        logInjectHtmlMediaDuration(`HTMLMediaElement.duration=%s`, value);
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
            logInjectHtmlVideoAppend(
              `HTMLVideoElement.appendChild(HTMLSourceElement)`,
            );
          }
        }
      },
    },
  });
}

start();
// if (globalThis.top === globalThis.self) {
//   start();
// }
