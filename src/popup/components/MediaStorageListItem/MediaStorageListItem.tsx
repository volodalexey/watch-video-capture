import { sendPopupToContentMessage } from '@/common/message';
import { TimeRanges } from '../TimeRanges';
import { useCallback, useMemo, useRef } from 'react';
import { type TExtensionMediaStorageItem } from '@/common/extensionStorage/mediaStorageItem';
import { useDeleteMediaStorageItem } from './MediaStorageListItem.hooks';

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
      payload: { mediaIdHash: item.mediaIdHash },
    });
  }, [item]);

  const {
    handleDeleteConfirm,
    handleDeleteAndClearConfirm,
    handleClearConfirm,
  } = useDeleteMediaStorageItem(item);

  const handleDeleteItem = useCallback(() => {
    handleDeleteConfirm();
  }, [handleDeleteConfirm]);

  const handleDeleteAndClearItem = useCallback(() => {
    handleDeleteAndClearConfirm();
  }, [handleDeleteAndClearConfirm]);

  const handleClearItem = useCallback(() => {
    handleClearConfirm();
  }, [handleClearConfirm]);

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
          <button type="button" onClick={handleOpen}>
            ✖️ close
          </button>
          <ul>
            <li>
              <button type="button" onClick={handleDeleteItem}>
                ✖️ delete
              </button>
            </li>
            <li>
              <button type="button" onClick={handleDeleteAndClearItem}>
                ✖️ delete and clear
              </button>
            </li>
            <li>
              <button type="button" onClick={handleClearItem}>
                ✖️ clear
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
