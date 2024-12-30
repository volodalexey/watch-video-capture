import {
  type GetWorkflow,
  type SaveWorkflow,
  type SaveWorkflowQueueItem,
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
  getWorkflow: GetWorkflow | null = null;

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

  setGetWorkflow(getWorkflow: GetWorkflow | null) {
    this.getWorkflow = getWorkflow;
  }

  setSaveWorkflow(saveWorkflow: SaveWorkflow | null) {
    this.saveWorkflow = saveWorkflow;
  }
}
