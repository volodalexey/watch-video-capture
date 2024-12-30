export type TMessageSource =
  | 'background'
  | 'popup'
  | 'options'
  | 'inject'
  | 'content';

type TMediaStorageItemMessageType = 'mediaStorageItem';
type TIDBStorageItemsMessageType = 'IDBStorageItems';

export type TInjectMessage =
  | TInjectMediaStorageItemMessage
  | TInjectIDBStorageItemsMessage;

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

export type TInjectIDBStorageItemsMessage = {
  source: 'inject';
  type: TIDBStorageItemsMessageType;
  payload: {
    mediaIdHash: string;
    captured: Record<string, TSerializedBufferStorageIDBItem[]>;
  };
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

export type TContentIDBStorageItemsMessage = {
  source: 'content';
  type: TIDBStorageItemsMessageType;
  payload: {
    mediaIdHash: string;
    captured: Record<string, TSerializedBufferStorageIDBItem[]>;
  };
};

export type TContentRefreshAllMediaStorageItemsMessage = {
  source: 'content';
  type: TRefreshAllMediaStorageItemsType;
  payload: null;
};

export type TContentMessage =
  | TContentMediaStorageItemMessage
  | TContentDownloadMediaStorageItemMessage
  | TContentIDBStorageItemsMessage
  | TContentRefreshAllMediaStorageItemsMessage;

type TDownloadMediaStorageItemMessageType = 'downloadMediaStorageItem';

export type TPopupMessage =
  | TPopupDownloadMediaStorageItemMessage
  | TPopupRefreshAllMediaStorageItemsMessage;

export type TPopupDownloadMediaStorageItemMessage = {
  source: 'popup';
  type: TDownloadMediaStorageItemMessageType;
  payload: TSerializedMediaStorageItem['mediaIdHash'];
};

type TRefreshAllMediaStorageItemsType = 'refreshAllMediaStorageItems';

export type TPopupRefreshAllMediaStorageItemsMessage = {
  source: 'popup';
  type: TRefreshAllMediaStorageItemsType;
  payload: null;
};

export type TMessage =
  | TInjectMediaStorageItemMessage
  | TContentMediaStorageItemMessage
  | TPopupDownloadMediaStorageItemMessage;

export type TSerializedBufferStorageIDBItem = {
  id: string;
  isView: boolean;
  viewByteOffset: number;
  viewByteEnd: number;
  rawByteOffset: number;
  rawByteEnd: number;
};
