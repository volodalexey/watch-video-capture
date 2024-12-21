import { setStorageItems } from '../extensionStorage.utils';
import {
  DefaultMediaStorageItems,
  MediaStorageItemsKey,
} from './mediaStorageItems.constants';

export async function clearMediaStorageItems() {
  const response = await setStorageItems({
    [MediaStorageItemsKey]: DefaultMediaStorageItems,
  });
  return response;
}
