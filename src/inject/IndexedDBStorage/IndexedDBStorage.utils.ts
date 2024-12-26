import {
  logInjectIDBBufferItemCreate,
  logInjectIDBBufferItemCursor,
  logInjectIDBBufferItemCursorMagenta,
  logInjectIDBBufferItemCursorRed,
  logInjectIDBBufferItemCursorYellow,
  logInjectIDBBufferItemObjectStore,
  logInjectIDBBufferItemRequest,
  logInjectIDBBufferItemSave,
  logInjectIDBBufferItemSaveMagenta,
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
  SaveWorkflowResponse,
} from './IndexedDBStorage.types';
import { type IndexedDBStorage } from './IndexedDBStorage.class';
import { TSerializedBufferStorageIDBItem } from '@/common/message';

export function createBufferItem({
  item,
  sourceBufferInfo,
  buffer,
  byteOffset,
  isView,
}: {
  item: MediaStorageItem;
  sourceBufferInfo: SourceBufferInfo;
  buffer: ArrayBufferLike;
  byteOffset?: number;
  isView: boolean;
}): BufferStorageIDBItem {
  let incrementedBy0 = false;
  let viewByteOffset = 0;
  let viewByteEnd = 0;
  let rawByteOffset = 0;
  let rawByteEnd = 0;
  if (isView) {
    if (byteOffset === 0) {
      viewByteOffset = sourceBufferInfo.viewByteOffset;
      sourceBufferInfo.viewByteOffset += buffer.byteLength;
      incrementedBy0 = true;
    } else {
      viewByteOffset = byteOffset;
    }
    viewByteEnd = viewByteOffset + buffer.byteLength;
  } else {
    rawByteOffset = sourceBufferInfo.rawByteOffset;
    sourceBufferInfo.rawByteOffset += buffer.byteLength;
    incrementedBy0 = true;
    rawByteEnd = rawByteOffset + buffer.byteLength;
  }
  const { isVideo, isAudio, mimeType } = sourceBufferInfo;
  const bufferPart = isView
    ? `${viewByteOffset}+${buffer.byteLength}=>${viewByteEnd}`
    : `${rawByteOffset}+${buffer.byteLength}=>${rawByteEnd}`;
  const id = `${item.mediaIdHash}-${isVideo ? '📺' : isAudio ? '🎵' : '~'}-${isView ? '👁️' : '💾'}${incrementedBy0 ? '0️⃣' : '❎'}-${bufferPart}`;
  logInjectIDBBufferItemCreate(`createBufferItem(${id})`);
  return {
    id,
    mediaIdHash: item.mediaIdHash,
    mimeType,
    isVideo,
    isAudio,
    isView,
    viewByteOffset,
    viewByteEnd,
    rawByteOffset,
    rawByteEnd,
    buffer,
  };
}

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

function checkNextSaveBufferItem(storage: IndexedDBStorage) {
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
    response: {},
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
  const { resolve, response } = saveWorkflow;
  resolve(response);
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
  logInjectIDBBufferItemRequest(
    'onSaveRequestSuccess() %s %s',
    storage,
    saveWorkflow,
  );
  if (e && e.target instanceof IDBRequest) {
    const { saveItem, objectStore, response } = this.saveWorkflow;
    const cursor = e.target.result;
    if (cursor instanceof IDBCursorWithValue) {
      const cursorItem: BufferStorageIDBItem = cursor.value;
      const isTypeMatch =
        cursorItem.isView === saveItem.isView &&
        cursorItem.mimeType === saveItem.mimeType;
      if (!Array.isArray(response[cursorItem.mimeType])) {
        response[cursorItem.mimeType] = [];
      }
      response[cursorItem.mimeType] = response[cursorItem.mimeType].filter(
        (item) => item.id !== cursorItem.id,
      );
      if (
        isTypeMatch &&
        cursorItem.viewByteOffset < saveItem.viewByteOffset &&
        cursorItem.viewByteEnd > saveItem.viewByteOffset &&
        saveItem.viewByteEnd > cursorItem.viewByteEnd
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
          saveItem.viewByteOffset - cursorItem.viewByteOffset,
        );
        logInjectIDBBufferItemCursorYellow(
          '[%s] newCursorBuffer left cursor.update(%s)',
          saveItem.id,
          cursorItem.id,
        );
        const newCursorItem: BufferStorageIDBItem = {
          ...cursorItem,
          buffer: newCursorBuffer,
        };
        cursor.update(newCursorItem);
        response[cursorItem.mimeType].push(
          serializeBufferStorageIDBItem(newCursorItem),
        );
        return cursor.continue();
      } else if (
        isTypeMatch &&
        cursorItem.viewByteOffset >= saveItem.viewByteOffset &&
        cursorItem.viewByteEnd <= saveItem.viewByteEnd
      ) {
        if (
          cursorItem.viewByteOffset === saveItem.viewByteOffset &&
          cursorItem.viewByteEnd === saveItem.viewByteEnd
        ) {
          // found the same item => skip iteration
          logInjectIDBBufferItemCursorYellow(
            '[%s] cursor.skip(%s)',
            saveItem.id,
            cursorItem.id,
          );
          response[cursorItem.mimeType].push(
            serializeBufferStorageIDBItem(cursorItem),
          );
          return;
        }
        /*
          |------------|
          | cursorItem |
          |------------|
         |--------------|
         |   saveItem   |
         |--------------|
        */
        // TODO check if buffer array is the same
        logInjectIDBBufferItemCursorRed(
          '[%s] cursor.delete(%s)',
          saveItem.id,
          cursorItem.id,
        );
        cursor.delete();
        return cursor.continue();
      } else if (
        isTypeMatch &&
        cursorItem.viewByteOffset > saveItem.viewByteOffset &&
        cursorItem.viewByteOffset < saveItem.viewByteEnd &&
        cursorItem.viewByteEnd > saveItem.viewByteEnd
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
          saveItem.viewByteEnd - cursorItem.viewByteOffset,
        );
        logInjectIDBBufferItemCursorMagenta(
          '[%s] newCursorBuffer right cursor.update(%s)',
          saveItem.id,
          cursorItem.id,
        );
        const newCursorItem: BufferStorageIDBItem = {
          ...cursorItem,
          buffer: newCursorBuffer,
        };
        response[cursorItem.mimeType].push(
          serializeBufferStorageIDBItem(newCursorItem),
        );
        cursor.update(newCursorItem);
        return cursor.continue();
      }
      logInjectIDBBufferItemCursor(
        '[%s] cursor.continue(%s)',
        saveItem.id,
        cursorItem.id,
      );
      response[cursorItem.mimeType].push(
        serializeBufferStorageIDBItem(cursorItem),
      );
      return cursor.continue();
    } else {
      logInjectIDBBufferItemObjectStore('objectStore.put(%s)', saveItem.id);
      if (!Array.isArray(response[saveItem.mimeType])) {
        response[saveItem.mimeType] = [];
      }
      response[saveItem.mimeType].push(serializeBufferStorageIDBItem(saveItem));
      objectStore.put(saveItem);
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

export function serializeBufferStorageIDBItem(
  item: BufferStorageIDBItem,
): TSerializedBufferStorageIDBItem {
  return {
    id: item.id,
    isView: item.isView,
    viewByteOffset: item.viewByteOffset,
    viewByteEnd: item.viewByteEnd,
    rawByteOffset: item.rawByteOffset,
    rawByteEnd: item.rawByteEnd,
  };
}
