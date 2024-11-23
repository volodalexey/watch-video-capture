import { TargetOrigin } from './message.constants';
import {
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
