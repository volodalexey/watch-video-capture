export type TMessageSource =
  | 'background'
  | 'popup'
  | 'options'
  | 'inject'
  | 'content';

type TBufferMessageType = 'buffer';

export type TInjectMessage = TInjectBufferMessage;

export type TInjectBufferMessage = {
  source: 'inject';
  type: TBufferMessageType;
  payload: { buffer: Array<number> };
};

export type TContentMessage = TContentBufferMessage;

export type TContentBufferMessage = {
  source: 'content';
  type: TBufferMessageType;
  payload: { buffer: Array<number> };
};

export type TMessage = TInjectBufferMessage | TContentBufferMessage;
