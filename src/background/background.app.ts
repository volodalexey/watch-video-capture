import { mockBrowser } from '@/common/browser';
import { updateMediaStorageItem } from '@/common/extensionStorage/mediaStorageItem';
import { saveMediaStorageItem } from '@/common/extensionStorage/mediaStorageItem/saveMediaStorageItem';
import { logBackgroundApp } from '@/common/logger';
import { isContentMessage } from '@/common/message';

mockBrowser();

browser.runtime.onInstalled.addListener(() => {
  logBackgroundApp('browser.runtime.onInstalled');
});

browser.runtime.onMessage.addListener((e: unknown) => {
  if (isContentMessage(e)) {
    logBackgroundApp(e);
    switch (e.type) {
      case 'mediaStorageItem': {
        if (e.payload.serializedItem.mediaIdHash) {
          saveMediaStorageItem(e.payload.originUrl, e.payload.serializedItem);
        } else {
          logBackgroundApp(
            'Skip saving media storage item. No mediaIdHash',
            e.payload.serializedItem.mediaSourceUrl,
          );
        }
        break;
      }
      case 'IDBStorageItems': {
        updateMediaStorageItem(e.payload);
        break;
      }
    }
  }
});
