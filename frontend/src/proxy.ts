import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME } from "@/config/env";

// Optimistic check only: no cookie => go to login. Real authorization happens in the API.
export function proxy(request: NextRequest) {
  if (request.cookies.has(COOKIE_NAME)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = { matcher: ["/blogs/:path*", "/explore/:path*"] };
