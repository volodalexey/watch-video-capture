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
  return { info: new Map(), ...partial };
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
  } else if (Number.isFinite(item.htmlVideoElement.duration)) {
    duration = item.htmlVideoElement.duration;
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
  return {
    mediaId: item.mediaId,
    mediaIdHash: item.mediaIdHash,
    mediaSourceUrl: item.mediaSourceUrl,
    duration: item.htmlVideoElement.duration,
    buffered: serializeTimeRanges(item.htmlVideoElement.buffered),
    seekable: serializeTimeRanges(item.htmlVideoElement.seekable),
  };
}
