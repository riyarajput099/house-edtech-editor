import { openDB, IDBPDatabase } from "idb";

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDB() {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is only available in browser");
  }

  if (!dbPromise) {
    dbPromise = openDB("HouseEditorDB", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("documents")) {
          db.createObjectStore("documents", {
            keyPath: "id",
          });
        }

        if (!db.objectStoreNames.contains("syncQueue")) {
          db.createObjectStore("syncQueue", {
            keyPath: "id",
          });
        }
      },
    });
  }

  return dbPromise;
}