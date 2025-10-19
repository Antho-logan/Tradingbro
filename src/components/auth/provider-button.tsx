"use client";

import { useRouter } from "next/navigation";
// Keep this import for when mock mode is OFF (real auth path).
// If you do NOT have next-auth installed anymore, delete this import
// and the else-branch that calls signIn.
import { signIn } from "next-auth/react";

const isMock =
  (typeof process !== "undefined" &&
    process.env.NEXT_PUBLIC_AUTH_MODE === "mock") ||
  false;

export default function ProviderButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();

  const handleClick = () => {
    if (isMock) {
      // No real auth — go straight to the app
      router.push("/dashboard");
      return;
    }
    // Real auth path (kept for later if you need NextAuth right now)
    signIn?.(id, { callbackUrl: "/dashboard" });
  };

  return (
    <button
      onClick={handleClick}
      className="no-ring w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left font-mono text-[15px] shadow-sm hover:shadow-md transition"
      type="button"
    >
      {name}
    </button>
  );
}