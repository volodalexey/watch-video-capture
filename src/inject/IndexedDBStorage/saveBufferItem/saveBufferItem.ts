import {
  logInjectIDBBufferItemSave,
  logInjectIDBBufferItemSaveMagenta,
  logInjectIDBBufferItemSaveYellow,
} from '@/common/logger';
import { type IndexedDBStorage } from '../IndexedDBStorage.class';
import {
  type SaveWorkflowResponse,
  type BufferStorageIDBItem,
  type SaveWorkflowQueueItem,
  type SaveWorkflow,
  type SaveWorkflowThis,
} from '../IndexedDBStorage.types';
import {
  listenSaveWorkflow,
  onSaveWorkflowError,
  onSaveWorkflowSuccess,
} from './saveBufferItem.workflow';
import {
  listenSaveRequest,
  onSaveRequestError,
  onSaveRequestSuccess,
} from './saveBufferItem.request';

export function saveBufferItem(
  storage: IndexedDBStorage,
  item: BufferStorageIDBItem,
): Promise<SaveWorkflowResponse> {
  logInjectIDBBufferItemSave(`saveBufferItem(%s)`, item.id);
  return new Promise<SaveWorkflowResponse>((resolve, reject) => {
    if (storage.saveWorkflow) {
      logInjectIDBBufferItemSaveYellow(`saveBufferItem(enqueued %s)`, item.id);
      storage.saveWorkflowQueue.push({ resolve, reject, saveItem: item });
      return;
    }

    runSaveBufferItem(storage, resolve, reject, item);
  });
}

export function checkNextSaveBufferItem(storage: IndexedDBStorage) {
  const next = storage.saveWorkflowQueue.shift();
  logInjectIDBBufferItemSaveMagenta(`checkNextSaveBufferItem(%s)`, next);
  if (next) {
    runSaveBufferItem(storage, next.resolve, next.reject, next.saveItem);
  }
}

function runSaveBufferItem(
  storage: IndexedDBStorage,
  resolve: SaveWorkflowQueueItem['resolve'],
  reject: SaveWorkflowQueueItem['reject'],
  saveItem: SaveWorkflowQueueItem['saveItem'],
) {
  logInjectIDBBufferItemSave(`runSaveBufferItem(%s)`, saveItem.id);
  const idbIndexTransaction = storage.db.transaction(
    storage.tableName,
    'readwrite',
  );

  const idbIndexObjectStore = idbIndexTransaction.objectStore(
    storage.tableName,
  );

  const idbIndexRequest = idbIndexObjectStore
    .index(storage.indexName)
    .openCursor(IDBKeyRange.only(saveItem.mediaIdHash));

  const saveWorkflow: SaveWorkflow = {} as SaveWorkflow;
  const thisBinded: SaveWorkflowThis = {
    storage,
    saveWorkflow,
  };
  Object.assign(saveWorkflow, {
    resolve,
    reject,
    saveItem,
    transaction: idbIndexTransaction,
    objectStore: idbIndexObjectStore,
    request: idbIndexRequest,
    response: {},
    onSaveWorkflowSuccessBinded: onSaveWorkflowSuccess.bind(thisBinded),
    onSaveWorkflowErrorBinded: onSaveWorkflowError.bind(thisBinded),
    onSaveRequestSuccessBinded: onSaveRequestSuccess.bind(thisBinded),
    onSaveRequestErrorBinded: onSaveRequestError.bind(thisBinded),
  } satisfies SaveWorkflow);

  storage.setSaveWorkflow(saveWorkflow);
  listenSaveWorkflow(saveWorkflow);
  listenSaveRequest(saveWorkflow);
}
