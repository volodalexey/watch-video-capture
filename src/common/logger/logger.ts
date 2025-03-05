/* 
import debug from 'debug';
// %a
import { anyToString } from './anyToString';
debug.formatters.a = (v: unknown) => {
  return anyToString(v);
};
*/

import { AppName, ColorMap } from './logger.constants';

interface TDebug {
  (..._args: unknown[]): void;
  enabled: boolean;
}

function debug(
  _some: string,
  enabled = false,
  textColor?: keyof typeof ColorMap,
): TDebug {
  const logger: TDebug = <TDebug>function (..._args: unknown[]) {
    if (logger.enabled) {
      if (textColor) {
        _args[0] = `%c${_args[0]}`;
        _args.splice(1, 0, ColorMap[textColor]);
        console.debug(..._args);
      } else {
        console.debug(..._args);
      }
    }
  };

  logger.enabled = enabled;
  return logger;
}

function intoLogName(logName: string): string {
  return `${AppName}${logName}`;
}

function intoBackgroundName(logName: string): string {
  return `${intoLogName('background-')}${logName}`;
}

function intoContentName(logName: string): string {
  return `${intoLogName('content-')}${logName}`;
}

function intoInjectName(logName: string): string {
  return `${intoLogName('inject-')}${logName}`;
}

function intoPopupName(logName: string): string {
  return `${intoLogName('popup-')}${logName}`;
}

export const logBackgroundApp = debug(intoBackgroundName('app'));
export const logContentApp = debug(intoContentName('app'));
export const logInjectApp = debug(intoInjectName('app'));
export const logPopupApp = debug(intoPopupName('app'));

function intoInjectSourceBuffer(logName: string): string {
  return `${intoInjectName('source-buffer-')}${logName}`;
}

export const logInjectSourceBufferEvent = debug(
  intoInjectSourceBuffer('event'),
  true,
);
export const logInjectSourceBufferTimestamp = debug(
  intoInjectSourceBuffer('timestamp'),
  true,
);
export const logInjectSourceBufferChange = debug(
  intoInjectSourceBuffer('change'),
  true,
);
export const logInjectSourceBufferRemove = debug(
  intoInjectSourceBuffer('remove'),
  true,
);
export const logInjectSourceBufferRemoveRed = debug(
  intoInjectSourceBuffer('remove'),
  true,
  'red',
);
export const logInjectSourceBufferAppend = debug(
  intoInjectSourceBuffer('append'),
  true,
);

function intoInjectMediaSource(logName: string): string {
  return `${intoInjectName('media-source-')}${logName}`;
}

export const logInjectMediaSourceDuration = debug(
  intoInjectMediaSource('duration'),
  true,
);
export const logInjectMediaSourceAppend = debug(
  intoInjectMediaSource('append'),
  true,
);
export const logInjectMediaSourceRemove = debug(
  intoInjectMediaSource('remove'),
  true,
);
export const logInjectMediaSourceEnd = debug(intoInjectMediaSource('end'));
export const logInjectMediaSourceRange = debug(intoInjectMediaSource('range'));

export const logInjectUrlCreate = debug(intoInjectName('url-create'));

function intoInjectHtml(logName: string): string {
  return `${intoInjectName('html-')}${logName}`;
}

function intoInjectHtmlVideo(logName: string): string {
  return `${intoInjectHtml('video-')}${logName}`;
}

export const logInjectHtmlSourceSrc = debug(intoInjectHtml('source-src'), true);
export const logInjectHtmlVideoSrc = debug(intoInjectHtmlVideo('src'), true);
export const logInjectHtmlVideoAppend = debug(
  intoInjectHtmlVideo('append'),
  true,
);
export const logInjectHtmlMediaDuration = debug(
  intoInjectHtml('media-duration'),
  true,
);

function intoInjectIndexedDB(logName: string): string {
  return `${intoInjectName('indexeddb-')}${logName}`;
}

function intoInjectIDBBufferItem(logName: string): string {
  return `${intoInjectIndexedDB('bufferitem-')}${logName}`;
}

export const logInjectIDBBufferItemTransaction = debug(
  intoInjectIDBBufferItem('transaction'),
  true,
);
export const logInjectIDBBufferItemTransactionGreen = debug(
  intoInjectIDBBufferItem('transaction'),
  true,
  'green',
);
export const logInjectIDBBufferItemTransactionYellow = debug(
  intoInjectIDBBufferItem('transaction'),
  true,
  'yellow_1',
);
export const logInjectIDBBufferItemTransactionRed = debug(
  intoInjectIDBBufferItem('transaction'),
  true,
  'red',
);
export const logInjectIDBBufferItemObjectStore = debug(
  intoInjectIDBBufferItem('objectstore'),
  true,
);
export const logInjectIDBBufferItemObjectStoreMagenta = debug(
  intoInjectIDBBufferItem('objectstore'),
  true,
  'magenta',
);
export const logInjectIDBBufferItemRequest = debug(
  intoInjectIDBBufferItem('request'),
  true,
);
export const logInjectIDBBufferItemRequestGreen = debug(
  intoInjectIDBBufferItem('request'),
  true,
  'green',
);
export const logInjectIDBBufferItemRequestYellow = debug(
  intoInjectIDBBufferItem('request'),
  true,
  'yellow_2',
);
export const logInjectIDBBufferItemCursor = debug(
  intoInjectIDBBufferItem('cursor'),
  true,
);
export const logInjectIDBBufferItemCursorYellow = debug(
  intoInjectIDBBufferItem('cursor'),
  true,
  'yellow_2',
);
export const logInjectIDBBufferItemCursorMagenta = debug(
  intoInjectIDBBufferItem('cursor'),
  true,
  'magenta',
);
export const logInjectIDBBufferItemCursorRed = debug(
  intoInjectIDBBufferItem('cursor'),
  true,
  'red',
);
export const logInjectIDBBufferItemCreate = debug(
  intoInjectIDBBufferItem('create'),
  true,
);
export const logInjectIDBBufferItemSave = debug(
  intoInjectIDBBufferItem('save'),
);
export const logInjectIDBBufferItemSaveYellow = debug(
  intoInjectIDBBufferItem('save'),
  true,
  'yellow_1',
);
export const logInjectIDBBufferItemSaveMagenta = debug(
  intoInjectIDBBufferItem('save'),
  true,
  'magenta',
);
export const logInjectIDBBufferItemSaveRed = debug(
  intoInjectIDBBufferItem('save'),
  true,
  'red',
);
export const logPopupQueryGet = debug(intoPopupName('query-get'));
