import { useCallback } from 'react';
import { useMutation } from '@tanstack/react-query';
import { MediaStorageItemQueryKey } from './MediaStorageListItem.constants';
import {
  deleteMediaStorageItem,
  type TExtensionMediaStorageItem,
} from '@/common/extensionStorage/mediaStorageItem';
import { sendPopupToContentMessage } from '@/common/message';

export function useDeleteMediaStorageItem(item: TExtensionMediaStorageItem) {
  const { isPending: isDeletePending, mutateAsync: deleteAsync } = useMutation({
    mutationKey: [MediaStorageItemQueryKey, item.mediaIdHash],
    mutationFn: async () => {
      const res = await deleteMediaStorageItem(item);
      return res;
    },
  });

  const handleDeleteConfirm = useCallback(async () => {
    if (confirm('Delete media storage item?')) {
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
    if (confirm('Clear media storage item?')) {
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
    if (confirm('Delete and clear media storage item?')) {
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
