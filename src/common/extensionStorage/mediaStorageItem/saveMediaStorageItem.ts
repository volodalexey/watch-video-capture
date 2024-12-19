import { type TSerializedMediaStorageItem } from '@/common/message';
import { appendStorageItem } from '../extensionStorage.utils';
import { MediaStorageItemsKey } from '../mediaStorageItems/mediaStorageItems.constants';

export async function saveMediaStorageItem(
  mediaStorageItem: TSerializedMediaStorageItem,
) {
  return appendStorageItem(MediaStorageItemsKey, mediaStorageItem);
}
