import { PrismaAdapter } from "@auth/prisma-adapter";
import { type DefaultSession, type NextAuthConfig } from "next-auth";
import { encode as defaultEncode } from "next-auth/jwt";
import { db } from "@/server/db";
import GitHub from "next-auth/providers/github";
import Discord from "next-auth/providers/discord";
import Credentials from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/utils";

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      // ...other properties
      // role: UserRole;
    } & DefaultSession["user"];
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole;
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
const adapter = PrismaAdapter(db);

export const authConfig = {
  providers: [
    Discord,
    GitHub,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) {
          throw new Error("Invalid credentials");
        }
        const { email, password } = credentials;
        const dbUser = await db.user.findFirst({
          where: { email: email as string },
        });
        if (!dbUser) {
          throw new Error("User not found");
        }
        const isPasswordValid = await verifyPassword(
          password as string,
          dbUser.password as string,
        );
        if (!isPasswordValid) {
          throw new Error("Invalid password");
        }
        return dbUser;
      },
    }),
  ],
  secret: process.env.AUTH_SECRET,

  adapter,
  callbacks: {
    session: ({ session }) => ({
      ...session,
    }),
    async jwt({ token, account }) {
      if (account?.provider === "credentials") {
        token.credentials = true;
      }
      return token;
    },
  },
  jwt: {
    encode: async function (params) {
      if (params.token?.credentials) {
        const sessionToken = crypto.randomUUID();
        if (!params.token.sub) {
          throw new Error("Missing subject");
        }
        const user = await db.user.findUnique({
          where: { id: params.token.sub },
        });
        if (!user) {
          throw new Error("User not found");
        }
        if (!adapter?.createSession) {
          throw new Error("Adapter does not implement createSession");
        }
        const createSession = await adapter.createSession({
          sessionToken,
          userId: user.id,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        if (!createSession) {
          throw new Error("Failed to create session");
        }
        return sessionToken;
      }
      return defaultEncode(params);
    },
  },
} satisfies NextAuthConfig;
