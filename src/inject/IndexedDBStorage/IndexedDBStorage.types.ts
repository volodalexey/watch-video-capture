import { type IndexedDBStorage } from './IndexedDBStorage.class';

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

export type SaveWorkflowThis = {
  storage: IndexedDBStorage;
  saveWorkflow: SaveWorkflow;
};

export type SaveWorkflowQueueItem = {
  saveItem: BufferStorageIDBItem;
  resolve: () => unknown;
  reject: (e: Error) => unknown;
};

export type SaveWorkflow = SaveWorkflowQueueItem & {
  transaction: IDBTransaction;
  objectStore: IDBObjectStore;
  request: IDBRequest<IDBCursorWithValue | null>;
  onSaveWorkflowSuccessBinded: (this: SaveWorkflowThis, e: Event) => unknown;
  onSaveWorkflowErrorBinded: (this: SaveWorkflowThis, e: Event) => unknown;
  onSaveRequestSuccessBinded: (this: SaveWorkflowThis, e: Event) => unknown;
  onSaveRequestErrorBinded: (this: SaveWorkflowThis, e: Event) => unknown;
};
