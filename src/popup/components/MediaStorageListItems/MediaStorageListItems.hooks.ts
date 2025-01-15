import { useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  const { isPending, mutateAsync } = useMutation({
    mutationKey: [MediaStorageItemsQueryKey],
    mutationFn: async () => {
      logPopupQueryGet('useMediaStorageItems');
      const res = await clearMediaStorageItems();
      return res;
    },
  });

  const handleClearConfirm = useCallback(async () => {
    if (confirm(t('tr:clr_all_fr_ext'))) {
      await mutateAsync();
    }
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (confirm(t('tr:clr_all_fr_ext&tab'))) {
      await mutateAsync();
    }
  }, []);

  return { isPending, handleClear: mutateAsync, handleClearConfirm };
}
