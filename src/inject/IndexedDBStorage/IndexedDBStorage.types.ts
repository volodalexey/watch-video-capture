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

type keys = keyof BufferStorageIDBItem;

export type BufferStorageIDBItemOffsetStart = Extract<
  keys,
  'viewByteOffset' | 'rawByteOffset'
>;
export type BufferStorageIDBItemOffsetEnd = Extract<
  keys,
  'viewByteEnd' | 'rawByteEnd'
>;

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

export type GetWorkflowResponse<T> = Record<string, Array<T>>;

export type GetWorkflowInitial = {
  mediaIdHash: BufferStorageIDBItem['mediaIdHash'];
  serializer?: (item: BufferStorageIDBItem) => TSerializedBufferStorageIDBItem;
  resolve: <T>(response: GetWorkflowResponse<T>) => unknown;
  reject: (e: Error) => unknown;
};

export type GetWorkflowThis<T> = {
  storage: IndexedDBStorage;
  getWorkflow: GetWorkflow<T>;
};

export type GetWorkflow<T> = GetWorkflowInitial & {
  transaction: IDBTransaction;
  objectStore: IDBObjectStore;
  request: IDBRequest<IDBCursorWithValue | null>;
  response: GetWorkflowResponse<T>;
  onGetWorkflowSuccessBinded: (this: GetWorkflowThis<T>, e: Event) => unknown;
  onGetWorkflowErrorBinded: (this: GetWorkflowThis<T>, e: Event) => unknown;
  onGetRequestSuccessBinded: (this: GetWorkflowThis<T>, e: Event) => unknown;
  onGetRequestErrorBinded: (this: GetWorkflowThis<T>, e: Event) => unknown;
};

export type DeleteWorkflowResponse = {
  deleted: Array<TSerializedBufferStorageIDBItem>;
};

export type DeleteWorkflowInitial = {
  mediaIdHash: BufferStorageIDBItem['mediaIdHash'];
  resolve: (response: DeleteWorkflowResponse) => unknown;
  reject: (e: Error) => unknown;
};

export type DeleteWorkflowThis = {
  storage: IndexedDBStorage;
  deleteWorkflow: DeleteWorkflow;
};

export type DeleteWorkflow = DeleteWorkflowInitial & {
  transaction: IDBTransaction;
  objectStore: IDBObjectStore;
  requestOpen: IDBRequest<IDBCursorWithValue | null>;
  requestDelete: IDBRequest<IDBCursorWithValue | null>;
  response: DeleteWorkflowResponse;
  onDeleteWorkflowSuccessBinded: (
    this: DeleteWorkflowThis,
    e: Event,
  ) => unknown;
  onDeleteWorkflowErrorBinded: (this: DeleteWorkflowThis, e: Event) => unknown;
  onDeleteOpenRequestSuccessBinded: (
    this: DeleteWorkflowThis,
    e: Event,
  ) => unknown;
  onDeleteOpenRequestErrorBinded: (
    this: DeleteWorkflowThis,
    e: Event,
  ) => unknown;
  onDeleteRequestSuccessBinded: (
    this: DeleteWorkflowThis,
    e: Event,
  ) => unknown | null;
  onDeleteRequestErrorBinded: (
    this: DeleteWorkflowThis,
    e: Event,
  ) => unknown | null;
};
