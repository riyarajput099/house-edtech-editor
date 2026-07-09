import { openDB } from "idb";

export const dbPromise = openDB("HouseEditorDB", 1, {
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