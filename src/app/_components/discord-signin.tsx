import React from "react";
import { signIn } from "@/server/auth";

const DiscordSignIn = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("discord");
      }}
      className="space-y-6"
    >
      <button className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
        Sign in with Discord
      </button>
    </form>
  );
};

export { DiscordSignIn };
