import { dbPromise } from "./indexedDB";

export async function saveDocumentLocally(document: {
  id: string;
  title: string;
  content: string;
}) {
  const db = await dbPromise;

  await db.put("documents", document);
}

export async function getDocumentLocally(id: string) {
  const db = await dbPromise;

  return db.get("documents", id);
}

export async function getAllLocalDocuments() {
  const db = await dbPromise;

  return db.getAll("documents");
}

export async function deleteLocalDocument(id: string) {
  const db = await dbPromise;

  await db.delete("documents", id);
}