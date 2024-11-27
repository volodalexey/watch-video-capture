export type SourceBufferInfo = {
  mimeType: string;
  isVideo: boolean;
  isAudio: boolean;
  counter: number;
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
};

export type PartialMediaStorageItem = Omit<MediaStorageItem, 'info'>;

export type SearchByParams = PartialMediaStorageItem & {
  sourceBuffer?: SourceBuffer;
};
