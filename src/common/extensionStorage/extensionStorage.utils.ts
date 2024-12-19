function useDefaultValue<T, D>(resultValue: T, defaultValue?: D): T | D {
  if (defaultValue === null) {
    if (resultValue === undefined) {
      return defaultValue;
    }
  } else if (defaultValue !== undefined) {
    const defaultType = typeof defaultValue;
    const resultType = typeof resultValue;
    if (resultType !== defaultType) {
      return defaultValue;
    }
  }
  return resultValue;
}

export async function getStorageItem<T, D>(
  key: string,
  defaultValue?: D,
): Promise<T | D> {
  const result = await browser.storage.local.get([key]);
  return useDefaultValue<T, D>(result[key], defaultValue);
}

export async function getStorageItems(obj: Record<string, unknown>) {
  const keys = Object.keys(obj);
  const result = await browser.storage.local.get([...keys]);

  const entries = keys.map((key) => [
    key,
    useDefaultValue(result[key], obj[key]),
  ]);
  const ret = Object.fromEntries(entries);
  return ret;
}

export function setStorageItem<T>(key: string, value: T) {
  return browser.storage.local.set({
    [key]: value,
  });
}

export function setStorageItems(obj: Record<string, unknown>) {
  return browser.storage.local.set(obj);
}

export function clearStorage(): Promise<void> {
  return browser.storage.local.clear();
}

export async function appendStorageItem(
  key: string,
  value: unknown,
  defaultValue = [],
) {
  const storageItems = await getStorageItem(key, defaultValue);
  if (Array.isArray(storageItems)) {
    storageItems.push(value);
    await setStorageItem(key, storageItems);
  } else {
    console.warn('Storage data is not an array');
  }
}
