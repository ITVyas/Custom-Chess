import { NextResponse } from 'next/server'
import { getSession } from './app/utils/actions/auth'
import { exists } from './app/utils/util';

export async function middleware(request) {
    const session = await getSession();
    if(!exists(session.sessionId)) {
        return NextResponse.redirect(new URL('/signin', request.url));
    }
    return NextResponse.next();
}


export const config = {
    matcher: ['/', '/about', '/play', '/profile', '/create/:path']
}