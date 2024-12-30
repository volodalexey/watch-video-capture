import { type IndexedDBStorage } from '../IndexedDBStorage.class';
import {
  type GetWorkflowThis,
  type GetWorkflow,
  type BufferStorageIDBItem,
} from '../IndexedDBStorage.types';

export function listenGetRequest<T>(getWorkflow: GetWorkflow<T>) {
  const { request, onGetRequestSuccessBinded, onGetRequestErrorBinded } =
    getWorkflow;
  request.addEventListener('success', onGetRequestSuccessBinded);
  request.addEventListener('error', onGetRequestErrorBinded);
}

function unlistenGetRequest<T>(getWorkflow: GetWorkflow<T>) {
  const { request, onGetRequestSuccessBinded, onGetRequestErrorBinded } =
    getWorkflow;
  request.removeEventListener('success', onGetRequestSuccessBinded);
  request.removeEventListener('error', onGetRequestErrorBinded);
}

export function clearGetRequest<T>(
  storage: IndexedDBStorage,
  getWorkflow: GetWorkflow<T>,
) {
  unlistenGetRequest(getWorkflow);
}

export function onGetRequestSuccess<T>(this: GetWorkflowThis<T>, e: Event) {
  const { storage, getWorkflow } = this;
  if (e && e.target instanceof IDBRequest) {
    const { response, serializer } = getWorkflow;
    const cursor = e.target.result;
    if (cursor instanceof IDBCursorWithValue) {
      const cursorItem: BufferStorageIDBItem = cursor.value;
      if (!Array.isArray(response[cursorItem.mimeType])) {
        response[cursorItem.mimeType] = [];
      }
      response[cursorItem.mimeType].push(
        typeof serializer === 'function'
          ? serializer(cursor.value)
          : cursor.value,
      );
      return cursor.continue();
    }
  }
  clearGetRequest(storage, getWorkflow);
}

export function onGetRequestError<T>(this: GetWorkflowThis<T>) {
  const { storage, getWorkflow } = this;
  clearGetRequest(storage, getWorkflow);
}
