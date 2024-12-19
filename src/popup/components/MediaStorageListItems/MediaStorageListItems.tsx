import { TSerializedMediaStorageItem } from '@/common/message';
import { MediaStorageListItem } from '../MediaStorageListItem';
import { useMediaStorageItems } from './MediaStorageListItems.hooks';
import { useExtensionStorage } from '@/common/extensionStorage/extensionStorage.hooks';

export type MediaStorageListItemsProps = {};

export function MediaStorageListItems({}: MediaStorageListItemsProps) {
  const { mediaStorageItems, refetch } = useMediaStorageItems();

  useExtensionStorage(refetch);

  return (
    <ul>
      {mediaStorageItems.map((item) => (
        <MediaStorageListItem item={item} />
      ))}
    </ul>
  );
}
