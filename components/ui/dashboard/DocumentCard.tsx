"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  document: {
    id: string;
    title: string;
    content: string;
    createdAt: string;

    owner: {
      name: string;
      email: string;
    };
  };

  shared?: boolean;
}

export default function DocumentCard({
  document,
  shared = false,
}: Props) {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer transition hover:scale-[1.02] hover:shadow-lg"
      onClick={() => router.push(`/editor/${document.id}`)}
    >
      <CardContent className="space-y-3 p-5">
        <h3 className="text-xl font-semibold">
          {document.title}
        </h3>

        <p className="text-sm text-gray-500">
          {new Date(document.createdAt).toLocaleDateString()}
        </p>

        {shared && (
          <div>
            <span className="rounded bg-blue-100 px-2 py-1 text-xs text-blue-700">
              Shared by {document.owner.name}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}