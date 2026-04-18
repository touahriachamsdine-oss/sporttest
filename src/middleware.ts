import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
    // Authentication gates removed per Operative request.
    // All routes are now fully accessible.
    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
