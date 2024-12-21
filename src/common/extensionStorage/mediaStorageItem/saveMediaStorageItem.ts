import { type TSerializedMediaStorageItem } from '@/common/message';
import { appendOrUpdateStorageItem } from '../extensionStorage.utils';
import { MediaStorageItemsKey } from '../mediaStorageItems';

export async function saveMediaStorageItem(
  mediaStorageItem: TSerializedMediaStorageItem,
) {
  return appendOrUpdateStorageItem(
    MediaStorageItemsKey,
    mediaStorageItem,
    'mediaIdHash',
  );
}
