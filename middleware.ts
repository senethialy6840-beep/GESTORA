import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    try {
      const role = req.nextauth?.token?.role as string | undefined;
      const path = req.nextUrl?.pathname || "";

      // Permissions strictes pour les Vendeurs
      if (role === 'SELLER') {
        const restrictedPaths = ['/dashboard/settings', '/dashboard/accounting', '/dashboard/hr', '/dashboard/purchases'];
        
        if (restrictedPaths.some(p => path.startsWith(p))) {
          return NextResponse.redirect(new URL('/dashboard', req.url));
        }
      }
    } catch (e) {
      console.error("Middleware processing error:", e);
    }
    return NextResponse.next();
  },
  {
    pages: {
      signIn: "/login",
    },
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    // Si la variable n'est pas définie, on met une chaîne vide pour éviter le crash
    secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "fallback_secret_for_development",
  }
);

export const config = {
  matcher: [
    // Protéger toutes les pages du dashboard
    "/dashboard/:path*",
    // Protéger toutes les routes API (sauf celles d'authentification)
    "/api/((?!auth|webhooks).*)"
  ],
};
