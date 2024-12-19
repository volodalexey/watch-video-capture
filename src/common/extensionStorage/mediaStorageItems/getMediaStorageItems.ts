import { type TSerializedMediaStorageItem } from '@/common/message';
import { getStorageItem } from '../extensionStorage.utils';
import {
  DefaultMediaStorageItems,
  MediaStorageItemsKey,
} from './mediaStorageItems.constants';

export async function getMediaStorageItems() {
  const response = await getStorageItem(
    MediaStorageItemsKey,
    DefaultMediaStorageItems,
  );
  return response as TSerializedMediaStorageItem[];
}
