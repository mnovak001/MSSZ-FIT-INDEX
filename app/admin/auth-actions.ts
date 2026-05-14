"use server";

import { signOut, auth } from "@/auth";
import { redirect } from "next/navigation";

export async function handleSignOut() {
  await signOut({ redirect: false });
  redirect("/");
}

export async function checkAdminAuth() {
  try {
    const session = await auth();
    
    if (!session || !session.user || session.user.role !== "admin") {
      redirect("/api/auth/signin");
    }
    
    return session.user;
  } catch (error) {
    console.error('Error in checkAdminAuth:', error);
    redirect("/api/auth/signin");
  }
}
