import { logInjectIDBBufferItemCreate } from '@/common/logger';
import { type TSerializedBufferStorageIDBItem } from '@/common/message';

import { type MediaStorageItem, type SourceBufferInfo } from '../MediaStorage';
import { type BufferStorageIDBItem } from './IndexedDBStorage.types';

export function createBufferItem({
  item,
  sourceBufferInfo,
  buffer,
  byteOffset,
  isView,
}: {
  item: MediaStorageItem;
  sourceBufferInfo: SourceBufferInfo;
  buffer: ArrayBufferLike;
  byteOffset?: number;
  isView: boolean;
}): BufferStorageIDBItem {
  let incrementedBy0 = false;
  let viewByteOffset = 0;
  let viewByteEnd = 0;
  let rawByteOffset = 0;
  let rawByteEnd = 0;
  if (isView) {
    if (byteOffset === 0) {
      viewByteOffset = sourceBufferInfo.viewByteOffset;
      sourceBufferInfo.viewByteOffset += buffer.byteLength;
      incrementedBy0 = true;
    } else {
      viewByteOffset = byteOffset;
    }
    viewByteEnd = viewByteOffset + buffer.byteLength;
  } else {
    rawByteOffset = sourceBufferInfo.rawByteOffset;
    sourceBufferInfo.rawByteOffset += buffer.byteLength;
    incrementedBy0 = true;
    rawByteEnd = rawByteOffset + buffer.byteLength;
  }
  const { isVideo, isAudio, mimeType } = sourceBufferInfo;
  const bufferPart = isView
    ? `${viewByteOffset}+${buffer.byteLength}=>${viewByteEnd}`
    : `${rawByteOffset}+${buffer.byteLength}=>${rawByteEnd}`;
  const id = `${item.mediaIdHash}-${isVideo ? '📺' : isAudio ? '🎵' : '~'}-${isView ? '👁️' : '💾'}${incrementedBy0 ? '0️⃣' : '❎'}-${bufferPart}`;
  logInjectIDBBufferItemCreate(`createBufferItem(${id})`);
  return {
    id,
    mediaIdHash: item.mediaIdHash,
    mimeType,
    isVideo,
    isAudio,
    isView,
    viewByteOffset,
    viewByteEnd,
    rawByteOffset,
    rawByteEnd,
    buffer,
  };
}

export function serializeBufferStorageIDBItem(
  item: BufferStorageIDBItem,
): TSerializedBufferStorageIDBItem {
  return {
    id: item.id,
    isView: item.isView,
    viewByteOffset: item.viewByteOffset,
    viewByteEnd: item.viewByteEnd,
    rawByteOffset: item.rawByteOffset,
    rawByteEnd: item.rawByteEnd,
  };
}
