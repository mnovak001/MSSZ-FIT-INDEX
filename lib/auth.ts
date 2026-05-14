import { auth } from "@/auth";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  
  if (!user) {
    throw new Error("Unauthorized");
  }
  
  if (user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
  
  return user;
}