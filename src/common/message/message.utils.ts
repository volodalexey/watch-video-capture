import { TargetOrigin } from './message.constants';
import {
  TPopupMessage,
  type TContentMessage,
  type TInjectMessage,
  type TMessage,
} from './message.types';

export function isMessage(message: unknown): message is TMessage {
  if (typeof message === 'object' && 'type' in message && 'source' in message) {
    return true;
  }
}

export function isInjectMessage(message: unknown): message is TInjectMessage {
  if (isMessage(message)) {
    return message.source === 'inject';
  }
}

export function isContentMessage(message: unknown): message is TContentMessage {
  if (isMessage(message)) {
    return message.source === 'content';
  }
}

export function isPopupMessage(message: unknown): message is TPopupMessage {
  if (isMessage(message)) {
    return message.source === 'popup';
  }
}

export function sendInjectMessage(message: Omit<TInjectMessage, 'source'>) {
  globalThis.postMessage(
    { ...message, source: 'inject' } as TInjectMessage,
    TargetOrigin,
  );
}

export function sendContentToBackgroundMessage(
  message: Omit<TContentMessage, 'source'>,
) {
  browser.runtime.sendMessage({
    ...message,
    source: 'content',
  } as TContentMessage);
}

export async function sendPopupToContentMessage(
  message: Omit<TPopupMessage, 'source'>,
) {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (tabs.length) {
    browser.tabs.sendMessage(tabs[0].id, {
      ...message,
      source: 'popup',
    } as TPopupMessage);
  }
}

export function sendContentToInjectMessage(
  message: Omit<TContentMessage, 'source'>,
) {
  globalThis.postMessage({ ...message, source: 'content' } as TContentMessage);
}
