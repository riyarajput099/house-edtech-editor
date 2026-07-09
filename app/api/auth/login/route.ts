import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { createToken } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate request
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          errors: result.error.flatten(),
        },
        {
          status: 400,
        },
      );
    }

    const { email, password } = result.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        {
          status: 401,
        },
      );
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email or password",
        },
        {
          status: 401,
        },
      );
    }

    // Generate JWT
    const token = await createToken({
      id: user.id,
      email: user.email,
    });

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Login Successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      {
        status: 200,
      },
    );

    // Store JWT in HttpOnly Cookie
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong",
      },
      {
        status: 500,
      },
    );
  }
}
