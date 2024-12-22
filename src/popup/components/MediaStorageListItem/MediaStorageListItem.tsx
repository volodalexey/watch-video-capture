import {
  sendPopupToContentMessage,
  TSerializedMediaStorageItem,
} from '@/common/message';
import { TimeRanges } from '../TimeRanges';
import { useCallback, useRef, useState } from 'react';
import { useDeleteMediaStorageItem } from '../MediaStorageListItems';

export type MediaStorageListItemProps = {
  item: TSerializedMediaStorageItem;
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
    </li>
  );
}
