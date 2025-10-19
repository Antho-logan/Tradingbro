"use client";

export default function MockEnterButton() {
  return (
    <button
      type="button"
      onClick={() => (window.location.href = "/dashboard")}
      className="no-ring w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-left font-mono text-[15px] shadow-sm hover:shadow-md transition"
    >
      Enter dashboard (no account)
    </button>
  );
}