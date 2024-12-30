import { useCallback } from 'react';
import { MediaStorageListItem } from '../MediaStorageListItem';
import {
  useClearMediaStorageItems,
  useGetMediaStorageItems,
} from './MediaStorageListItems.hooks';
import { useExtensionStorage } from '@/common/extensionStorage/extensionStorage.hooks';
import { sendPopupToContentMessage } from '@/common/message';

export type MediaStorageListItemsProps = {};

export function MediaStorageListItems({}: MediaStorageListItemsProps) {
  const { mediaStorageItems, refetch } = useGetMediaStorageItems();
  const { handleClearConfirm } = useClearMediaStorageItems();

  useExtensionStorage(refetch);

  const handleUpdate = useCallback(() => {
    sendPopupToContentMessage({
      type: 'refreshAllMediaStorageItems',
      payload: null,
    });
  }, []);

  return (
    <>
      <fieldset>
        <legend>
          total: {mediaStorageItems.length}
          <button type="button" onClick={handleUpdate}>
            🔁
          </button>
        </legend>
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
