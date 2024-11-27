import { hashCode } from '@/common/browser';
import { isAudioSourceBuffer, isVideoSourceBuffer } from '../detect';
import {
  type MediaStorageItem,
  type PartialMediaStorageItem,
  type SourceBufferInfo,
} from './MediaStorage.types';

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
    Omit<SourceBufferInfo, 'mimeType' | 'isVideo' | 'isAudio'>
  > & {
    mimeType: SourceBufferInfo['mimeType'];
  },
): SourceBufferInfo {
  return {
    isVideo: isVideoSourceBuffer(sourceBufferInfo.mimeType),
    isAudio: isAudioSourceBuffer(sourceBufferInfo.mimeType),
    counter: 0,
    ...sourceBufferInfo,
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

export function checkMediaId(item: MediaStorageItem) {
  if (!item.mediaId) {
    item.mediaId = calcUniqueId(item);
    item.mediaIdHash = hashCode(item.mediaId);
  }
}
