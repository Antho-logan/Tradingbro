"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Github, Twitter, Mail, Eye, EyeOff, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [reveal, setReveal] = useState(false);
  const [busy, setBusy] = useState(false);

  const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const validPw = (v: string) => v.length >= 6;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validEmail(email)) return toast.error("Enter a valid email.");
    if (!validPw(pw)) return toast.error("Password must be at least 6 characters.");

    // Demo-only — replace with Clerk later
    try {
      setBusy(true);
      await new Promise((r) => setTimeout(r, 650));
      toast.success("Signed in");
      router.push("/dashboard");
    } finally {
      setBusy(false);
    }
  }

  function providerLogin(name: "GitHub" | "X" | "Google") {
    toast.info(`Redirecting to ${name}… (demo)`);
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto grid min-h-[calc(100dvh-80px)] w-full place-items-center px-6 py-10">
      <Card className="w-full max-w-md border border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="text-2xl tracking-tight">Sign in</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-invalid={email.length > 0 && !validEmail(email)}
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  className="text-xs text-muted-foreground hover:underline"
                  onClick={() => toast.message("Password reset coming soon")}
                >
                  Forgot?
                </button>
              </div>

              <div className="relative">
                <Input
                  id="password"
                  type={reveal ? "text" : "password"}
                  autoComplete="current-password"
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  required
                  aria-invalid={pw.length > 0 && !validPw(pw)}
                  className="pr-10"
                />
                <button
                  type="button"
                  aria-label={reveal ? "Hide password" : "Show password"}
                  onClick={() => setReveal((s) => !s)}
                  className={cn(
                    "absolute inset-y-0 right-0 grid w-10 place-items-center",
                    "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {reveal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full font-mono" size="lg" disabled={busy}>
              {busy ? "Signing in…" : "Sign in"}
              <ChevronRight className="ml-1.5 h-4 w-4" />
            </Button>
          </form>

          <div className="px-2">
            <Separator />
          </div>

          <div className="grid gap-2">
            <Button variant="outline" className="w-full font-mono" onClick={() => providerLogin("GitHub")}>
              <Github className="mr-2 h-4 w-4" />
              Continue with GitHub
            </Button>
            <Button variant="outline" className="w-full font-mono" onClick={() => providerLogin("X")}>
              <Twitter className="mr-2 h-4 w-4" />
              Continue with X (Twitter)
            </Button>
            <Button variant="outline" className="w-full font-mono" onClick={() => providerLogin("Google")}>
              <Mail className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
          </div>

          <p className="text-center text-[11px] text-muted-foreground">
            Prototype sign-in. We&apos;ll wire Clerk next. No financial advice.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}