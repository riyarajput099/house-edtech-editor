"use client";

import { useEffect, useState } from "react";

import Navbar from "@/components/ui/dashboard/navbar";
import EmptyState from "@/components/ui/dashboard/EmptyState";
import CreateDocumentDialog from "@/components/ui/dashboard/CreateDocumentDialog";
import DocumentCard from "@/components/ui/dashboard/DocumentCard";

interface Document {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");

      const data = await response.json();

      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto max-w-6xl p-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">
            My Documents
          </h2>

         <CreateDocumentDialog
  onDocumentCreated={fetchDocuments}
/>
        </div>

        {loading ? (
          <p className="text-center mt-10">Loading...</p>
        ) : documents.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}