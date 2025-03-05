import { logInjectIDBBufferItemCursorMagenta } from '@/common/logger';

import { type IndexedDBStorage } from '../IndexedDBStorage.class';
import {
  type DeleteWorkflowThis,
  type DeleteWorkflow,
  BufferStorageIDBItem,
} from '../IndexedDBStorage.types';
import { serializeBufferStorageIDBItem } from '../IndexedDBStorage.utils';

export function listenDeleteOpenRequest(deleteWorkflow: DeleteWorkflow) {
  const {
    requestOpen,
    onDeleteOpenRequestSuccessBinded,
    onDeleteOpenRequestErrorBinded,
  } = deleteWorkflow;
  requestOpen.addEventListener('success', onDeleteOpenRequestSuccessBinded);
  requestOpen.addEventListener('error', onDeleteOpenRequestErrorBinded);
}

function unlistenDeleteOpenRequest(deleteWorkflow: DeleteWorkflow) {
  const {
    requestOpen,
    onDeleteOpenRequestSuccessBinded,
    onDeleteOpenRequestErrorBinded,
  } = deleteWorkflow;
  requestOpen.removeEventListener('success', onDeleteOpenRequestSuccessBinded);
  requestOpen.removeEventListener('error', onDeleteOpenRequestErrorBinded);
}

export function clearDeleteOpenRequest(
  storage: IndexedDBStorage,
  deleteWorkflow: DeleteWorkflow,
) {
  unlistenDeleteOpenRequest(deleteWorkflow);
}

export function onDeleteOpenRequestSuccess(this: DeleteWorkflowThis, e: Event) {
  const { storage, deleteWorkflow } = this;
  if (e && e.target instanceof IDBRequest) {
    const { response } = deleteWorkflow;
    const cursor = e.target.result;
    if (cursor instanceof IDBCursorWithValue) {
      const cursorItem: BufferStorageIDBItem = cursor.value;
      if (!Array.isArray(response.deleted)) {
        response.deleted = [];
      }
      response.deleted.push(serializeBufferStorageIDBItem(cursorItem));
      logInjectIDBBufferItemCursorMagenta('cursor.delete(%s)', cursorItem.id);
      unlistenDeleteRequest(deleteWorkflow);
      deleteWorkflow.requestDelete = cursor.delete();
      listenDeleteRequest(deleteWorkflow);
      return cursor.continue();
    }
  }
  clearDeleteOpenRequest(storage, deleteWorkflow);
}

export function onDeleteOpenRequestError(this: DeleteWorkflowThis) {
  const { storage, deleteWorkflow } = this;
  clearDeleteOpenRequest(storage, deleteWorkflow);
}

function listenDeleteRequest(deleteWorkflow: DeleteWorkflow) {
  const {
    requestDelete,
    onDeleteRequestSuccessBinded,
    onDeleteRequestErrorBinded,
  } = deleteWorkflow;
  requestDelete.addEventListener('success', onDeleteRequestSuccessBinded);
  requestDelete.addEventListener('error', onDeleteRequestErrorBinded);
}

function unlistenDeleteRequest(deleteWorkflow: DeleteWorkflow) {
  const {
    requestDelete,
    onDeleteRequestSuccessBinded,
    onDeleteRequestErrorBinded,
  } = deleteWorkflow;
  requestDelete?.removeEventListener('success', onDeleteRequestSuccessBinded);
  requestDelete?.removeEventListener('error', onDeleteRequestErrorBinded);
}

function clearDeleteRequest(
  storage: IndexedDBStorage,
  deleteWorkflow: DeleteWorkflow,
) {
  unlistenDeleteRequest(deleteWorkflow);
}

export function onDeleteRequestError(this: DeleteWorkflowThis) {
  const { storage, deleteWorkflow } = this;
  clearDeleteRequest(storage, deleteWorkflow);
}

export function onDeleteRequestSuccess(this: DeleteWorkflowThis, e: Event) {
  const { storage, deleteWorkflow } = this;
  if (e && e.target instanceof IDBRequest) {
    const cursor = e.target.result;
    if (cursor instanceof IDBCursor) {
      cursor.continue();
      return;
    }
  }
  clearDeleteRequest(storage, deleteWorkflow);
}
