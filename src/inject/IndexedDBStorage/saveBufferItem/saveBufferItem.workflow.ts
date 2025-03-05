import {
  logInjectIDBBufferItemTransaction,
  logInjectIDBBufferItemTransactionGreen,
  logInjectIDBBufferItemTransactionRed,
} from '@/common/logger';

import { type IndexedDBStorage } from '../IndexedDBStorage.class';
import {
  type SaveWorkflowThis,
  type SaveWorkflow,
} from '../IndexedDBStorage.types';
import { checkNextSaveBufferItem } from './saveBufferItem';

export function listenSaveWorkflow(saveWorkflow: SaveWorkflow) {
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

export function onSaveWorkflowSuccess(this: SaveWorkflowThis) {
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

export function onSaveWorkflowError(this: SaveWorkflowThis, e: Event) {
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
