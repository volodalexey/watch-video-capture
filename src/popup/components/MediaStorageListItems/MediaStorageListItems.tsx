import { MediaStorageListItem } from '../MediaStorageListItem';
import {
  useClearMediaStorageItems,
  useGetMediaStorageItems,
} from './MediaStorageListItems.hooks';
import { useExtensionStorage } from '@/common/extensionStorage/extensionStorage.hooks';

export type MediaStorageListItemsProps = {};

export function MediaStorageListItems({}: MediaStorageListItemsProps) {
  const { mediaStorageItems, refetch } = useGetMediaStorageItems();
  const { handleClearConfirm } = useClearMediaStorageItems();

  useExtensionStorage(refetch);

  return (
    <>
      <fieldset>
        <legend>total: {mediaStorageItems.length}</legend>
        <ul>
          {mediaStorageItems.map((item) => (
            <MediaStorageListItem item={item} />
          ))}
        </ul>
        {mediaStorageItems.length > 0 && (
          <button type="button" onClick={handleClearConfirm}>
            ✖️ delete all
          </button>
        )}
      </fieldset>
    </>
  );
}
