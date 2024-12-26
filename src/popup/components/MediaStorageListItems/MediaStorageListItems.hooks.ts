import { useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { MediaStorageItemsQueryKey } from './MediaStorageListItems.constants';
import {
  clearMediaStorageItems,
  getMediaStorageItems,
} from '@/common/extensionStorage/mediaStorageItems';
import { WithAbortCheck } from '@/common/query';
import { logPopupQueryGet } from '@/common/logger';
import { deleteMediaStorageItem } from '@/common/extensionStorage/mediaStorageItem';
import { type TExtensionMediaStorageItem } from '@/common/extensionStorage/mediaStorageItem';

export function useGetMediaStorageItems() {
  const {
    data: mediaStorageItems,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: [MediaStorageItemsQueryKey],
    queryFn: WithAbortCheck(async () => {
      logPopupQueryGet('useMediaStorageItems');
      const res = await getMediaStorageItems();
      return res;
    }),
    initialData: [],
  });

  return { mediaStorageItems, isLoading, isFetching, refetch };
}

export function useDeleteMediaStorageItem() {
  const { isPending, mutateAsync } = useMutation({
    mutationKey: [MediaStorageItemsQueryKey],
    mutationFn: async (item: TExtensionMediaStorageItem) => {
      logPopupQueryGet('useDeleteMediaStorageItem');
      const res = await deleteMediaStorageItem(item);
      return res;
    },
  });

  const handleDeleteConfirm = useCallback(
    async (item: TExtensionMediaStorageItem) => {
      if (confirm('Delete media storage item?')) {
        await mutateAsync(item);
      }
    },
    [],
  );

  return { isPending, handleDelete: mutateAsync, handleDeleteConfirm };
}

export function useClearMediaStorageItems() {
  const { isPending, mutateAsync } = useMutation({
    mutationKey: [MediaStorageItemsQueryKey],
    mutationFn: async () => {
      logPopupQueryGet('useMediaStorageItems');
      const res = await clearMediaStorageItems();
      return res;
    },
  });

  const handleClearConfirm = useCallback(async () => {
    if (confirm('Clear all media storage items?')) {
      await mutateAsync();
    }
  }, []);

  return { isPending, handleClear: mutateAsync, handleClearConfirm };
}
