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
  ownerId: string;

  owner: {
    name: string;
    email: string;
  };

  collaborators: {
    role: string;
  }[];
}

export default function DashboardPage() {
  const [ownedDocuments, setOwnedDocuments] = useState<Document[]>([]);
  const [sharedDocuments, setSharedDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");

      const data = await response.json();

      if (data.success) {
        setOwnedDocuments(data.ownedDocuments);
        setSharedDocuments(data.sharedDocuments);
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
            Documents
          </h2>

          <CreateDocumentDialog
            onDocumentCreated={fetchDocuments}
          />
        </div>

        {loading ? (
          <p className="mt-10 text-center">Loading...</p>
        ) : (
          <>
            {ownedDocuments.length === 0 &&
            sharedDocuments.length === 0 ? (
              <EmptyState />
            ) : (
              <>
                {ownedDocuments.length > 0 && (
                  <>
                    <h3 className="mb-4 text-2xl font-semibold">
                      My Documents
                    </h3>

                    <div className="mb-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {ownedDocuments.map((document) => (
                        <DocumentCard
                          key={document.id}
                          document={document}
                        />
                      ))}
                    </div>
                  </>
                )}

                {sharedDocuments.length > 0 && (
                  <>
                    <h3 className="mb-4 text-2xl font-semibold">
                      Shared With Me
                    </h3>

                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {sharedDocuments.map((document) => (
                        <DocumentCard
                          key={document.id}
                          document={document}
                          shared
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
}