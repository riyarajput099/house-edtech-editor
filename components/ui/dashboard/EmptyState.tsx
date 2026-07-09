import { FileText } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed py-20">
      <FileText className="mb-4 h-16 w-16 text-gray-400" />

      <h2 className="text-2xl font-semibold">
        No Documents Yet
      </h2>

      <p className="mt-2 text-gray-500">
        Create your first document to get started.
      </p>
    </div>
  );
}