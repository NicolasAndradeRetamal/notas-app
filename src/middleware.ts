import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    '/notes/:path*',
    '/notebooks/:path*',
    '/tags/:path*',
    '/trash/:path*',
    '/login',
    '/register',
  ],
};
