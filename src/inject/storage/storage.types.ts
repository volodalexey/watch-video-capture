export type MediaStorageItem = {
  mediaSource?: MediaSource;
  mediaSourceUrl?: string;
};

export type SearchByParams = MediaStorageItem & {
  sourceBuffer?: SourceBuffer;
};
