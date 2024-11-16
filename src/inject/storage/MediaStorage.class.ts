import { type SearchByParams, type MediaStorageItem } from './storage.types';

export class MediaStorage {
  store: MediaStorageItem[] = [];

  find(item: SearchByParams): {
    foundIndex: number;
    found?: MediaStorageItem;
  } {
    const foundIndex = this.store.findIndex((curItem) => {
      let found = false;
      if (item.mediaSource) {
        found = curItem.mediaSource === item.mediaSource;
      } else if (!found && item.mediaSourceUrl) {
        found = curItem.mediaSourceUrl === item.mediaSourceUrl;
      } else if (!found && item.sourceBuffer) {
        // Array.prototype.indexOf.call(curItem.mediaSource.sourceBuffers, item.sourceBuffer)
        for (const sourceBuffer of curItem?.mediaSource.sourceBuffers) {
          found = sourceBuffer === item.sourceBuffer;
          if (found) {
            break;
          }
        }
      }
      return found;
    });

    return { foundIndex, found: this.store[foundIndex] };
  }

  addByMediaSource(mediaSource: MediaSource): MediaStorageItem {
    const { found } = this.find({ mediaSource });
    if (!found) {
      const newItem: MediaStorageItem = { mediaSource };
      this.store.push(newItem);
      return newItem;
    }
    return found;
  }

  assignToItem(
    item: MediaStorageItem,
    assignment: Partial<MediaStorageItem>,
  ): MediaStorageItem | undefined {
    const foundIndex = this.store.indexOf(item);
    if (foundIndex > -1) {
      this.store[foundIndex] = { ...item, ...assignment };
      return this.store[foundIndex];
    }
  }

  assignToAny(
    existing: Partial<MediaStorageItem>,
    assignment: Partial<MediaStorageItem>,
  ): MediaStorageItem {
    const { found, foundIndex } = this.find(existing);
    if (found) {
      this.store[foundIndex] = { ...found, ...assignment };
      return found;
    } else {
      const newItem = { ...assignment };
      this.store.push(newItem);
      return newItem;
    }
  }
}
