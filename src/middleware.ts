import NextAuth from "next-auth";
import { authConfig } from "@/server/auth/config";

export const { auth: middleware } = NextAuth(authConfig);
