import {
  deleteMediaStorageItem,
  type TExtensionMediaStorageItem,
} from '@/common/extensionStorage/mediaStorageItem';
import { sendPopupToContentMessage } from '@/common/message';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { MediaStorageItemQueryKey } from './MediaStorageListItem.constants';

export function useDeleteMediaStorageItem(item: TExtensionMediaStorageItem) {
  const { t } = useTranslation();

  const { isPending: isDeletePending, mutateAsync: deleteAsync } = useMutation({
    mutationKey: [MediaStorageItemQueryKey, item.mediaIdHash],
    mutationFn: async () => {
      const res = await deleteMediaStorageItem(item);
      return res;
    },
  });

  const handleDeleteConfirm = useCallback(async () => {
    if (confirm(t('tr:del_media_itm'))) {
      await deleteAsync();
    }
  }, []);

  const { isPending: isClearPending, mutateAsync: clearAsync } = useMutation({
    mutationKey: [MediaStorageItemQueryKey, item.mediaIdHash],
    mutationFn: async (deleteItem: boolean) => {
      await sendPopupToContentMessage({
        type: 'clearMediaStorageItem',
        payload: { mediaIdHash: item.mediaIdHash, deleteItem },
      });
    },
  });

  const handleClearConfirm = useCallback(async () => {
    if (confirm(t('tr:clr_media_itm'))) {
      await clearAsync(false);
    }
  }, []);

  const {
    isPending: isDeleteAndClearPending,
    mutateAsync: deleteAndClearAsync,
  } = useMutation({
    mutationKey: [MediaStorageItemQueryKey, item.mediaIdHash],
    mutationFn: async () => {
      await clearAsync(true);
      await deleteAsync();
    },
  });

  const handleDeleteAndClearConfirm = useCallback(async () => {
    if (confirm(t('tr:del&clr_media_itm'))) {
      await deleteAndClearAsync();
    }
  }, []);

  return {
    isDeletePending,
    handleDeleteConfirm,
    isClearPending,
    handleClearConfirm,
    isDeleteAndClearPending,
    handleDeleteAndClearConfirm,
  };
}
