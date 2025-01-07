import { type IndexedDBStorage } from '../IndexedDBStorage.class';
import {
  type DeleteWorkflowThis,
  type DeleteWorkflow,
  BufferStorageIDBItem,
} from '../IndexedDBStorage.types';
import { serializeBufferStorageIDBItem } from '../IndexedDBStorage.utils';

export function listenDeleteRequest(deleteWorkflow: DeleteWorkflow) {
  const { request, onDeleteRequestSuccessBinded, onDeleteRequestErrorBinded } =
    deleteWorkflow;
  request.addEventListener('success', onDeleteRequestSuccessBinded);
  request.addEventListener('error', onDeleteRequestErrorBinded);
}

function unlistenDeleteRequest(deleteWorkflow: DeleteWorkflow) {
  const { request, onDeleteRequestSuccessBinded, onDeleteRequestErrorBinded } =
    deleteWorkflow;
  request.removeEventListener('success', onDeleteRequestSuccessBinded);
  request.removeEventListener('error', onDeleteRequestErrorBinded);
}

export function clearDeleteRequest(
  storage: IndexedDBStorage,
  deleteWorkflow: DeleteWorkflow,
) {
  unlistenDeleteRequest(deleteWorkflow);
}

export function onDeleteRequestSuccess(this: DeleteWorkflowThis, e: Event) {
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
      clearDeleteRequest(storage, deleteWorkflow);
      const deleteRequest = cursor.delete();
      deleteWorkflow.request = deleteRequest;
      listenDeleteRequest(deleteWorkflow);
      return deleteRequest;
    }
  }
  clearDeleteRequest(storage, deleteWorkflow);
}

export function onDeleteRequestError(this: DeleteWorkflowThis) {
  const { storage, deleteWorkflow } = this;
  clearDeleteRequest(storage, deleteWorkflow);
}
