import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDocumentSchema } from "@/lib/documentValidations";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
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

    const result = createDocumentSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten(),
        },
        { status: 400 }
      );
    }

    const document = await prisma.document.create({
      data: {
        title: result.data.title,
        content: "",
        ownerId: payload.id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Document created successfully",
      data: document,
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

export async function GET(request: NextRequest) {
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

    const documents = await prisma.document.findMany({
      where: {
        isDeleted: false,
        OR: [
          {
            ownerId: payload.id,
          },
          {
            collaborators: {
              some: {
                userId: payload.id,
              },
            },
          },
        ],
      },

      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },

        collaborators: true,
      },

      orderBy: {
        updatedAt: "desc",
      },
    });

    const ownedDocuments = documents.filter(
      (doc) => doc.ownerId === payload.id
    );

    const sharedDocuments = documents.filter(
      (doc) => doc.ownerId !== payload.id
    );

    return NextResponse.json({
      success: true,
      ownedDocuments,
      sharedDocuments,
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