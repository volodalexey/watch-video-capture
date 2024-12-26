import { logBackgroundApp } from '@/common/logger';
import { mockBrowser } from '@/common/browser';
import { isContentMessage } from '@/common/message';
import { saveMediaStorageItem } from '@/common/extensionStorage/mediaStorageItem/saveMediaStorageItem';
import { updateMediaStorageItem } from '@/common/extensionStorage/mediaStorageItem';

mockBrowser();

browser.runtime.onInstalled.addListener(() => {
  logBackgroundApp('browser.runtime.onInstalled');
});

browser.runtime.onMessage.addListener((e: unknown) => {
  if (isContentMessage(e)) {
    logBackgroundApp(e);
    switch (e.type) {
      case 'mediaStorageItem': {
        const serializedMediaStorageItem = e.payload;
        saveMediaStorageItem(serializedMediaStorageItem);
        break;
      }
      case 'IDBStorageItems': {
        updateMediaStorageItem(e.payload);
        break;
      }
    }
  }
});
