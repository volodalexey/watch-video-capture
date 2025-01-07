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

type TMediaStorageItemMessagePayload = {
  originUrl: string;
  serializedItem: TSerializedMediaStorageItem;
};

export type TInjectMediaStorageItemMessage = {
  source: 'inject';
  type: TMediaStorageItemMessageType;
  payload: TMediaStorageItemMessagePayload;
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
  payload: TMediaStorageItemMessagePayload;
};

export type TContentDownloadMediaStorageItemMessage = {
  source: 'content';
  type: TDownloadMediaStorageItemMessageType;
  payload: TDownloadMediaStorageItemMessagePayload;
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
  payload: TRefreshAllMediaStorageItemsPayload;
};

export type TContentClearMediaStorageItemMessage = {
  source: 'content';
  type: TClearMediaStorageItemMessageType;
  payload: TClearMediaStorageItemMessagePayload;
};

export type TContentMessage =
  | TContentMediaStorageItemMessage
  | TContentDownloadMediaStorageItemMessage
  | TContentIDBStorageItemsMessage
  | TContentRefreshAllMediaStorageItemsMessage
  | TContentClearMediaStorageItemMessage;

type TDownloadMediaStorageItemMessageType = 'downloadMediaStorageItem';
type TDownloadMediaStorageItemMessagePayload = { mediaIdHash: string };

export type TPopupMessage =
  | TPopupDownloadMediaStorageItemMessage
  | TPopupRefreshAllMediaStorageItemsMessage
  | TPopupClearMediaStorageItemMessage;

export type TPopupDownloadMediaStorageItemMessage = {
  source: 'popup';
  type: TDownloadMediaStorageItemMessageType;
  payload: TDownloadMediaStorageItemMessagePayload;
};

type TClearMediaStorageItemMessageType = 'clearMediaStorageItem';
type TClearMediaStorageItemMessagePayload = {
  mediaIdHash: string;
  deleteItem: boolean;
};

export type TPopupClearMediaStorageItemMessage = {
  source: 'popup';
  type: TClearMediaStorageItemMessageType;
  payload: TClearMediaStorageItemMessagePayload;
};

type TRefreshAllMediaStorageItemsType = 'refreshAllMediaStorageItems';
type TRefreshAllMediaStorageItemsPayload = {};

export type TPopupRefreshAllMediaStorageItemsMessage = {
  source: 'popup';
  type: TRefreshAllMediaStorageItemsType;
  payload: TRefreshAllMediaStorageItemsPayload;
};

export type TMessage = TInjectMessage | TContentMessage | TPopupMessage;

export type TSerializedBufferStorageIDBItem = {
  id: string;
  isView: boolean;
  viewByteOffset: number;
  viewByteEnd: number;
  rawByteOffset: number;
  rawByteEnd: number;
};
