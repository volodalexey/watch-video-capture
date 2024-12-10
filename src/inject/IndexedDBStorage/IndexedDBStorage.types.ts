export type BufferStorageIDBItem = {
  id: string;
  mediaIdHash: string;
  mimeType: string;
  isVideo: boolean;
  isAudio: boolean;
  incrementalByteOffset: number;
  incrementalByteEnd: number;
  buffer: ArrayBufferLike;
};
