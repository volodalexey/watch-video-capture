import { logInjectIDBBufferItemCreate } from '@/common/logger';
import { type MediaStorageItem, type SourceBufferInfo } from '../MediaStorage';
import { type BufferStorageIDBItem } from './IndexedDBStorage.types';

export function createBufferItem({
  item,
  sourceBufferInfo,
  buffer,
  byteOffset,
}: {
  item: MediaStorageItem;
  sourceBufferInfo: SourceBufferInfo;
  buffer: ArrayBufferLike;
  byteOffset?: number;
}): BufferStorageIDBItem {
  let incremented = false;
  let incrementedBy0 = false;
  let incrementalByteOffset = 0;
  if (!Number.isFinite(byteOffset)) {
    incrementalByteOffset = sourceBufferInfo.incrementalByteOffset;
    sourceBufferInfo.incrementalByteOffset += buffer.byteLength;
    incremented = true;
  } else if (byteOffset === 0) {
    incrementalByteOffset = sourceBufferInfo.incrementalByteOffset;
    sourceBufferInfo.incrementalByteOffset += buffer.byteLength;
    incrementedBy0 = true;
  } else {
    incrementalByteOffset = byteOffset;
  }
  const { isVideo, isAudio, mimeType } = sourceBufferInfo;
  const incrementalByteEnd = incrementalByteOffset + buffer.byteLength;
  const id = `${item.mediaIdHash}-${isVideo ? 'v' : isAudio ? 'a' : '~'}-${incremented ? 'I' : incrementedBy0 ? '0' : 'X'}-${incrementalByteOffset}+${buffer.byteLength}=>${incrementalByteEnd}`;
  logInjectIDBBufferItemCreate(`createBufferItem(${id})`);
  return {
    id,
    mediaIdHash: item.mediaIdHash,
    mimeType,
    isVideo,
    isAudio,
    incrementalByteOffset,
    incrementalByteEnd,
    buffer,
  };
}
