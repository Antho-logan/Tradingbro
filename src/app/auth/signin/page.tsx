import Link from "next/link";
import ProviderButton from "@/components/auth/provider-button";
import MockEnterButton from "@/components/auth/mock-enter-button";

export const metadata = {
  title: "Sign in — TraderBro",
  description: "Mock sign in during development. Click a provider to continue.",
};

const isMock =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_AUTH_MODE === "mock") ||
  false;

// A small, fixed list for mock mode so the UI looks right.
const MOCK_PROVIDERS = [
  { id: "google", name: "Continue with Google" },
  { id: "github", name: "Continue with GitHub" },
  // add more if you like
];

async function getProvidersWhenReal() {
  try {
    // Use the current port from the development server or default to 3003
    const base = process.env.NEXTAUTH_URL || "http://localhost:3003";
    const res = await fetch(`${base}/api/auth/providers`, {
      cache: "no-store",
      // Add timeout to prevent hanging
      signal: AbortSignal.timeout(5000)
    });
    if (!res.ok) return null;
    return (await res.json()) as Record<string, { id: string; name: string }>;
  } catch (error) {
    console.error("Failed to fetch auth providers:", error);
    return null;
  }
}

export default async function SignInPage() {
  const providers = isMock ? null : await getProvidersWhenReal();

  const list = isMock
    ? MOCK_PROVIDERS
    : providers
    ? Object.values(providers)
    : [];

  return (
    <main className="max-w-xl mx-auto px-6 py-16">
      <h1 className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">
        Sign in
      </h1>
      <p className="text-neutral-600 font-mono mb-8">
        {isMock
          ? "Mock mode is ON. Click any option to enter the app."
          : "Choose a provider to continue."}
      </p>

      <div className="grid gap-3">
        {list.length === 0 && !isMock && (
          <div className="text-sm text-red-600">
            No auth providers found. Switch to mock mode or configure auth.
          </div>
        )}

        {list.map((p) => (
          <ProviderButton key={p.id} id={p.id} name={p.name} />
        ))}

        {isMock && <MockEnterButton />}
      </div>

      <div className="mt-8 text-sm text-neutral-500 font-mono">
        <Link href="/" className="underline underline-offset-4">
          ← Back to landing
        </Link>
      </div>
    </main>
  );
}