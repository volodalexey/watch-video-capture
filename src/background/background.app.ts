import { logBackgroundApp } from '@/common/logger';
import { mockBrowser } from '@/common/browser';
import { isContentMessage } from '@/common/message';
import { saveMediaStorageItem } from '@/common/extensionStorage/mediaStorageItem/saveMediaStorageItem';
import { updateMediaStorageItem } from '@/common/extensionStorage/mediaStorageItem';

mockBrowser();

browser.runtime.onInstalled.addListener(() => {
  logBackgroundApp('browser.runtime.onInstalled');
});

browser.runtime.onMessage.addListener(
  (e: unknown, sender: browser.runtime.MessageSender) => {
    if (isContentMessage(e)) {
      logBackgroundApp(e);
      switch (e.type) {
        case 'mediaStorageItem': {
          saveMediaStorageItem(e.payload.originUrl, e.payload.serializedItem);
          break;
        }
        case 'IDBStorageItems': {
          updateMediaStorageItem(e.payload);
          break;
        }
      }
    }
  },
);
