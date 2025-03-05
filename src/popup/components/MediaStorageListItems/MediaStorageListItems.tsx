import { useExtensionStorage } from '@/common/extensionStorage/extensionStorage.hooks';
import { sendPopupToContentMessage } from '@/common/message';
import {
  I18NextLanguage,
  isI18NextLng,
  saveLocalStorageLng,
} from '@/popup/i18n';
import { ChangeEvent, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { MediaStorageListItem } from '../MediaStorageListItem';
import {
  useClearMediaStorageItems,
  useGetMediaStorageItems,
} from './MediaStorageListItems.hooks';

export function MediaStorageListItems() {
  const { t, i18n } = useTranslation();
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

  const handleLanguageChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement>) => {
      const { value } = e.target;
      if (isI18NextLng(value)) {
        i18n.changeLanguage(value);
        saveLocalStorageLng(value);
      }
    },
    [],
  );

  return (
    <>
      <dialog ref={ref}>
        <button type="button" onClick={handleOpen}>
          ✖️ {t('tr:close')}
        </button>
        <ul>
          <li>
            <button type="button" onClick={handleClearConfirm}>
              ✖️ {t('tr:del_all_fr_ext')}
            </button>
          </li>
          <li>
            <button type="button" onClick={handleClearConfirm}>
              ✖️ {t('tr:del_all_fr_ext&tab')}
            </button>
          </li>
          <li>
            <button type="button" onClick={handleClearConfirm}>
              ✖️ {t('tr:del_all_fr_tab')}
            </button>
          </li>
        </ul>
      </dialog>
      <fieldset>
        <legend>
          {t('tr:total')}: {mediaStorageItems.length}
          <button type="button" onClick={handleUpdate}>
            🔁
          </button>
          <label>
            {t('tr:language')}
            <select value={i18n.language} onChange={handleLanguageChange}>
              <option value={I18NextLanguage.en}>{t('tr:english')}</option>
              <option value={I18NextLanguage.ru}>{t('tr:russian')}</option>
            </select>
          </label>
        </legend>
        <ul>
          {mediaStorageItems.map((item) => (
            <MediaStorageListItem item={item} />
          ))}
        </ul>
        {mediaStorageItems.length > 0 && (
          <button type="button" onClick={handleOpen}>
            📜 {t('tr:all_actions')}
          </button>
        )}
      </fieldset>
    </>
  );
}
