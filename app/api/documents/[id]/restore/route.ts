import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function POST(
  request: NextRequest,
  { params }: Props
) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { id } = await params;

    const documentToRestore = await prisma.document.findUnique({
      where: {
        id,
      },
    });

    if (!documentToRestore) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found",
        },
        { status: 404 }
      );
    }

    if (documentToRestore.ownerId !== payload.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Only owners can restore versions",
        },
        { status: 403 }
      );
    }

    const version = await prisma.documentVersion.findUnique({
      where: {
        id: body.versionId,
      },
    });

    if (!version) {
      return NextResponse.json(
        {
          success: false,
          message: "Version not found",
        },
        { status: 404 }
      );
    }

    const document = await prisma.document.update({
      where: {
        id,
      },
      data: {
        title: version.title,
        content: version.content,
      },
    });

    return NextResponse.json({
      success: true,
      document,
    });

  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 }
    );
  }
}