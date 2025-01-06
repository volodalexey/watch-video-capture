import { hashCode } from '@/common/browser';
import { isAudioSourceBuffer, isVideoSourceBuffer } from '../detect';
import {
  type MediaStorageItem,
  type PartialMediaStorageItem,
  type SourceBufferInfo,
} from './MediaStorage.types';
import { TSerializedMediaStorageItem } from '@/common/message';

export function createMediaItem(
  partial: PartialMediaStorageItem = {},
): MediaStorageItem {
  return { info: new Map(), downloadPopupOpen: false, ...partial };
}

export function setHTMLVideoElement(
  item: MediaStorageItem,
  htmlVideoElement: HTMLVideoElement,
) {
  if (item.htmlVideoElement) {
    if (item.htmlVideoElement !== htmlVideoElement) {
      console.warn('Different htmlVideoElement assignment');
    }
  } else {
    item.htmlVideoElement = htmlVideoElement;
  }
}

export function setHTMLAudioElement(
  item: MediaStorageItem,
  htmlAudioElement: HTMLAudioElement,
) {
  if (item.htmlAudioElement) {
    if (item.htmlAudioElement !== htmlAudioElement) {
      console.warn('Different htmlAudioElement assignment');
    }
  } else {
    item.htmlAudioElement = htmlAudioElement;
  }
}

export function createSourceBufferInfo(
  sourceBufferInfo: Partial<
    Omit<SourceBufferInfo, 'mimeType' | 'isVideo' | 'isAudio' | 'onUpdateEnd'>
  > & {
    mimeType: SourceBufferInfo['mimeType'];
    onUpdateEnd: SourceBufferInfo['onUpdateEnd'];
  },
): SourceBufferInfo {
  return {
    isVideo: isVideoSourceBuffer(sourceBufferInfo.mimeType),
    isAudio: isAudioSourceBuffer(sourceBufferInfo.mimeType),
    viewByteOffset: 0,
    rawByteOffset: 0,
    mimeType: sourceBufferInfo.mimeType,
    mimeTypeHash: hashCode(sourceBufferInfo.mimeType),
    onUpdateEnd: sourceBufferInfo.onUpdateEnd,
  };
}

export function calcUniqueId(item: MediaStorageItem): string {
  let duration = 0;
  if (Number.isFinite(item.mediaSource.duration)) {
    duration = item.mediaSource.duration;
  } else if (
    item.htmlVideoElement &&
    Number.isFinite(item.htmlVideoElement.duration)
  ) {
    duration = item.htmlVideoElement.duration;
  } else if (
    item.htmlAudioElement &&
    Number.isFinite(item.htmlAudioElement.duration)
  ) {
    duration = item.htmlAudioElement.duration;
  }
  const sortedValues = Array.from(item.info.values()).sort((a, b) => {
    let aValue = a.isVideo;
    let bValue = b.isVideo;
    if (aValue === bValue) {
      return 0;
    }
    return aValue && !bValue ? -1 : 1;
  });
  const infos: string[] = [];
  for (const { isVideo, isAudio, mimeType } of sortedValues) {
    const infoAV = isVideo ? 'V' : isAudio ? 'A' : '';
    infos.push(`[${infoAV}|${mimeType}]`);
  }
  return `${duration}${infos.join('')}`;
}

export function setItemMediaSourceUrl(item: MediaStorageItem, url: string) {
  item.mediaSourceUrl = url;
}

export function setItemHtmlSourceUrl(
  item: MediaStorageItem,
  element: HTMLSourceElement,
) {
  item.htmlSourceElement = element;
}

export function checkMediaId(item: MediaStorageItem) {
  if (!item.mediaId) {
    item.mediaId = calcUniqueId(item);
    item.mediaIdHash = hashCode(item.mediaId);
  }
}

function serializeTimeRanges(timeRanges: TimeRanges): Array<[number, number]> {
  const serialized: Array<[number, number]> = [];
  for (let i = 0; i < timeRanges.length; i++) {
    const start = timeRanges.start(i);
    const end = timeRanges.end(i);
    serialized.push([start, end]);
  }
  return serialized;
}

export function serializeMediaStorageItem(
  item: MediaStorageItem,
): TSerializedMediaStorageItem {
  const playElement = item.htmlVideoElement || item.htmlAudioElement;
  return {
    mediaId: item.mediaId,
    mediaIdHash: item.mediaIdHash,
    mediaSourceUrl: item.mediaSourceUrl,
    duration: playElement.duration,
    buffered: serializeTimeRanges(playElement.buffered),
    seekable: serializeTimeRanges(playElement.seekable),
  };
}

export function setDownloadPopupOpen(item: MediaStorageItem, open: boolean) {
  item.downloadPopupOpen = open;
}
