"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false
      });

      if (result?.error) {
        setError("Nesprávné uživatelské jméno nebo heslo");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch {
      setError("Došlo k chybě při přihlašování");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">Přihlášení</h1>
          <p className="mt-2 text-slate-600">Administrace - FIT SZZ</p>
        </div>
        
        <form onSubmit={handleSubmit} className="card space-y-6">
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}
          
          <div>
            <label htmlFor="username" className="label">Uživatelské jméno</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input"
              placeholder="admin"
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <label htmlFor="password" className="label">Heslo</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            className="btn w-full"
            disabled={loading}
          >
            {loading ? "Přihlašování..." : "Přihlásit se"}
          </button>
        </form>
        
        <p className="text-center text-sm text-slate-600">
          <Link href="/" className="hover:underline">← Zpět na hlavní stránku</Link>
        </p>
      </div>
    </div>
  );
}