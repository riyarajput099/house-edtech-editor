import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;

  // No token
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify JWT
    await verifyToken(token);

    return NextResponse.next();
  } catch {
    // Invalid or expired token
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/dashboard/:path*"],
};