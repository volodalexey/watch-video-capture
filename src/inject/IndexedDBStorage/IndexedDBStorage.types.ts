import { TSerializedBufferStorageIDBItem } from '@/common/message';
import { type IndexedDBStorage } from './IndexedDBStorage.class';

export type BufferStorageIDBItem = {
  id: string;
  mediaIdHash: string;
  mimeType: string;
  isVideo: boolean;
  isAudio: boolean;
  isView: boolean;
  viewByteOffset: number;
  viewByteEnd: number;
  rawByteOffset: number;
  rawByteEnd: number;
  buffer: ArrayBufferLike;
};

export type SaveWorkflowThis = {
  storage: IndexedDBStorage;
  saveWorkflow: SaveWorkflow;
};

export type SaveWorkflowResponse = Record<
  string,
  TSerializedBufferStorageIDBItem[]
>;

export type SaveWorkflowQueueItem = {
  saveItem: BufferStorageIDBItem;
  resolve: (response: SaveWorkflowResponse) => unknown;
  reject: (e: Error) => unknown;
};

export type SaveWorkflow = SaveWorkflowQueueItem & {
  transaction: IDBTransaction;
  objectStore: IDBObjectStore;
  request: IDBRequest<IDBCursorWithValue | null>;
  response: SaveWorkflowResponse;
  onSaveWorkflowSuccessBinded: (this: SaveWorkflowThis, e: Event) => unknown;
  onSaveWorkflowErrorBinded: (this: SaveWorkflowThis, e: Event) => unknown;
  onSaveRequestSuccessBinded: (this: SaveWorkflowThis, e: Event) => unknown;
  onSaveRequestErrorBinded: (this: SaveWorkflowThis, e: Event) => unknown;
};
