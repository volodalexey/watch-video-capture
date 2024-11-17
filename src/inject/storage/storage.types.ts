export type SourceBufferInfo = {
  mimeType: string;
  isVideo: boolean;
  isAudio: boolean;
  segments: MediaSegment[];
  onUpdateEndMock?: EventListener;
  onUpdateEndOriginal?: EventListener;
};
export type MediaSegment = { from: number; to: number };

export type MediaStorageItem = {
  mediaSource?: MediaSource;
  mediaSourceUrl?: string;
  info: Map<SourceBuffer, SourceBufferInfo>;
};

export type PartialMediaStorageItem = Omit<MediaStorageItem, 'info'>;

export type SearchByParams = PartialMediaStorageItem & {
  sourceBuffer?: SourceBuffer;
};
