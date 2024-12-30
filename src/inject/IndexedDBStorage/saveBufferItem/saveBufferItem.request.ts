import {
  logInjectIDBBufferItemCursor,
  logInjectIDBBufferItemCursorMagenta,
  logInjectIDBBufferItemCursorRed,
  logInjectIDBBufferItemCursorYellow,
  logInjectIDBBufferItemObjectStore,
  logInjectIDBBufferItemRequest,
} from '@/common/logger';
import {
  type BufferStorageIDBItem,
  type SaveWorkflow,
  type SaveWorkflowThis,
} from '../IndexedDBStorage.types';
import { type IndexedDBStorage } from '../IndexedDBStorage.class';
import { serializeBufferStorageIDBItem } from '../IndexedDBStorage.utils';

export function listenSaveRequest(saveWorkflow: SaveWorkflow) {
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

export function onSaveRequestSuccess(this: SaveWorkflowThis, e: Event) {
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

export function onSaveRequestError(this: SaveWorkflowThis) {
  const { storage, saveWorkflow } = this;
  logInjectIDBBufferItemRequest(
    'onSaveRequestError() %s %s',
    storage,
    saveWorkflow,
  );
  clearSaveRequest(storage, saveWorkflow);
}
