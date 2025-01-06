export type SourceBufferInfo = {
  mimeType: string;
  mimeTypeHash: string;
  isVideo: boolean;
  isAudio: boolean;
  viewByteOffset: number;
  rawByteOffset: number;
  onUpdateEnd?: EventListener;
};

export type MediaStorageItem = {
  mediaId?: string;
  mediaIdHash?: string;
  mediaSource?: MediaSource;
  mediaSourceUrl?: string;
  htmlVideoElement?: HTMLVideoElement;
  htmlAudioElement?: HTMLAudioElement;
  htmlSourceElement?: HTMLSourceElement;
  info: Map<SourceBuffer, SourceBufferInfo>;
  downloadPopupOpen: boolean;
};

export type PartialMediaStorageItem = Omit<
  MediaStorageItem,
  'info' | 'sourceEndedCalled' | 'downloadPopupOpen'
>;

export type SearchByParams = PartialMediaStorageItem & {
  sourceBuffer?: SourceBuffer;
};
