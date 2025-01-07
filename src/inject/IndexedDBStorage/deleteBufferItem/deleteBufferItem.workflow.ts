import { type IndexedDBStorage } from '../IndexedDBStorage.class';
import {
  type DeleteWorkflow,
  type DeleteWorkflowThis,
} from '../IndexedDBStorage.types';

export function listenDeleteWorkflow(deleteWorkflow: DeleteWorkflow) {
  const {
    transaction,
    onDeleteWorkflowSuccessBinded,
    onDeleteWorkflowErrorBinded,
  } = deleteWorkflow;
  transaction.addEventListener('complete', onDeleteWorkflowSuccessBinded);
  transaction.addEventListener('error', onDeleteWorkflowErrorBinded);
}

function unlistenDeleteWorkflow(deleteWorkflow: DeleteWorkflow) {
  const {
    transaction,
    onDeleteWorkflowSuccessBinded,
    onDeleteWorkflowErrorBinded,
  } = deleteWorkflow;
  transaction.removeEventListener('complete', onDeleteWorkflowSuccessBinded);
  transaction.removeEventListener('error', onDeleteWorkflowErrorBinded);
}

function clearDeleteWorkflow(
  storage: IndexedDBStorage,
  deleteWorkflow: DeleteWorkflow,
) {
  unlistenDeleteWorkflow(deleteWorkflow);
  storage.setDeleteWorkflow(null);
}

export function onDeleteWorkflowSuccess(this: DeleteWorkflowThis, e: Event) {
  const { storage, deleteWorkflow } = this;
  const { resolve, response } = deleteWorkflow;
  resolve(response);
  clearDeleteWorkflow(storage, deleteWorkflow);
}

export function onDeleteWorkflowError(this: DeleteWorkflowThis, e: Event) {
  const { storage, deleteWorkflow } = this;
  const { reject } = deleteWorkflow;
  if (e && e.target instanceof IDBRequest) {
    reject(e.target.error);
  }
  clearDeleteWorkflow(storage, deleteWorkflow);
}
