import NextAuth from "next-auth";
import { authOptions } from "@/auth";
import { NextRequest } from "next/server";

const nextAuthHandler = NextAuth(authOptions);

async function handler(req: NextRequest, ctx: any) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");

  if (host && !host.includes("vercel.app")) {
    process.env.NEXTAUTH_URL = `${proto}://${host}`;
  } else if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL.includes("gest-three.vercel.app")) {
    process.env.NEXTAUTH_URL = "https://gestora.shop";
  }

  return nextAuthHandler(req, ctx);
}

export { handler as GET, handler as POST };
