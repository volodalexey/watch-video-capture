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

export async function appendOrUpdateStorageItem({
  key,
  value,
  valueKey,
  onUpdate,
  defaultValue = [],
}: {
  key: string;
  value: unknown;
  valueKey: string;
  onUpdate?: (value: unknown) => unknown;
  defaultValue?: Array<unknown>;
}) {
  const storageItems = await getStorageItem(key, defaultValue);
  if (Array.isArray(storageItems)) {
    const foundIndex = storageItems.findIndex(
      (storageItem) => storageItem[valueKey] === value[valueKey],
    );
    if (foundIndex > -1) {
      storageItems.splice(
        foundIndex,
        1,
        onUpdate ? onUpdate(storageItems[foundIndex]) : value,
      );
    } else {
      storageItems.push(value);
    }
    await setStorageItem(key, storageItems);
  } else {
    console.warn('Storage data is not an array');
  }
}

export async function deleteStorageItem(
  key: string,
  value: unknown,
  indexKey: string,
  defaultValue = [],
) {
  const storageItems = await getStorageItem(key, defaultValue);
  if (Array.isArray(storageItems)) {
    const foundIndex = storageItems.findIndex(
      (storageItem) => storageItem[indexKey] === value[indexKey],
    );
    if (foundIndex > -1) {
      storageItems.splice(foundIndex, 1);
    } else {
      console.warn('Unable to find storage item');
    }
    await setStorageItem(key, storageItems);
  } else {
    console.warn('Storage data is not an array');
  }
}

export async function updateStorageItem({
  key,
  valueKey,
  value,
  indexKey,
  indexValue,
  defaultValue = [],
}: {
  key: string;
  valueKey: string;
  value: unknown;
  indexKey: string;
  indexValue: string;
  defaultValue?: Array<unknown>;
}) {
  const storageItems = await getStorageItem(key, defaultValue);
  if (Array.isArray(storageItems)) {
    const foundIndex = storageItems.findIndex(
      (storageItem) => storageItem[indexKey] === indexValue,
    );
    if (foundIndex > -1) {
      storageItems.splice(foundIndex, 1, {
        ...storageItems[foundIndex],
        [valueKey]: value,
      });
      await setStorageItem(key, storageItems);
    } else {
      console.warn('Storage data not found');
    }
  } else {
    console.warn('Storage data is not an array');
  }
}
