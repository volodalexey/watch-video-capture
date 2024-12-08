import { printTimeRanges } from './detect';
import { makeDescriptorPatch, makePropertyPatch } from './patch';
import { MediaStorage } from './MediaStorage';
import { IndexedDBStorage } from './IndexedDBStorage';
import {
  checkMediaId,
  setHTMLVideoElement,
} from './MediaStorage/MediaStorage.utils';
import { createBufferItem } from './IndexedDBStorage/IndexedDBStorage.utils';
import { getExtensionByMimeType } from '@/common/browser';
import { DownloadPopupItem, renderDownloadPopup } from './ui';

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

  function handleMediaSourceEnded(e: Event) {
    if (e.target instanceof MediaSource) {
      const { item } = mediaStorage.find({ mediaSource: e.target });
      if (item && item.sourceEndedCalled === false) {
        item.sourceEndedCalled = true;
        indexedDbStorage.getAllByMediaIndex(item.mediaIdHash).then((result) => {
          const videoSegments = result.filter((segment) => segment.isVideo);
          const audioSegments = result.filter((segment) => segment.isAudio);

          const downloadItems: DownloadPopupItem[] = [];
          if (videoSegments.length) {
            videoSegments.sort((a, b) => a.index - b.index);
            const detected = getExtensionByMimeType(videoSegments[0].mimeType);
            const blob = new Blob(
              videoSegments.map((r) => r.buffer),
              { type: detected?.mimeType },
            );
            const href = window.URL.createObjectURL(blob);
            downloadItems.push({
              href,
              fileName: detected.extension
                ? `output.${detected.extension}`
                : 'unknown_video',
            });
          }
          if (audioSegments.length) {
            audioSegments.sort((a, b) => a.index - b.index);
            const detected = getExtensionByMimeType(audioSegments[0].mimeType);
            const blob = new Blob(
              audioSegments.map((r) => r.buffer),
              { type: detected?.mimeType },
            );
            const href = window.URL.createObjectURL(blob);
            downloadItems.push({
              href,
              fileName: detected.extension
                ? `output.${detected.extension}`
                : 'unknown_audio',
            });
          }

          document.body.insertAdjacentHTML(
            'afterbegin',
            renderDownloadPopup(downloadItems),
          );
          const dialog = document.body.children[0] as HTMLDialogElement;
          const closeButton = dialog.querySelector<HTMLButtonElement>('button');
          dialog.showModal();
          closeButton.addEventListener(
            'click',
            () => {
              dialog.close();
              dialog.remove();
            },
            { once: true },
          );
        });
      }
    }
  }

  // makePropertyPatch(EventTarget.prototype, 'addEventListener', {
  //   apply: {
  //     loggerBefore(_, eventTarget, args) {
  //       if (args[0] === 'updateend' && eventTarget instanceof SourceBuffer) {
  //         const sourceBuffer = eventTarget;
  //         const { sourceBufferInfo } =
  //           mediaStorage.findSourceBufferInfo(sourceBuffer);
  //         if (sourceBufferInfo && sourceBufferInfo.isVideo) {
  //           if (sourceBufferInfo.onUpdateEndMock) {
  //             console.debug(`SKIP SourceBuffer.addEventListener('updateend')`);
  //           } else {
  //             sourceBufferInfo.onUpdateEndOriginal = args[1] as EventListener;
  //             sourceBufferInfo.onUpdateEndMock = handleSourceBufferUpdateEnd(
  //               sourceBufferInfo.onUpdateEndOriginal,
  //             );
  //             args[1] = sourceBufferInfo.onUpdateEndMock;
  //             console.debug(`SourceBuffer.addEventListener('updateend')`);
  //           }
  //         }
  //       }
  //     },
  //   },
  // });
  // makePropertyPatch(EventTarget.prototype, 'removeEventListener', {
  //   apply: {
  //     loggerBefore(_, eventTarget, args) {
  //       if (args[0] === 'updateend' && eventTarget instanceof SourceBuffer) {
  //         const sourceBuffer = eventTarget;
  //         const { sourceBufferInfo } =
  //           mediaStorage.findSourceBufferInfo(sourceBuffer);
  //         if (sourceBufferInfo && sourceBufferInfo.isVideo) {
  //           if (sourceBufferInfo.onUpdateEndMock) {
  //             args[1] = sourceBufferInfo.onUpdateEndMock;
  //             sourceBufferInfo.onUpdateEndMock = undefined;
  //             sourceBufferInfo.onUpdateEndOriginal = undefined;
  //             console.debug(`SourceBuffer.removeEventListener('updateend')`);
  //           } else {
  //             console.debug(
  //               `SKIP SourceBuffer.removeEventListener('updateend')`,
  //             );
  //           }
  //         }
  //       }
  //     },
  //   },
  // });
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
        mediaStorage.addByMediaSource(mediaSource, handleMediaSourceEnded);
        const mimeType = args[0];
        mediaStorage.addMimeType(sourceBuffer, mimeType);
        console.debug(`MediaSource.addSourceBuffer()`, mimeType);
      },
    },
  });
  makePropertyPatch(MediaSource.prototype, 'removeSourceBuffer', {
    apply: {
      loggerBefore: (_, __, args) => {
        const sourceBuffer = args[0];
        console.debug(`MediaSource.removeSourceBuffer()`, sourceBuffer);
      },
    },
  });
  makePropertyPatch(MediaSource.prototype, 'endOfStream', {
    apply: {
      loggerBefore: () => {
        console.debug(`MediaSource.endOfStream()`);
      },
    },
  });
  makePropertyPatch(MediaSource.prototype, 'setLiveSeekableRange', {
    apply: {
      loggerBefore: (_, __, args) => {
        const start = args[0];
        const end = args[1];
        console.debug(`MediaSource.setLiveSeekableRange(${start}, ${end})`);
      },
    },
  });
  makePropertyPatch(MediaSource.prototype, 'clearLiveSeekableRange', {
    apply: {
      loggerBefore: () => {
        console.debug(`MediaSource.clearLiveSeekableRange()`);
      },
    },
  });
  makePropertyPatch(SourceBuffer.prototype, 'changeType', {
    apply: {
      loggerBefore: (_, __, args) => {
        const type = args[0];
        console.debug(`SourceBuffer.changeType(${type})`);
      },
    },
  });
  makePropertyPatch(SourceBuffer.prototype, 'remove', {
    apply: {
      loggerBefore: (_, __, args) => {
        const start = args[0];
        const end = args[1];
        console.debug(`SourceBuffer.remove(${start}, ${end})`);
      },
    },
  });
  makePropertyPatch(SourceBuffer.prototype, 'appendBuffer', {
    apply: {
      loggerBefore: (_, sourceBuffer, args) => {
        const { sourceBufferInfo, item } =
          mediaStorage.findSourceBufferInfo(sourceBuffer);
        if (sourceBufferInfo) {
          checkMediaId(item);
          if (args[0] instanceof DataView) {
            const dataView = args[0];
            const buffer = dataView.buffer.slice(
              dataView.byteOffset,
              dataView.byteOffset + dataView.byteLength,
            );
            indexedDbStorage.saveBufferItem(
              createBufferItem({
                item,
                sourceBufferInfo,
                buffer,
              }),
            );
            console.debug(
              sourceBufferInfo.mimeType,
              `appendBuffer(DataView=${buffer.byteLength})`,
            );
          } else if (args[0] instanceof ArrayBuffer) {
            const arrayBuffer = args[0];
            indexedDbStorage.saveBufferItem(
              createBufferItem({
                item,
                sourceBufferInfo,
                buffer: arrayBuffer,
              }),
            );
            console.debug(
              sourceBufferInfo.mimeType,
              `appendBuffer(ArrayBuffer=${arrayBuffer.byteLength})`,
            );
          } else if (args[0] instanceof Uint8Array) {
            const uint8Array = args[0];
            indexedDbStorage.saveBufferItem(
              createBufferItem({
                item,
                sourceBufferInfo,
                buffer: uint8Array.buffer,
              }),
            );
            console.debug(
              sourceBufferInfo.mimeType,
              `appendBuffer(Uint8Array=${uint8Array.byteLength})`,
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
          const item = mediaStorage.addByMediaSource(
            mediaSource,
            handleMediaSourceEnded,
          );
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

start();
// if (globalThis.top === globalThis.self) {
//   start();
// }
