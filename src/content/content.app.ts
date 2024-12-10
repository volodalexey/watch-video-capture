import { logContentApp } from '@/common/logger';
import { mockBrowser } from '@/common/browser';
import {
  isInjectMessage,
  sendContentToBackgroundMessage,
} from '../common/message';

mockBrowser();

async function start() {
  logContentApp(
    '%c content.app start(%s)',
    'background: #eeeeee; color: #c00c00',
    globalThis.location.toString(),
  );
  // we can not use import() module here
  // if we change background.js script to module type -> this script will be strict as defer (deferred)
  // hence it is too late to make traps for other scripts

  const scriptTop = document.createElement('script');
  scriptTop.src = browser.runtime.getURL('/inject.bundle.js');
  document.documentElement.appendChild(scriptTop);

  function removeScript() {
    this.remove();
  }

  scriptTop.onload = removeScript;
  scriptTop.onerror = removeScript;

  globalThis.addEventListener(
    'message',
    (e) => {
      if (isInjectMessage(e.data)) {
        sendContentToBackgroundMessage(e.data);
      }
    },
    false,
  );
}

start();
