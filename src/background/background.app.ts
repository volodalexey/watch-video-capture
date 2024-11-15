import { mockBrowser } from '../common/browser';

mockBrowser();

browser.runtime.onInstalled.addListener(() => {
  console.debug('browser.runtime.onInstalled');
});
