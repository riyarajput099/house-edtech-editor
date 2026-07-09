import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createDocumentSchema } from "@/lib/documentValidations";
import { verifyToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Get token from cookie
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

    // Verify JWT
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

    // Read request body
    const body = await request.json();

    // Validate input
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

    // Create document
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
    // Get token from cookie
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

    // Verify JWT
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

    // Fetch logged-in user's documents
    const documents = await prisma.document.findMany({
      where: {
        ownerId: payload.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      success: true,
      documents,
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