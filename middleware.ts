import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth(function middleware(req) {
  const isAdmin = req.auth?.user?.role === "admin";
  
  // Protect all /admin routes - only admins can access
  if (req.nextUrl.pathname.startsWith("/admin")) {
    if (!isAdmin || !req.auth) {
      return NextResponse.redirect(new URL("/api/auth/signin", req.url));
    }
  }
  
  // Add security headers to all responses
  const response = NextResponse.next();
  
  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  
  // Enable XSS protection in browsers
  response.headers.set("X-XSS-Protection", "1; mode=block");
  
  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");
  
  // Referrer policy
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  
  // Permissions policy
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  
  // Cache control for sensitive pages
  if (req.nextUrl.pathname.startsWith("/admin")) {
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }
  
  return response;
});

export const config = {
  matcher: ["/admin/:path*", "/((?!_next/static|_next/image|favicon.ico).*)"]
};