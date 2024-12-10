import {
  logInjectIDBBufferItemCursor,
  logInjectIDBBufferItemObjectStore,
  logInjectIDBBufferItemRequest,
  logInjectIDBBufferItemSave,
  logInjectIDBBufferItemTransaction,
} from '@/common/logger';
import { type BufferStorageIDBItem } from './IndexedDBStorage.types';

export class IndexedDBStorage {
  dbName = 'watch-store';
  tableName = 'blobs';
  indexName = 'IndexByMediaIdHash';
  version = 1;

  db: IDBDatabase | null = null;
  openRequest: {
    resolve: (db: IDBDatabase) => unknown;
    reject: (e: Error) => unknown;
    request: IDBOpenDBRequest;
  } | null = null;
  saveWorkflow: {
    resolve: () => unknown;
    reject: (e: Error) => unknown;
    transaction: IDBTransaction;
    objectStore: IDBObjectStore;
    request: IDBRequest<IDBCursorWithValue | null>;
    saveItem: BufferStorageIDBItem;
  } | null = null;
  getWorkflow: {
    response: BufferStorageIDBItem[];
    resolve: (items: BufferStorageIDBItem[]) => unknown;
    reject: (e: Error) => unknown;
    transaction: IDBTransaction;
    objectStore: IDBObjectStore;
    request: IDBRequest<IDBCursor>;
  } | null = null;

  tryInit(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      this.openRequest = {
        resolve,
        reject,
        request: indexedDB.open(this.dbName, this.version),
      };
      this.listenOpenRequest();
    });
  }

  listenOpenRequest() {
    if (this.openRequest) {
      const { request } = this.openRequest;
      request.addEventListener('success', this.onOpenSuccess);
      request.addEventListener('error', this.onOpenError);
      request.addEventListener('blocked', this.onOpenBlocked);
      request.addEventListener('upgradeneeded', this.onOpenUpgrade);
    }
  }

  clearOpenRequest() {
    if (this.openRequest) {
      const { request } = this.openRequest;
      request.removeEventListener('success', this.onOpenSuccess);
      request.removeEventListener('error', this.onOpenError);
      request.removeEventListener('blocked', this.onOpenBlocked);
      request.removeEventListener('upgradeneeded', this.onOpenUpgrade);
      this.openRequest = null;
    }
  }

  onOpenSuccess = (e: Event) => {
    if (this.openRequest) {
      const { resolve, reject } = this.openRequest;
      if (e && e.target instanceof IDBOpenDBRequest) {
        this.db = e.target.result;
        resolve(this.db);
      } else {
        reject(new Error('Invalid target supplied'));
      }
    }
    this.clearOpenRequest();
  };

  onOpenError = (e: Event) => {
    if (this.openRequest) {
      const { reject } = this.openRequest;
      if (e && e.target instanceof IDBOpenDBRequest) {
        reject(e.target.error);
      }
    }
    this.clearOpenRequest();
  };

  onOpenBlocked = (e: Event) => {
    if (this.openRequest) {
      const { reject } = this.openRequest;
      if (e && e.target instanceof IDBOpenDBRequest) {
        reject(e.target.error);
      }
    }
    this.clearOpenRequest();
  };

  onOpenUpgrade = (e: Event) => {
    if (this.openRequest) {
      const { reject } = this.openRequest;
      if (e && e.target instanceof IDBOpenDBRequest) {
        this.db = e.target.result;
        const objectStore = this.db.createObjectStore(this.tableName, {
          keyPath: 'id' satisfies keyof BufferStorageIDBItem,
        });
        objectStore.createIndex(
          this.indexName,
          'mediaIdHash' satisfies keyof BufferStorageIDBItem,
          { unique: false },
        );
      } else {
        reject(new Error('Invalid target supplied'));
      }
    }
    this.clearOpenRequest();
  };

  saveBufferItem(item: BufferStorageIDBItem): Promise<void> {
    logInjectIDBBufferItemSave(`saveBufferItem(%s)`, item.id);
    return new Promise((resolve, reject) => {
      if (this.db) {
        const idbIndexTransaction = this.db.transaction(
          this.tableName,
          'readwrite',
        );

        const idbIndexObjectStore = idbIndexTransaction.objectStore(
          this.tableName,
        );

        const idbIndexRequest = idbIndexObjectStore
          .index(this.indexName)
          .openCursor(IDBKeyRange.only(item.mediaIdHash));

        this.saveWorkflow = {
          resolve,
          reject,
          transaction: idbIndexTransaction,
          objectStore: idbIndexObjectStore,
          request: idbIndexRequest,
          saveItem: item,
        };
        this.listenSaveWorkflow();
        this.listenSaveRequest();
      } else {
        reject(new Error('No database'));
      }
    });
  }

  listenSaveWorkflow() {
    logInjectIDBBufferItemTransaction(
      'listenSaveWorkflow() %s',
      this.saveWorkflow,
    );
    if (this.saveWorkflow) {
      const { transaction } = this.saveWorkflow;
      transaction.addEventListener('success', this.onSaveWorkflowSuccess);
      transaction.addEventListener('error', this.onSaveWorkflowError);
    }
  }

  clearSaveWorkflow() {
    logInjectIDBBufferItemTransaction(
      'clearSaveWorkflow() %s',
      this.saveWorkflow,
    );
    if (this.saveWorkflow) {
      const { transaction } = this.saveWorkflow;
      transaction.removeEventListener('success', this.onSaveWorkflowSuccess);
      transaction.removeEventListener('error', this.onSaveWorkflowError);
      this.saveWorkflow = null;
    }
  }

  onSaveWorkflowSuccess = (e: Event) => {
    logInjectIDBBufferItemTransaction(
      'onSaveWorkflowSuccess() %s',
      this.saveWorkflow,
    );
    if (this.saveWorkflow) {
      const { resolve } = this.saveWorkflow;
      resolve();
    }
    this.clearSaveWorkflow();
  };

  onSaveWorkflowError = (e: Event) => {
    logInjectIDBBufferItemTransaction(
      'onSaveWorkflowError() %s',
      this.saveWorkflow,
    );
    if (this.saveWorkflow) {
      const { reject } = this.saveWorkflow;
      if (e && e.target instanceof IDBRequest) {
        reject(e.target.error);
      }
    }
    this.clearSaveWorkflow();
  };

  listenSaveRequest() {
    logInjectIDBBufferItemRequest('listenSaveRequest() %s', this.saveWorkflow);
    if (this.saveWorkflow) {
      const { request } = this.saveWorkflow;
      request.addEventListener('success', this.onSaveRequestSuccess);
      request.addEventListener('error', this.onSaveRequestError);
    }
  }

  clearSaveRequest() {
    logInjectIDBBufferItemRequest('clearSaveRequest() %s', this.saveWorkflow);
    if (this.saveWorkflow) {
      const { request } = this.saveWorkflow;
      request.removeEventListener('success', this.onSaveRequestSuccess);
      request.removeEventListener('error', this.onSaveRequestError);
    }
  }

  onSaveRequestSuccess = (e: Event) => {
    logInjectIDBBufferItemRequest(
      'onSaveRequestSuccess() %s',
      this.saveWorkflow,
    );
    if (this.saveWorkflow) {
      if (e && e.target instanceof IDBRequest) {
        const { saveItem, objectStore } = this.saveWorkflow;
        const cursor = e.target.result;
        if (cursor instanceof IDBCursorWithValue) {
          const cursorItem: BufferStorageIDBItem = cursor.value;
          if (
            cursorItem.incrementalByteOffset < saveItem.incrementalByteOffset &&
            cursorItem.incrementalByteEnd > saveItem.incrementalByteOffset &&
            saveItem.incrementalByteEnd > cursorItem.incrementalByteEnd
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
              saveItem.incrementalByteOffset - cursorItem.incrementalByteOffset,
            );
            logInjectIDBBufferItemCursor(
              'newCursorBuffer left cursor.update()',
            );
            cursor.update({
              ...cursorItem,
              buffer: newCursorBuffer,
            } as BufferStorageIDBItem);
            return cursor.continue();
          } else if (
            cursorItem.incrementalByteOffset >=
              saveItem.incrementalByteOffset &&
            cursorItem.incrementalByteEnd <= saveItem.incrementalByteEnd
          ) {
            /*
              |------------|
              | cursorItem |
              |------------|
             |--------------|
             |   saveItem   |
             |--------------|
            */
            // TODO check if buffer array is the same
            logInjectIDBBufferItemCursor('cursor.delete()');
            cursor.delete();
            return cursor.continue();
          } else if (
            cursorItem.incrementalByteOffset > saveItem.incrementalByteOffset &&
            cursorItem.incrementalByteOffset < saveItem.incrementalByteEnd &&
            cursorItem.incrementalByteEnd > saveItem.incrementalByteEnd
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
              saveItem.incrementalByteEnd - cursorItem.incrementalByteOffset,
            );
            logInjectIDBBufferItemCursor(
              'newCursorBuffer right cursor.update()',
            );
            cursor.update({
              ...cursorItem,
              buffer: newCursorBuffer,
            } as BufferStorageIDBItem);
            return cursor.continue();
          }
          logInjectIDBBufferItemCursor('cursor.continue()');
          return cursor.continue();
        } else {
          logInjectIDBBufferItemObjectStore('objectStore.put(%s)', saveItem.id);
          objectStore.put(saveItem);
        }
      }
    }
    this.clearSaveWorkflow();
  };

  onSaveRequestError = () => {
    logInjectIDBBufferItemRequest('onSaveRequestError()');
    this.clearSaveRequest();
  };

  getAllByMediaIndex(
    mediaIdHash: BufferStorageIDBItem['mediaIdHash'],
  ): Promise<BufferStorageIDBItem[]> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        const idbIndexTransaction = this.db.transaction(
          this.tableName,
          'readonly',
        );
        const idbIndexObjectStore = idbIndexTransaction.objectStore(
          this.tableName,
        );
        const idbIndexRequest = idbIndexObjectStore
          .index(this.indexName)
          .openCursor(IDBKeyRange.only(mediaIdHash));

        this.getWorkflow = {
          response: [],
          resolve,
          reject,
          transaction: idbIndexTransaction,
          objectStore: idbIndexObjectStore,
          request: idbIndexRequest,
        };
        this.listenGetIndexRequest();
      } else {
        reject(new Error('No database'));
      }
    });
  }

  listenGetIndexRequest() {
    if (this.getWorkflow) {
      const { request } = this.getWorkflow;
      request.addEventListener('success', this.onGetIndexSuccess);
      request.addEventListener('error', this.onGetIndexError);
    }
  }

  clearGetIndexRequest() {
    if (this.getWorkflow) {
      const { request } = this.getWorkflow;
      request.removeEventListener('success', this.onGetIndexSuccess);
      request.removeEventListener('error', this.onGetIndexError);
      this.getWorkflow = null;
    }
  }

  onGetIndexSuccess = (e: Event) => {
    if (this.getWorkflow) {
      const { response, resolve } = this.getWorkflow;
      if (e && e.target instanceof IDBRequest) {
        const cursor = e.target.result;
        if (cursor instanceof IDBCursorWithValue) {
          response.push(cursor.value);
          return cursor.continue();
        }
        this.clearGetIndexRequest();
        return resolve(response);
      }
    }
    this.clearGetIndexRequest();
  };

  onGetIndexError = (e: Event) => {
    if (this.getWorkflow) {
      const { reject } = this.getWorkflow;
      if (e && e.target instanceof IDBRequest) {
        reject(e.target.error);
      }
    }
    this.clearGetIndexRequest();
  };
}
