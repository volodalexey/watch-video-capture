import { type IndexedDBStorage } from '../IndexedDBStorage.class';
import {
  type DeleteWorkflow,
  type BufferStorageIDBItem,
  type DeleteWorkflowThis,
  type DeleteWorkflowResponse,
} from '../IndexedDBStorage.types';
import {
  listenDeleteOpenRequest,
  onDeleteOpenRequestError,
  onDeleteOpenRequestSuccess,
  onDeleteRequestError,
  onDeleteRequestSuccess,
} from './deleteBufferItem.request';
import {
  listenDeleteWorkflow,
  onDeleteWorkflowError,
  onDeleteWorkflowSuccess,
} from './deleteBufferItem.workflow';

export function deleteBufferItem(
  storage: IndexedDBStorage,
  mediaIdHash: BufferStorageIDBItem['mediaIdHash'],
): Promise<DeleteWorkflowResponse> {
  return new Promise<DeleteWorkflowResponse>((resolve, reject) => {
    const idbIndexTransaction = storage.db.transaction(
      storage.tableName,
      'readwrite',
    );

    const idbIndexObjectStore = idbIndexTransaction.objectStore(
      storage.tableName,
    );

    const idbIndexRequest = idbIndexObjectStore
      .index(storage.indexName)
      .openCursor(IDBKeyRange.only(mediaIdHash));

    const deleteWorkflow: DeleteWorkflow = {} as DeleteWorkflow;
    const thisBinded: DeleteWorkflowThis = {
      storage,
      deleteWorkflow,
    };

    Object.assign(deleteWorkflow, {
      resolve: resolve as DeleteWorkflow['resolve'],
      reject,
      mediaIdHash,
      transaction: idbIndexTransaction,
      objectStore: idbIndexObjectStore,
      requestOpen: idbIndexRequest,
      requestDelete: null,
      response: { deleted: [] },
      onDeleteWorkflowSuccessBinded: onDeleteWorkflowSuccess.bind(thisBinded),
      onDeleteWorkflowErrorBinded: onDeleteWorkflowError.bind(thisBinded),
      onDeleteOpenRequestSuccessBinded:
        onDeleteOpenRequestSuccess.bind(thisBinded),
      onDeleteOpenRequestErrorBinded: onDeleteOpenRequestError.bind(thisBinded),
      onDeleteRequestSuccessBinded: onDeleteRequestSuccess.bind(thisBinded),
      onDeleteRequestErrorBinded: onDeleteRequestError.bind(thisBinded),
    } satisfies DeleteWorkflow);

    storage.setDeleteWorkflow(deleteWorkflow);
    listenDeleteWorkflow(deleteWorkflow);
    listenDeleteOpenRequest(deleteWorkflow);
  });
}
