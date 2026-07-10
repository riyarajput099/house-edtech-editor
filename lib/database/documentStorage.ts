import { getDB } from "./indexedDB";

export async function saveDocumentLocally(document: {
  id: string;
  title: string;
  content: string;
}) {
const db = await getDB();

  await db.put("documents", document);
}

export async function getDocumentLocally(id: string) {
const db = await getDB();
  return db.get("documents", id);
}

export async function getAllLocalDocuments() {
const db = await getDB();
  return db.getAll("documents");
}

export async function deleteLocalDocument(id: string) {
const db = await getDB();
  await db.delete("documents", id);
}