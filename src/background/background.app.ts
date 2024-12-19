import { logBackgroundApp } from '@/common/logger';
import { mockBrowser } from '@/common/browser';
import { isContentMessage } from '@/common/message';
import { saveMediaStorageItem } from '@/common/extensionStorage/mediaStorageItem/saveMediaStorageItem';

mockBrowser();

browser.runtime.onInstalled.addListener(() => {
  logBackgroundApp('browser.runtime.onInstalled');
});

browser.runtime.onMessage.addListener((e: unknown) => {
  if (isContentMessage(e)) {
    switch (e.type) {
      case 'mediaStorageItem': {
        const mediaStorageItem = e.payload;
        logBackgroundApp(mediaStorageItem);
        saveMediaStorageItem(mediaStorageItem);
      }
    }
  }
});
