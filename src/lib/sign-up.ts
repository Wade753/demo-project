import { api } from "@/trpc/server";
import { redirect } from "next/navigation";

export const signUp = async (formData: FormData) => {
  const data = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };
  const createUser = await api.user.createUser(data);
  if (createUser) {
    redirect("/sign-in");
  }
};
