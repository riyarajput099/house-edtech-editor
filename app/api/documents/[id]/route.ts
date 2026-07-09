import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { updateDocumentSchema } from "@/lib/documentValidations";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    const payload = await verifyToken(token);

    const { id } = await params;

    const document = await prisma.document.findFirst({
      where: {
        id,
        ownerId: payload.id,
      },
    });

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found",
        },
        { status: 404 },
      );
    }

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
      { status: 500 },
    );
  }
}

// Keep your existing GET function above...

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Get JWT from cookie
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // Verify JWT
    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 401 },
      );
    }

    // Read request body
    const body = await request.json();

    // Validate input
    const result = updateDocumentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten(),
        },
        { status: 400 },
      );
    }

    // Check document ownership
    const existingDocument = await prisma.document.findFirst({
      where: {
        id,
        ownerId: payload.id,
      },
    });

    if (!existingDocument) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found",
        },
        { status: 404 },
      );
    }

    // Save current document as a version before updating
    await prisma.documentVersion.create({
      data: {
        documentId: existingDocument.id,
        title: existingDocument.title,
        content: existingDocument.content,
      },
    });

    // Update document
    const updatedDocument = await prisma.document.update({
      where: {
        id,
      },
      data: {
        title: result.data.title,
        content: result.data.content,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Document updated successfully",
      document: updatedDocument,
    });
  } catch (error) {
    console.log(error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}
