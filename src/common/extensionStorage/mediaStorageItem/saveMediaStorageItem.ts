import { type TSerializedMediaStorageItem } from '@/common/message';
import { appendOrUpdateStorageItem } from '../extensionStorage.utils';
import { MediaStorageItemsKey } from '../mediaStorageItems';
import { type TExtensionMediaStorageItem } from './mediaStorageItem.types';

export async function saveMediaStorageItem(
  serializedMediaStorageItem: TSerializedMediaStorageItem,
) {
  return appendOrUpdateStorageItem({
    key: MediaStorageItemsKey,
    value: {
      ...serializedMediaStorageItem,
      captured: {},
    } as TExtensionMediaStorageItem,
    valueKey: 'mediaIdHash',
    onUpdate: (oldMediaStorageItem: TExtensionMediaStorageItem) => {
      return {
        ...serializedMediaStorageItem,
        captured: oldMediaStorageItem.captured,
      } as TExtensionMediaStorageItem;
    },
  });
}
