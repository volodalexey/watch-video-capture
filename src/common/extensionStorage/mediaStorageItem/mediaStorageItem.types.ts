import {
  type TSerializedBufferStorageIDBItem,
  type TSerializedTimeRanges,
} from '@/common/message';

export type TExtensionMediaStorageItem = {
  originUrl: string;
  mediaId: string;
  mediaIdHash: string;
  mediaSourceUrl: string;
  duration: number;
  buffered: TSerializedTimeRanges;
  seekable: TSerializedTimeRanges;
  captured: Record<string, TSerializedBufferStorageIDBItem[]>;
};
