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

export const logBackgroundApp = debug(intoBackgroundName('app'));
export const logContentApp = debug(intoContentName('app'));
export const logInjectApp = debug(intoInjectName('app'));

function intoInjectSourceBuffer(logName: string): string {
  return `${intoInjectName('source-buffer-')}${logName}`;
}

export const logInjectSourceBufferEvent = debug(
  intoInjectSourceBuffer('event'),
);
export const logInjectSourceBufferTimestamp = debug(
  intoInjectSourceBuffer('timestamp'),
);
export const logInjectSourceBufferChange = debug(
  intoInjectSourceBuffer('change'),
  true,
);
export const logInjectSourceBufferRemove = debug(
  intoInjectSourceBuffer('remove'),
  true,
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
);
export const logInjectMediaSourceAppend = debug(
  intoInjectMediaSource('append'),
);
export const logInjectMediaSourceRemove = debug(
  intoInjectMediaSource('remove'),
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

export const logInjectHtmlSourceSrc = debug(intoInjectHtml('source-src'));
export const logInjectHtmlVideoSrc = debug(intoInjectHtmlVideo('src'));
export const logInjectHtmlVideoAppend = debug(intoInjectHtmlVideo('append'));
export const logInjectHtmlMediaDuration = debug(
  intoInjectHtml('media-duration'),
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
export const logInjectIDBBufferItemObjectStore = debug(
  intoInjectIDBBufferItem('objectstore'),
  true,
);
export const logInjectIDBBufferItemRequest = debug(
  intoInjectIDBBufferItem('request'),
  true,
);
export const logInjectIDBBufferItemCursor = debug(
  intoInjectIDBBufferItem('cursor'),
  true,
);
export const logInjectIDBBufferItemCreate = debug(
  intoInjectIDBBufferItem('create'),
  true,
);
export const logInjectIDBBufferItemSave = debug(
  intoInjectIDBBufferItem('save'),
  true,
  'green',
);
