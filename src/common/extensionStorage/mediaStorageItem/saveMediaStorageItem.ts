import { type TSerializedMediaStorageItem } from '@/common/message';

import { appendOrUpdateStorageItem } from '../extensionStorage.utils';
import { MediaStorageItemsKey } from '../mediaStorageItems';
import { type TExtensionMediaStorageItem } from './mediaStorageItem.types';

export async function saveMediaStorageItem(
  originUrl: string,
  serializedMediaStorageItem: TSerializedMediaStorageItem,
) {
  return appendOrUpdateStorageItem({
    key: MediaStorageItemsKey,
    value: {
      ...serializedMediaStorageItem,
      originUrl,
      captured: {},
    } as TExtensionMediaStorageItem,
    valueKey: 'mediaIdHash',
    onUpdate: (oldMediaStorageItem: TExtensionMediaStorageItem) => {
      return {
        ...serializedMediaStorageItem,
        originUrl,
        captured: oldMediaStorageItem.captured,
      } as TExtensionMediaStorageItem;
    },
  });
}
