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

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token",
        },
        { status: 401 },
      );
    }

    const { id } = await params;

    let role: "OWNER" | "EDITOR" | "VIEWER" | null = null;

    let document = await prisma.document.findFirst({
      where: {
        id,
        ownerId: payload.id,
      },
    });

    if (document) {
      role = "OWNER";
    } else {
      const collaborator = await prisma.collaborator.findFirst({
        where: {
          documentId: id,
          userId: payload.id,
        },
        include: {
          document: true,
        },
      });

      if (collaborator) {
        document = collaborator.document;
        role = collaborator.role;
      }
    }

    if (!document || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found or access denied",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      document,
      role,
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

    // Check document ownership or editor access
    let hasAccess = false;
    let existingDocument = await prisma.document.findFirst({
      where: {
        id,
        ownerId: payload.id,
      },
    });

    if (existingDocument) {
      hasAccess = true;
    } else {
      const collaborator = await prisma.collaborator.findFirst({
        where: {
          documentId: id,
          userId: payload.id,
        },
        include: {
          document: true,
        },
      });

      if (collaborator && (collaborator.role === "EDITOR" || collaborator.role === "OWNER")) {
        hasAccess = true;
        existingDocument = collaborator.document;
      } else if (collaborator && collaborator.role === "VIEWER") {
        return NextResponse.json(
          {
            success: false,
            message: "Forbidden: You are a viewer",
          },
          { status: 403 },
        );
      }
    }

    if (!existingDocument || !hasAccess) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found or access denied",
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
