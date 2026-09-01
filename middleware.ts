import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    // Protéger toutes les pages du dashboard
    "/dashboard/:path*",
    // Protéger toutes les routes API (sauf celles d'authentification)
    "/api/((?!auth|webhooks).*)"
  ],
};
