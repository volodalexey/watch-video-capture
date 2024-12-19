import { useCallback, useEffect } from 'react';

export function useExtensionStorage(callback: VoidFunction) {
  const handleCommited = useCallback(() => {
    callback();
  }, [callback]);

  useEffect(() => {
    browser.storage.local.onChanged.addListener(handleCommited);

    return () => browser.storage.local.onChanged.removeListener(handleCommited);
  }, []);
}
