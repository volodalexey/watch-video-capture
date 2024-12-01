import { type MediaStorageItem, type SourceBufferInfo } from '../MediaStorage';
import { type BufferStorageIDBItem } from './IndexedDBStorage.types';

export function createBufferItem(
  item: MediaStorageItem,
  sourceBufferInfo: SourceBufferInfo,
  buffer: ArrayBufferLike,
): BufferStorageIDBItem {
  const index = sourceBufferInfo.counter;
  sourceBufferInfo.counter += 1;
  const { isVideo, isAudio, mimeType } = sourceBufferInfo;
  return {
    id: `${item.mediaIdHash}-${isVideo ? 'v' : isAudio ? 'a' : '~'}-${index}`,
    mediaIdHash: item.mediaIdHash,
    mimeType,
    isVideo,
    isAudio,
    index,
    buffer,
  };
}
