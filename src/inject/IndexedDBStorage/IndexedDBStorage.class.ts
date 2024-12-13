import {
  SaveWorkflow,
  SaveWorkflowQueueItem,
  type BufferStorageIDBItem,
} from './IndexedDBStorage.types';

export class IndexedDBStorage {
  dbName = 'watch-store';
  tableName = 'blobs';
  indexName = 'IndexByMediaIdHash';
  version = 1;

  db: IDBDatabase = null;
  openRequest: {
    resolve: (db: IDBDatabase) => unknown;
    reject: (e: Error) => unknown;
    request: IDBOpenDBRequest;
  } | null = null;
  saveWorkflow: SaveWorkflow | null = null;
  saveWorkflowQueue: Array<SaveWorkflowQueueItem> = [];
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

  setSaveWorkflow(saveWorkflow: SaveWorkflow | null) {
    this.saveWorkflow = saveWorkflow;
  }

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
