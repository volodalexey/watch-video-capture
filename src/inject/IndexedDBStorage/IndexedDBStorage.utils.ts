import { type MediaStorageItem, type SourceBufferInfo } from '../MediaStorage';
import { type BufferStorageIDBItem } from './IndexedDBStorage.types';

export function createBufferItem(
  item: MediaStorageItem,
  sourceBufferInfo: SourceBufferInfo,
  buffer: ArrayBufferLike,
): BufferStorageIDBItem {
  const index = sourceBufferInfo.counter;
  sourceBufferInfo.counter += 1;
  return {
    id: `${item.mediaIdHash}-${index}`,
    mediaId: item.mediaId,
    index,
    buffer,
  };
}
