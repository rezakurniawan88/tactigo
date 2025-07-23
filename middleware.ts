import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequestWithAuth } from "next-auth/middleware";

export default async function middleware(request: NextRequestWithAuth) {
    const token = await getToken({ req: request });
    const isAuthenticated = !!token;

    const publicPaths = ['/auth/login', '/auth/register'];
    const isPublicPath = publicPaths.includes(request.nextUrl.pathname);

    if (!isAuthenticated && !isPublicPath) {
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (isAuthenticated && isPublicPath) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!auth|api|_next/static|_next/image|favicon.ico).*)',
    ],
};