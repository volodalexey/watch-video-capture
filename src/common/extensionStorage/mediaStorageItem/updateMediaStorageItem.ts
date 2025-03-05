import { TSerializedBufferStorageIDBItem } from '@/common/message';

import { updateStorageItem } from '../extensionStorage.utils';
import { MediaStorageItemsKey } from '../mediaStorageItems';

export async function updateMediaStorageItem({
  mediaIdHash,
  captured,
}: {
  mediaIdHash: string;
  captured: Record<string, TSerializedBufferStorageIDBItem[]>;
}) {
  return updateStorageItem({
    key: MediaStorageItemsKey,
    indexKey: 'mediaIdHash',
    indexValue: mediaIdHash,
    valueKey: 'captured',
    value: captured,
  });
}
