import { type IndexedDBStorage } from '../IndexedDBStorage.class';
import {
  type GetWorkflow,
  type GetWorkflowThis,
} from '../IndexedDBStorage.types';

export function listenGetWorkflow<T>(getWorkflow: GetWorkflow<T>) {
  const { transaction, onGetWorkflowSuccessBinded, onGetWorkflowErrorBinded } =
    getWorkflow;
  transaction.addEventListener('complete', onGetWorkflowSuccessBinded);
  transaction.addEventListener('error', onGetWorkflowErrorBinded);
}

function unlistenGetWorkflow<T>(getWorkflow: GetWorkflow<T>) {
  const { transaction, onGetWorkflowSuccessBinded, onGetWorkflowErrorBinded } =
    getWorkflow;
  transaction.removeEventListener('complete', onGetWorkflowSuccessBinded);
  transaction.removeEventListener('error', onGetWorkflowErrorBinded);
}

function clearGetWorkflow<T>(
  storage: IndexedDBStorage,
  getWorkflow: GetWorkflow<T>,
) {
  unlistenGetWorkflow(getWorkflow);
  storage.setGetWorkflow(null);
}

export function onGetWorkflowSuccess<T>(this: GetWorkflowThis<T>, e: Event) {
  const { storage, getWorkflow } = this;
  const { resolve, response } = getWorkflow;
  resolve(response);
  clearGetWorkflow(storage, getWorkflow);
}

export function onGetWorkflowError<T>(this: GetWorkflowThis<T>, e: Event) {
  const { storage, getWorkflow } = this;
  const { reject } = getWorkflow;
  if (e && e.target instanceof IDBRequest) {
    reject(e.target.error);
  }
  clearGetWorkflow(storage, getWorkflow);
}
