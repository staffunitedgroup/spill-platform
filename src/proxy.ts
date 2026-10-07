import { NextResponse, type NextRequest } from "next/server";

// Tells the root layout which page is being opened, so the SPILL 42 game pages can
// skip the private-access screen on launch day (see SPILL42_PUBLIC). The header is
// always overwritten here, so visitors can't fake it.
export function proxy(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set("x-spill-path", request.nextUrl.pathname);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Pages only — skip API routes, Next.js internals and files like images.
  matcher: ["/((?!api/|_next/static|_next/image|.*\\..*).*)"],
};
