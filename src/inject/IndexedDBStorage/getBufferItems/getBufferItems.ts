import { TSerializedBufferStorageIDBItem } from '@/common/message';

import { type IndexedDBStorage } from '../IndexedDBStorage.class';
import {
  type GetWorkflow,
  type BufferStorageIDBItem,
  type GetWorkflowThis,
  type GetWorkflowResponse,
} from '../IndexedDBStorage.types';
import { serializeBufferStorageIDBItem } from '../IndexedDBStorage.utils';
import {
  listenGetRequest,
  onGetRequestError,
  onGetRequestSuccess,
} from './getBufferItems.request';
import {
  listenGetWorkflow,
  onGetWorkflowError,
  onGetWorkflowSuccess,
} from './getBufferItems.workflow';

function getBufferItems<T>(
  storage: IndexedDBStorage,
  mediaIdHash: BufferStorageIDBItem['mediaIdHash'],
  serializer?: GetWorkflow<T>['serializer'],
): Promise<GetWorkflowResponse<T>> {
  return new Promise<GetWorkflowResponse<T>>((resolve, reject) => {
    const idbIndexTransaction = storage.db.transaction(
      storage.tableName,
      'readonly',
    );

    const idbIndexObjectStore = idbIndexTransaction.objectStore(
      storage.tableName,
    );

    const idbIndexRequest = idbIndexObjectStore
      .index(storage.indexName)
      .openCursor(IDBKeyRange.only(mediaIdHash));

    const getWorkflow: GetWorkflow<T> = {} as GetWorkflow<T>;
    const thisBinded: GetWorkflowThis<T> = {
      storage,
      getWorkflow,
    };

    Object.assign(getWorkflow, {
      resolve: resolve as GetWorkflow<T>['resolve'],
      reject,
      serializer,
      mediaIdHash,
      transaction: idbIndexTransaction,
      objectStore: idbIndexObjectStore,
      request: idbIndexRequest,
      response: {},
      onGetWorkflowSuccessBinded: onGetWorkflowSuccess.bind(thisBinded),
      onGetWorkflowErrorBinded: onGetWorkflowError.bind(thisBinded),
      onGetRequestSuccessBinded: onGetRequestSuccess.bind(thisBinded),
      onGetRequestErrorBinded: onGetRequestError.bind(thisBinded),
    } satisfies GetWorkflow<T>);

    storage.setGetWorkflow(getWorkflow);
    listenGetWorkflow(getWorkflow);
    listenGetRequest(getWorkflow);
  });
}

export function getFullBufferItems(
  storage: IndexedDBStorage,
  mediaIdHash: BufferStorageIDBItem['mediaIdHash'],
) {
  return getBufferItems<BufferStorageIDBItem>(storage, mediaIdHash);
}

export function getSerializedBufferItems(
  storage: IndexedDBStorage,
  mediaIdHash: BufferStorageIDBItem['mediaIdHash'],
) {
  return getBufferItems<TSerializedBufferStorageIDBItem>(
    storage,
    mediaIdHash,
    serializeBufferStorageIDBItem,
  );
}
