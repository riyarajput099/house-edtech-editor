import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { shareDocumentSchema } from "@/lib/collaboratorValidations";

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
          message: "Invalid Token",
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const result = shareDocumentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { id } = await params;

    // Check document ownership
    const document = await prisma.document.findFirst({
      where: {
        id,
      },
    });

    if (!document) {
      return NextResponse.json(
        {
          success: false,
          message: "Document not found",
        },
        { status: 404 }
      );
    }

    if (document.ownerId !== payload.id) {
      return NextResponse.json(
        {
          success: false,
          message: "Forbidden: Only owners can share this document",
        },
        { status: 403 }
      );
    }

    // Find invited user
    const user = await prisma.user.findUnique({
      where: {
        email: result.data.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    // Prevent sharing with yourself
    if (user.id === payload.id) {
      return NextResponse.json(
        {
          success: false,
          message: "You already own this document",
        },
        { status: 400 }
      );
    }

    // Check existing collaborator
    const existingCollaborator =
      await prisma.collaborator.findUnique({
        where: {
          userId_documentId: {
            userId: user.id,
            documentId: id,
          },
        },
      });

    if (existingCollaborator) {
      return NextResponse.json(
        {
          success: false,
          message: "User is already a collaborator",
        },
        { status: 409 }
      );
    }

    // Create collaborator
    const collaborator =
      await prisma.collaborator.create({
        data: {
          userId: user.id,
          documentId: id,
          role: result.data.role,
        },
      });

    return NextResponse.json({
      success: true,
      message: "Collaborator added successfully",
      collaborator,
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