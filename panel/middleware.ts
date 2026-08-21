import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: ['/((?!api/ingest|api/config|api/auth|login|_next|favicon.ico).*)'],
};
