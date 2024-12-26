import { sendPopupToContentMessage } from '@/common/message';
import { TimeRanges } from '../TimeRanges';
import { useCallback, useMemo, useRef } from 'react';
import { useDeleteMediaStorageItem } from '../MediaStorageListItems';
import { type TExtensionMediaStorageItem } from '@/common/extensionStorage/mediaStorageItem';

export type MediaStorageListItemProps = {
  item: TExtensionMediaStorageItem;
};

export function MediaStorageListItem({ item }: MediaStorageListItemProps) {
  const ref = useRef<HTMLDialogElement | null>(null);

  const handleOpen = useCallback(() => {
    if (ref?.current.open) {
      ref?.current.close();
    } else {
      ref?.current.show();
    }
  }, []);

  const handleDownload = useCallback(() => {
    sendPopupToContentMessage({
      type: 'downloadMediaStorageItem',
      payload: item.mediaIdHash,
    });
  }, [item]);

  const { handleDelete } = useDeleteMediaStorageItem();

  const handleDeleteItem = useCallback(() => {
    handleDelete(item);
  }, [item, handleDelete]);

  const capturedDictionary = useMemo<Record<string, string[]>>(() => {
    const capturedDictionary: Record<string, string[]> = {};
    Object.getOwnPropertyNames(item.captured).forEach((key) => {
      capturedDictionary[key] = item.captured[key].map((value) => value.id);
    });
    return capturedDictionary;
  }, [item.captured]);

  return (
    <li>
      <div>
        <b>{item.mediaIdHash}</b>
        <button type="button" onClick={handleDownload}>
          💾
        </button>
        <button type="button" onClick={handleOpen}>
          💬
        </button>
        <dialog ref={ref}>
          <ul>
            <li>
              <button type="button" onClick={handleDeleteItem}>
                ✖️ delete
              </button>
            </li>
          </ul>
        </dialog>
      </div>
      <div>{item.mediaId}</div>
      <div>
        <i>{item.mediaSourceUrl}</i>
      </div>
      <hr />
      <div>
        <TimeRanges
          text="Buffered:"
          timeRanges={item.buffered}
          duration={item.duration}
        />
      </div>
      <div>
        <TimeRanges
          text="Seekable:"
          timeRanges={item.seekable}
          duration={item.duration}
        />
      </div>
      <hr />
      <div>
        Captured:{' '}
        {Object.entries(capturedDictionary).map(([key, value]) => {
          return (
            <div>
              {key}: {value.length}
            </div>
          );
        })}
      </div>
    </li>
  );
}
