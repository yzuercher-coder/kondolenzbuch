import type { NextAuthConfig } from "next-auth";

// Leichtgewichtige Konfiguration ohne Prisma/bcrypt — kompatibel mit Edge Runtime
export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute =
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/todesanzeigen") ||
        nextUrl.pathname.startsWith("/kondolenzen");

      if (isAdminRoute) return isLoggedIn;
      return true;
    },
  },
};
