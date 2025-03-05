import { type TExtensionMediaStorageItem } from '@/common/extensionStorage/mediaStorageItem';
import { sendPopupToContentMessage } from '@/common/message';
import { useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { TimeRanges } from '../TimeRanges';
import { useDeleteMediaStorageItem } from './MediaStorageListItem.hooks';

export type MediaStorageListItemProps = {
  item: TExtensionMediaStorageItem;
};

export function MediaStorageListItem({ item }: MediaStorageListItemProps) {
  const { t } = useTranslation();
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

  const handleDeleteItem = useCallback(async () => {
    await handleDeleteConfirm();
    handleOpen();
  }, [handleDeleteConfirm]);

  const handleDeleteAndClearItem = useCallback(async () => {
    await handleDeleteAndClearConfirm();
    handleOpen();
  }, [handleDeleteAndClearConfirm]);

  const handleClearItem = useCallback(async () => {
    await handleClearConfirm();
    handleOpen();
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
            ✖️ {t('tr:close')}
          </button>
          <ul>
            <li>
              <button type="button" onClick={handleDeleteItem}>
                ✖️ {t('tr:del_itm')}
              </button>
            </li>
            <li>
              <button type="button" onClick={handleDeleteAndClearItem}>
                ✖️ {t('tr:del&clr_itm')}
              </button>
            </li>
            <li>
              <button type="button" onClick={handleClearItem}>
                ✖️ {t('tr:clr_itm')}
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
        <TimeRanges timeRanges={item.buffered} duration={item.duration}>
          {({ totalPercent }) => (
            <span>
              {t('tr:buffered')}: {totalPercent}%
            </span>
          )}
        </TimeRanges>
      </div>
      <div>
        <TimeRanges timeRanges={item.seekable} duration={item.duration}>
          {({ totalPercent }) => (
            <span>
              {t('tr:seekable')}: {totalPercent}%
            </span>
          )}
        </TimeRanges>
      </div>
      <hr />
      <div>
        {t('tr:captured')}:{' '}
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
