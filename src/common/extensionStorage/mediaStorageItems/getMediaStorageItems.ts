import { getStorageItem } from '../extensionStorage.utils';
import { type TExtensionMediaStorageItem } from '../mediaStorageItem/mediaStorageItem.types';
import {
  DefaultMediaStorageItems,
  MediaStorageItemsKey,
} from './mediaStorageItems.constants';

export async function getMediaStorageItems() {
  const response = await getStorageItem(
    MediaStorageItemsKey,
    DefaultMediaStorageItems,
  );
  return response as TExtensionMediaStorageItem[];
}
