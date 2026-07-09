import { dbPromise } from "./indexedDB";

export async function addToSyncQueue(change: {
  id: string;
  documentId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  payload: unknown;
}) {
  const db = await dbPromise;

  await db.put("syncQueue", change);
}

export async function getSyncQueue() {
  const db = await dbPromise;

  return db.getAll("syncQueue");
}

export async function removeFromSyncQueue(id: string) {
  const db = await dbPromise;

  await db.delete("syncQueue", id);
}