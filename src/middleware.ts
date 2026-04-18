import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
    const sessionToken = request.cookies.get("better-auth.session_token") ||
        request.cookies.get("__secure-better-auth.session_token");

    const isAuthPage = request.nextUrl.pathname.startsWith("/auth");

    if (!sessionToken && !isAuthPage) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    if (sessionToken && isAuthPage) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
