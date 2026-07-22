import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ['/notes/:path*', '/notebooks/:path*', '/tags/:path*', '/trash/:path*', '/login', '/register'],
};
