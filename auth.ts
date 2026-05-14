import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// Rate limiting for login attempts (in-memory - use Redis for production)
const loginAttempts: Map<string, { count: number; resetTime: number }> = new Map();
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

function checkLoginLimit(identifier: string): boolean {
  const attempt = loginAttempts.get(identifier);
  
  if (!attempt) return true;
  
  if (Date.now() < attempt.resetTime) {
    return false; // Still locked out
  }
  
  // Reset after lockout period
  loginAttempts.delete(identifier);
  return true;
}

function recordLoginAttempt(identifier: string): void {
  const attempt = loginAttempts.get(identifier);
  
  if (attempt && Date.now() < attempt.resetTime) {
    attempt.count += 1;
  } else {
    loginAttempts.set(identifier, {
      count: 1,
      resetTime: Date.now() + LOCKOUT_DURATION
    });
  }
}

function clearLoginAttempts(identifier: string): void {
  loginAttempts.delete(identifier);
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Trust the host - needed for production deployments
  trustHost: true,
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Uživatelské jméno", type: "text", placeholder: "username" },
        password: { label: "Heslo", type: "password" }
      },
      async authorize(credentials) {
        // Validate credentials format
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const username = String(credentials.username).trim();
        const password = String(credentials.password);

        // Check rate limiting
        if (!checkLoginLimit(username)) {
          console.warn(`Login lockout for user: ${username}`);
          throw new Error("Příliš mnoho neúspěšných pokusů. Zkuste to později.");
        }

        const user = await prisma.user.findUnique({
          where: { username },
          select: { id: true, username: true, name: true, role: true, password: true, createdAt: true, updatedAt: true }
        });

        if (!user || !user.password) {
          // Record attempt even for non-existent users (prevents user enumeration)
          recordLoginAttempt(username);
          return null;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
          recordLoginAttempt(username);
          return null;
        }

        // Clear attempts on successful login
        clearLoginAttempts(username);

        return {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 0
  },
  pages: {
    signIn: "/api/auth/signin"
  },
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.username = user.username;
        token.createdAt = Date.now();
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
      }
      return session;
    },
    // Prevent open redirect attacks
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      
      // Allows callback URLs on the same origin
      try {
        const urlObj = new URL(url);
        if (urlObj.origin === baseUrl) {
          return url;
        }
      } catch {
        // Invalid URL, fall back to default
      }
      
      return baseUrl;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Security settings
  debug: process.env.NODE_ENV === "development",
  events: {
    async signIn() {
      if (process.env.NODE_ENV === "production") {
        console.log("User signed in");
      }
    },
    async signOut() {
      if (process.env.NODE_ENV === "production") {
        console.log("User signed out");
      }
    }
  }
});