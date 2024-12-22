export type TMessageSource =
  | 'background'
  | 'popup'
  | 'options'
  | 'inject'
  | 'content';

type TMediaStorageItemMessageType = 'mediaStorageItem';

export type TInjectMessage = TInjectMediaStorageItemMessage;

export type TSerializedTimeRanges = Array<[number, number]>;

export type TSerializedMediaStorageItem = {
  mediaId: string;
  mediaIdHash: string;
  mediaSourceUrl: string;
  duration: number;
  buffered: TSerializedTimeRanges;
  seekable: TSerializedTimeRanges;
};

export type TInjectMediaStorageItemMessage = {
  source: 'inject';
  type: TMediaStorageItemMessageType;
  payload: TSerializedMediaStorageItem;
};

export type TContentMediaStorageItemMessage = {
  source: 'content';
  type: TMediaStorageItemMessageType;
  payload: TSerializedMediaStorageItem;
};

export type TContentDownloadMediaStorageItemMessage = {
  source: 'content';
  type: TDownloadMediaStorageItemMessageType;
  payload: TSerializedMediaStorageItem['mediaIdHash'];
};

export type TContentMessage =
  | TContentMediaStorageItemMessage
  | TContentDownloadMediaStorageItemMessage;

type TDownloadMediaStorageItemMessageType = 'downloadMediaStorageItem';

export type TPopupMessage = TPopupDownloadMediaStorageItemMessage;

export type TPopupDownloadMediaStorageItemMessage = {
  source: 'popup';
  type: TDownloadMediaStorageItemMessageType;
  payload: TSerializedMediaStorageItem['mediaIdHash'];
};

export type TMessage =
  | TInjectMediaStorageItemMessage
  | TContentMediaStorageItemMessage
  | TPopupDownloadMediaStorageItemMessage;
