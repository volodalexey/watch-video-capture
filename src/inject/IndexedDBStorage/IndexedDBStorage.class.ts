export class IndexedDBStorage {
  name = 'watch-store';
  version = 1;

  db: IDBDatabase | null = null;
  openRequest: {
    resolve: (db: IDBDatabase) => unknown;
    reject: (e: Error) => unknown;
    request: IDBOpenDBRequest;
  } | null = null;

  constructor() {
    // var store = db.transaction(['entries'], 'readwrite').objectStore('entries');
    // // Store the object
    // var req = store.put(blob, 'blob');
    // req.onerror = function(e) {
    //     console.log(e);
    // };
    // req.onsuccess = function(event) {
    //     console.log('Successfully stored a blob as Blob.');
    // };
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
      } else {
        reject(new Error('Invalid target supplied'));
      }
    }
    this.clearOpenRequest();
  };

  tryInit(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      this.openRequest = {
        resolve,
        reject,
        request: indexedDB.open(this.name, this.version),
      };
      this.listenOpenRequest();
    });
  }
}
