import { useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';

import { MediaStorageItemsQueryKey } from './MediaStorageListItems.constants';
import {
  clearMediaStorageItems,
  getMediaStorageItems,
} from '@/common/extensionStorage/mediaStorageItems';
import { WithAbortCheck } from '@/common/query';
import { logPopupQueryGet } from '@/common/logger';

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
    if (confirm('Clear all media storage items from extension?')) {
      await mutateAsync();
    }
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (confirm('Clear all media storage items from extension and tab?')) {
      await mutateAsync();
    }
  }, []);

  return { isPending, handleClear: mutateAsync, handleClearConfirm };
}
