export type TMessageSource =
  | 'background'
  | 'popup'
  | 'options'
  | 'inject'
  | 'content';

type TMediaStorageItemMessageType = 'mediaStorageItem';

export type TInjectMessage = TInjectMediaStorageItemMessage;

export type TSerializedMediaStorageItem = {
  mediaId: string;
  mediaIdHash: string;
  mediaSourceUrl: string;
  buffered: Array<[number, number]>;
  seekable: Array<[number, number]>;
};

export type TInjectMediaStorageItemMessage = {
  source: 'inject';
  type: TMediaStorageItemMessageType;
  payload: TSerializedMediaStorageItem;
};

export type TContentMessage = TContentMediaStorageItemMessage;

export type TContentMediaStorageItemMessage = {
  source: 'content';
  type: TMediaStorageItemMessageType;
  payload: TSerializedMediaStorageItem;
};

export type TMessage =
  | TInjectMediaStorageItemMessage
  | TContentMediaStorageItemMessage;
