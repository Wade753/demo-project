import React from "react";
import { signIn } from "@/server/auth";

const GitHubSignIn = () => {
  return (
    <form
      action={async () => {
        "use server";
        await signIn("github");
      }}
      className="space-y-6"
    >
      <button className="w-full rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
        Sign in with GitHub
      </button>
    </form>
  );
};

export { GitHubSignIn };
