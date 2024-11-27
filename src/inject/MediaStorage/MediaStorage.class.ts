import { isInSourceBuffers } from '../detect';
import {
  type SearchByParams,
  type MediaStorageItem,
  type SourceBufferInfo,
} from './MediaStorage.types';
import { createMediaItem, createSourceBufferInfo } from './MediaStorage.utils';

export class MediaStorage {
  store: MediaStorageItem[] = [];

  find(item: SearchByParams): {
    itemIndex: number;
    item?: MediaStorageItem;
  } {
    const itemIndex = this.store.findIndex((curItem) => {
      let found = false;
      if (item.mediaSource) {
        found = curItem.mediaSource === item.mediaSource;
      } else if (!found && item.mediaSourceUrl) {
        found = curItem.mediaSourceUrl === item.mediaSourceUrl;
      } else if (!found && item.sourceBuffer) {
        found = isInSourceBuffers(curItem.mediaSource, item.sourceBuffer);
      } else if (!found && item.htmlSourceElement) {
        found = curItem.htmlSourceElement === item.htmlSourceElement;
      } else if (!found && item.htmlVideoElement) {
        found = curItem.htmlVideoElement === item.htmlVideoElement;
      }
      return found;
    });

    return { itemIndex, item: this.store[itemIndex] };
  }

  findSourceBufferInfo(sourceBuffer: SourceBuffer): ReturnType<
    MediaStorage['find']
  > & {
    sourceBufferInfo?: SourceBufferInfo;
  } {
    const result = this.find({ sourceBuffer });
    const { item } = result;
    if (item) {
      const sourceBufferInfo = item.info.get(sourceBuffer);
      return { ...result, sourceBufferInfo };
    }
    return result;
  }

  addByMediaSource(mediaSource: MediaSource): MediaStorageItem {
    const { item } = this.find({ mediaSource });
    if (!item) {
      const newItem = createMediaItem({ mediaSource });
      this.store.push(newItem);
      return newItem;
    }
    return item;
  }

  addMimeType(
    sourceBuffer: SourceBuffer,
    mimeType: string,
  ): ReturnType<MediaStorage['findSourceBufferInfo']> {
    const result = this.findSourceBufferInfo(sourceBuffer);
    const { item, sourceBufferInfo } = result;
    if (item) {
      if (sourceBufferInfo) {
        console.warn('SourceBufferInfo already present');
      } else {
        item.info.set(sourceBuffer, createSourceBufferInfo({ mimeType }));
      }
    }
    return result;
  }

  assignToAny(
    existing: Partial<MediaStorageItem>,
    assignment: Partial<MediaStorageItem>,
  ): ReturnType<MediaStorage['find']> {
    const result = this.find(existing);
    const { item, itemIndex } = result;
    if (item) {
      this.store[itemIndex] = { ...item, ...assignment };
    }
    return result;
  }
}
