export type SourceBufferInfo = {
  mimeType: string;
  mimeTypeHash: string;
  isVideo: boolean;
  isAudio: boolean;
  incrementalByteOffset: number;
  onUpdateEndMock?: EventListener;
  onUpdateEndOriginal?: EventListener;
};

export type MediaStorageItem = {
  mediaId?: string;
  mediaIdHash?: string;
  mediaSource?: MediaSource;
  mediaSourceUrl?: string;
  htmlVideoElement?: HTMLVideoElement;
  htmlSourceElement?: HTMLSourceElement;
  info: Map<SourceBuffer, SourceBufferInfo>;
  sourceEndedCalled: boolean;
};

export type PartialMediaStorageItem = Omit<
  MediaStorageItem,
  'info' | 'sourceEndedCalled'
>;

export type SearchByParams = PartialMediaStorageItem & {
  sourceBuffer?: SourceBuffer;
};
