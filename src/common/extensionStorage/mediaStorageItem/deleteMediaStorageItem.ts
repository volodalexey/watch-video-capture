import { TSerializedMediaStorageItem } from '@/common/message';

import { deleteStorageItem } from '../extensionStorage.utils';
import { MediaStorageItemsKey } from '../mediaStorageItems';

export async function deleteMediaStorageItem(
  mediaStorageItem: TSerializedMediaStorageItem,
) {
  return await deleteStorageItem(
    MediaStorageItemsKey,
    mediaStorageItem,
    'mediaIdHash',
  );
}
