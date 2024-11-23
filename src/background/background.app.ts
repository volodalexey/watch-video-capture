import { mockBrowser } from '../common/browser';
import { isContentMessage } from '../common/message';

mockBrowser();

browser.runtime.onInstalled.addListener(() => {
  console.debug('browser.runtime.onInstalled');
});

browser.runtime.onMessage.addListener((e: unknown) => {
  if (isContentMessage(e)) {
    switch (e.type) {
      case 'buffer': {
        const received = new Uint8Array(e.payload.buffer);
        console.debug(received);
      }
    }
  }
});
