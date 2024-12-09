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
  saveRequest: {
    resolve: () => unknown;
    reject: (e: Error) => unknown;
    request: IDBRequest<IDBValidKey>;
  } | null = null;
  indexRequest: {
    response: BufferStorageIDBItem[];
    resolve: (items: BufferStorageIDBItem[]) => unknown;
    reject: (e: Error) => unknown;
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
    return new Promise((resolve, reject) => {
      if (this.db) {
        const store = this.db
          .transaction(this.tableName, 'readwrite')
          .objectStore(this.tableName);
        this.saveRequest = {
          resolve,
          reject,
          request: store.put(item),
        };
        this.listenSaveRequest();
      } else {
        reject(new Error('No database'));
      }
    });
  }

  listenSaveRequest() {
    if (this.saveRequest) {
      const { request } = this.saveRequest;
      request.addEventListener('success', this.onSaveSuccess);
      request.addEventListener('error', this.onSaveError);
    }
  }

  clearSaveRequest() {
    if (this.saveRequest) {
      const { request } = this.saveRequest;
      request.removeEventListener('success', this.onSaveSuccess);
      request.removeEventListener('error', this.onSaveError);
      this.saveRequest = null;
    }
  }

  onSaveSuccess = (e: Event) => {
    if (this.saveRequest) {
      if (e && e.target instanceof IDBRequest) {
        const { resolve } = this.saveRequest;
        resolve();
      }
    }
    this.clearSaveRequest();
  };

  onSaveError = (e: Event) => {
    if (this.saveRequest) {
      const { reject } = this.saveRequest;
      if (e && e.target instanceof IDBRequest) {
        reject(e.target.error);
      }
    }
    this.clearSaveRequest();
  };

  getAllByMediaIndex(
    mediaIdHash: BufferStorageIDBItem['mediaIdHash'],
  ): Promise<BufferStorageIDBItem[]> {
    return new Promise((resolve, reject) => {
      if (this.db) {
        const idbIndexRequest = this.db
          .transaction(this.tableName, 'readonly')
          .objectStore(this.tableName)
          .index(this.indexName)
          .openCursor(IDBKeyRange.only(mediaIdHash));

        this.indexRequest = {
          response: [],
          resolve,
          reject,
          request: idbIndexRequest,
        };
        this.listenIndexRequest();
      } else {
        reject(new Error('No database'));
      }
    });
  }

  listenIndexRequest() {
    if (this.indexRequest) {
      const { request } = this.indexRequest;
      request.addEventListener('success', this.onIndexSuccess);
      request.addEventListener('error', this.onIndexError);
    }
  }

  clearIndexRequest() {
    if (this.indexRequest) {
      const { request } = this.indexRequest;
      request.removeEventListener('success', this.onIndexSuccess);
      request.removeEventListener('error', this.onIndexError);
      this.indexRequest = null;
    }
  }

  onIndexSuccess = (e: Event) => {
    if (this.indexRequest) {
      const { response, resolve } = this.indexRequest;
      if (e && e.target instanceof IDBRequest) {
        const cursor = e.target.result;
        if (cursor instanceof IDBCursorWithValue) {
          response.push(cursor.value);
          return cursor.continue();
        }
        return resolve(response);
      }
    }
    this.clearIndexRequest();
  };

  onIndexError = (e: Event) => {
    if (this.indexRequest) {
      const { reject } = this.indexRequest;
      if (e && e.target instanceof IDBRequest) {
        reject(e.target.error);
      }
    }
    this.clearIndexRequest();
  };
}
