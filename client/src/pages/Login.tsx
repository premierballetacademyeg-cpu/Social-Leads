import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        window.location.href = "/";
        return;
      }
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? "Sign-in failed. Please try again.");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#102a37] px-6 py-10 text-[#fbf7ef]">
      <div className="mx-auto flex min-h-[75vh] max-w-sm flex-col items-center justify-center text-center">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.28em] text-[#d4b07a]">
          Premier Ballet Academy
        </p>
        <h1 className="font-display text-5xl italic leading-none">Social Desk</h1>
        <p className="mt-6 text-sm leading-6 text-[#c8d0d2]">
          Staff sign-in
        </p>
        <form onSubmit={submit} className="mt-8 w-full space-y-4 text-left">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#c8d0d2]">Email</Label>
            <Input id="email" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} className="border-[#3a5563] bg-[#16384a] text-[#fbf7ef]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#c8d0d2]">Password</Label>
            <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={event => setPassword(event.target.value)} className="border-[#3a5563] bg-[#16384a] text-[#fbf7ef]" />
          </div>
          {error ? <p role="alert" className="text-sm text-[#f3b3b3]">{error}</p> : null}
          <Button type="submit" disabled={busy} className="w-full bg-[#d4b07a] text-[#102a37] hover:bg-[#e0c08c]">
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
