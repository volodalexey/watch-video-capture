import {
  logInjectIDBBufferItemCreate,
  logInjectIDBBufferItemCursor,
  logInjectIDBBufferItemObjectStore,
  logInjectIDBBufferItemRequest,
  logInjectIDBBufferItemRequestYellow,
  logInjectIDBBufferItemSave,
  logInjectIDBBufferItemSaveYellow,
  logInjectIDBBufferItemTransaction,
  logInjectIDBBufferItemTransactionGreen,
  logInjectIDBBufferItemTransactionRed,
} from '@/common/logger';
import { type MediaStorageItem, type SourceBufferInfo } from '../MediaStorage';
import {
  type SaveWorkflow,
  type BufferStorageIDBItem,
  SaveWorkflowThis,
  SaveWorkflowQueueItem,
} from './IndexedDBStorage.types';
import { type IndexedDBStorage } from './IndexedDBStorage.class';

export function createBufferItem({
  item,
  sourceBufferInfo,
  buffer,
  byteOffset,
}: {
  item: MediaStorageItem;
  sourceBufferInfo: SourceBufferInfo;
  buffer: ArrayBufferLike;
  byteOffset?: number;
}): BufferStorageIDBItem {
  let incremented = false;
  let incrementedBy0 = false;
  let incrementalByteOffset = 0;
  if (!Number.isFinite(byteOffset)) {
    incrementalByteOffset = sourceBufferInfo.incrementalByteOffset;
    sourceBufferInfo.incrementalByteOffset += buffer.byteLength;
    incremented = true;
  } else if (byteOffset === 0) {
    incrementalByteOffset = sourceBufferInfo.incrementalByteOffset;
    sourceBufferInfo.incrementalByteOffset += buffer.byteLength;
    incrementedBy0 = true;
  } else {
    incrementalByteOffset = byteOffset;
  }
  const { isVideo, isAudio, mimeType } = sourceBufferInfo;
  const incrementalByteEnd = incrementalByteOffset + buffer.byteLength;
  const id = `${item.mediaIdHash}-${isVideo ? 'v' : isAudio ? 'a' : '~'}-${incremented ? 'I' : incrementedBy0 ? '0' : 'X'}-${incrementalByteOffset}+${buffer.byteLength}=>${incrementalByteEnd}`;
  logInjectIDBBufferItemCreate(`createBufferItem(${id})`);
  return {
    id,
    mediaIdHash: item.mediaIdHash,
    mimeType,
    isVideo,
    isAudio,
    incrementalByteOffset,
    incrementalByteEnd,
    buffer,
  };
}

export function saveBufferItem(
  storage: IndexedDBStorage,
  item: BufferStorageIDBItem,
): Promise<void> {
  logInjectIDBBufferItemSave(`saveBufferItem(%s)`, item.id);
  return new Promise((resolve, reject) => {
    if (storage.saveWorkflow) {
      logInjectIDBBufferItemSaveYellow(`saveBufferItem(enqueued %s)`, item.id);
      storage.saveWorkflowQueue.push({ resolve, reject, saveItem: item });
      return;
    }

    runSaveBufferItem(storage, resolve, reject, item);
  });
}

function checkNextSaveBufferItem(storage: IndexedDBStorage) {
  const next = storage.saveWorkflowQueue.shift();
  logInjectIDBBufferItemSaveYellow(`checkNextSaveBufferItem(%s)`, next);
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

  const saveWorkflow: SaveWorkflow = {
    resolve,
    reject,
    saveItem,
  } as SaveWorkflow;
  const thisBinded: SaveWorkflowThis = {
    storage,
    saveWorkflow,
  };
  Object.assign(saveWorkflow, {
    resolve,
    reject,
    transaction: idbIndexTransaction,
    objectStore: idbIndexObjectStore,
    request: idbIndexRequest,
    saveItem,
    onSaveWorkflowSuccessBinded: onSaveWorkflowSuccess.bind(thisBinded),
    onSaveWorkflowErrorBinded: onSaveWorkflowError.bind(thisBinded),
    onSaveRequestSuccessBinded: onSaveRequestSuccess.bind(thisBinded),
    onSaveRequestErrorBinded: onSaveRequestError.bind(thisBinded),
  } satisfies SaveWorkflow);

  storage.setSaveWorkflow(saveWorkflow);
  listenSaveWorkflow(saveWorkflow);
  listenSaveRequest(saveWorkflow);
}

function listenSaveWorkflow(saveWorkflow: SaveWorkflow) {
  logInjectIDBBufferItemTransaction('listenSaveWorkflow() %s', saveWorkflow);
  const {
    transaction,
    onSaveWorkflowSuccessBinded,
    onSaveWorkflowErrorBinded,
  } = saveWorkflow;
  transaction.addEventListener('complete', onSaveWorkflowSuccessBinded);
  transaction.addEventListener('error', onSaveWorkflowErrorBinded);
}

function unlistenSaveWorkflow(saveWorkflow: SaveWorkflow) {
  logInjectIDBBufferItemTransaction('unlistenSaveWorkflow() %s', saveWorkflow);
  const {
    transaction,
    onSaveWorkflowSuccessBinded,
    onSaveWorkflowErrorBinded,
  } = saveWorkflow;
  transaction.removeEventListener('complete', onSaveWorkflowSuccessBinded);
  transaction.removeEventListener('error', onSaveWorkflowErrorBinded);
}

function clearSaveWorkflow(
  storage: IndexedDBStorage,
  saveWorkflow: SaveWorkflow,
) {
  logInjectIDBBufferItemTransaction(
    'clearSaveWorkflow() %s %s',
    storage,
    saveWorkflow,
  );
  unlistenSaveWorkflow(saveWorkflow);
  storage.setSaveWorkflow(null);
  checkNextSaveBufferItem(storage);
}

export function onSaveWorkflowSuccess(this: SaveWorkflowThis, e: Event) {
  const { storage, saveWorkflow } = this;
  logInjectIDBBufferItemTransactionGreen(
    'onSaveWorkflowSuccess() %s %s',
    saveWorkflow,
    storage,
  );
  const { resolve } = saveWorkflow;
  resolve();
  clearSaveWorkflow(storage, saveWorkflow);
}

function onSaveWorkflowError(this: SaveWorkflowThis, e: Event) {
  const { storage, saveWorkflow } = this;
  logInjectIDBBufferItemTransactionRed(
    'onSaveWorkflowError() %s %s',
    saveWorkflow,
    storage,
  );
  const { reject } = saveWorkflow;
  if (e && e.target instanceof IDBRequest) {
    reject(e.target.error);
  }
  clearSaveWorkflow(storage, saveWorkflow);
}

function listenSaveRequest(saveWorkflow: SaveWorkflow) {
  logInjectIDBBufferItemRequest('listenSaveRequest() %s', saveWorkflow);
  const { request, onSaveRequestSuccessBinded, onSaveRequestErrorBinded } =
    saveWorkflow;
  request.addEventListener('success', onSaveRequestSuccessBinded);
  request.addEventListener('error', onSaveRequestErrorBinded);
}

function unlistenSaveRequest(saveWorkflow: SaveWorkflow) {
  logInjectIDBBufferItemRequest('unlistenSaveRequest() %s', saveWorkflow);
  const { request, onSaveRequestSuccessBinded, onSaveRequestErrorBinded } =
    saveWorkflow;
  request.removeEventListener('success', onSaveRequestSuccessBinded);
  request.removeEventListener('error', onSaveRequestErrorBinded);
}

function clearSaveRequest(
  storage: IndexedDBStorage,
  saveWorkflow: SaveWorkflow,
) {
  logInjectIDBBufferItemRequest(
    'clearSaveRequest() %s %s',
    storage,
    saveWorkflow,
  );
  unlistenSaveRequest(saveWorkflow);
}

function onSaveRequestSuccess(this: SaveWorkflowThis, e: Event) {
  const { storage, saveWorkflow } = this;
  logInjectIDBBufferItemRequestYellow(
    'onSaveRequestSuccess() %s %s',
    storage,
    saveWorkflow,
  );
  if (e && e.target instanceof IDBRequest) {
    const { saveItem, objectStore } = this.saveWorkflow;
    const cursor = e.target.result;
    if (cursor instanceof IDBCursorWithValue) {
      const cursorItem: BufferStorageIDBItem = cursor.value;
      if (
        cursorItem.incrementalByteOffset < saveItem.incrementalByteOffset &&
        cursorItem.incrementalByteEnd > saveItem.incrementalByteOffset &&
        saveItem.incrementalByteEnd > cursorItem.incrementalByteEnd
      ) {
        /*
         |------------|
         | cursorItem |
         |------------|
                 |------------|
                 |  saveItem  |
                 |------------|
        */
        /*
         |---------------|
         | newCursorItem | xxxxxxxxxx
         |---------------|-------------
                         |------------|
                         |  saveItem  |
                         |------------|
        */
        const newCursorBuffer = cursorItem.buffer.slice(
          0,
          saveItem.incrementalByteOffset - cursorItem.incrementalByteOffset,
        );
        logInjectIDBBufferItemCursor('newCursorBuffer left cursor.update()');
        cursor.update({
          ...cursorItem,
          buffer: newCursorBuffer,
        } as BufferStorageIDBItem);
        return cursor.continue();
      } else if (
        cursorItem.incrementalByteOffset >= saveItem.incrementalByteOffset &&
        cursorItem.incrementalByteEnd <= saveItem.incrementalByteEnd
      ) {
        /*
          |------------|
          | cursorItem |
          |------------|
         |--------------|
         |   saveItem   |
         |--------------|
        */
        // TODO check if buffer array is the same
        logInjectIDBBufferItemCursor('cursor.delete()');
        cursor.delete();
        return cursor.continue();
      } else if (
        cursorItem.incrementalByteOffset > saveItem.incrementalByteOffset &&
        cursorItem.incrementalByteOffset < saveItem.incrementalByteEnd &&
        cursorItem.incrementalByteEnd > saveItem.incrementalByteEnd
      ) {
        /*
             |------------|
             | cursorItem |
             |------------|
         |------------|
         |  saveItem  |
         |------------|
        */
        /*
                      |---------------|
            xxxxxxxxxx| newCursorItem |
         -------------|---------------|
         |------------|
         |  saveItem  |
         |------------|
        */
        const newCursorBuffer = cursorItem.buffer.slice(
          saveItem.incrementalByteEnd - cursorItem.incrementalByteOffset,
        );
        logInjectIDBBufferItemCursor('newCursorBuffer right cursor.update()');
        cursor.update({
          ...cursorItem,
          buffer: newCursorBuffer,
        } as BufferStorageIDBItem);
        return cursor.continue();
      }
      logInjectIDBBufferItemCursor('cursor.continue()');
      return cursor.continue();
    } else {
      logInjectIDBBufferItemObjectStore('objectStore.put(%s)', saveItem.id);
      return objectStore.put(saveItem);
    }
  }
  clearSaveRequest(storage, saveWorkflow);
}

function onSaveRequestError(this: SaveWorkflowThis) {
  const { storage, saveWorkflow } = this;
  logInjectIDBBufferItemRequest(
    'onSaveRequestError() %s %s',
    storage,
    saveWorkflow,
  );
  clearSaveRequest(storage, saveWorkflow);
}
