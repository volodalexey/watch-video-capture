import { useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { MediaStorageItemsQueryKey } from './MediaStorageListItems.constants';
import { getMediaStorageItems } from '@/common/extensionStorage/mediaStorageItems';
import { WithAbortCheck } from '@/common/query';
import { logPopupQueryGet } from '@/common/logger';

export function useMediaStorageItems() {
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
