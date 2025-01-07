import { useCallback, useRef } from 'react';
import { MediaStorageListItem } from '../MediaStorageListItem';
import {
  useClearMediaStorageItems,
  useGetMediaStorageItems,
} from './MediaStorageListItems.hooks';
import { useExtensionStorage } from '@/common/extensionStorage/extensionStorage.hooks';
import { sendPopupToContentMessage } from '@/common/message';

export type MediaStorageListItemsProps = {};

export function MediaStorageListItems({}: MediaStorageListItemsProps) {
  const ref = useRef<HTMLDialogElement | null>(null);

  const handleOpen = useCallback(() => {
    if (ref?.current.open) {
      ref?.current.close();
    } else {
      ref?.current.show();
    }
  }, []);

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
      <dialog ref={ref}>
        <button type="button" onClick={handleOpen}>
          ✖️ close
        </button>
        <ul>
          <li>
            <button type="button" onClick={handleClearConfirm}>
              ✖️ delete all from extension
            </button>
          </li>
          <li>
            <button type="button" onClick={handleClearConfirm}>
              ✖️ delete all from extension & tab
            </button>
          </li>
          <li>
            <button type="button" onClick={handleClearConfirm}>
              ✖️ delete all from tab
            </button>
          </li>
        </ul>
      </dialog>
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
          <button type="button" onClick={handleOpen}>
            📜 all actions
          </button>
        )}
      </fieldset>
    </>
  );
}
