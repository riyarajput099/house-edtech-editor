"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  document: {
    id: string;
    title: string;
    content: string;
    createdAt: string;
  };
}

export default function DocumentCard({ document }: Props) {
  const router = useRouter();

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition hover:scale-[1.02]"
      onClick={() => router.push(`/editor/${document.id}`)}
    >
      <CardContent className="p-5">
        <h3 className="text-xl font-semibold">
          {document.title}
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          {new Date(document.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}