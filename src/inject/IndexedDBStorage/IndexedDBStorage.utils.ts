import { type SourceBufferInfo } from '../MediaStorage';
import { type BufferLikeItem } from './IndexedDBStorage.types';

export function createBufferItem(
  mediaId: string,
  sourceBufferInfo: SourceBufferInfo,
  buffer: ArrayBufferLike,
): BufferLikeItem {
  return { id: `${mediaId}-${sourceBufferInfo.counter++}`, buffer };
}
