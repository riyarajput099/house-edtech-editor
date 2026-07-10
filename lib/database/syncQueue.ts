import { getDB } from "./indexedDB";
export async function addToSyncQueue(change: {
  id: string;
  documentId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  payload: unknown;
}) {
const db = await getDB();

  await db.put("syncQueue", change);
}

export async function getSyncQueue() {
const db = await getDB();
  return db.getAll("syncQueue");
}

export async function removeFromSyncQueue(id: string) {
const db = await getDB();
  await db.delete("syncQueue", id);
}