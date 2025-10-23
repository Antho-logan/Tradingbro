"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TerminalWindow from "@/components/terminal/Window";
import UploadDropzone from "@/components/chat/UploadDropzone";
import ChatPanel, { ChatMessage } from "@/components/chat/ChatPanel";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import PreviousTrades from "@/components/trade/previous-trades";

export default function ChatPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "sys-welcome",
      role: "assistant",
      content:
        "Drop a chart screenshot to get started. I'll read it and ask a couple of quick questions.",
    },
  ]);

  function handleImageSelected(url: string) {
    const val = url || null;
    setImageUrl(val);
    if (!val) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setMessages((m) => [
        ...m,
        {
          id: `analyzed-${Date.now()}`,
          role: "assistant",
          content:
            "Got it. Do you want to **scalp** or **swing** this setup? Pick one so I tailor the plan.",
          actions: [
            { id: "pick-scalp", label: "Scalp", value: "scalp" },
            { id: "pick-swing", label: "Swing", value: "swing" },
          ],
        },
      ]);
    }, 1800);
  }

  function handleAction(value: string) {
    if (value === "scalp") {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "user", content: "Scalp." },
        {
          id: "q-scalp-1",
          role: "assistant",
          content:
            "Cool — scalp mode. What timeframe are you executing on, and what's your risk per trade (% of account)?",
        },
      ]);
    } else {
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "user", content: "Swing." },
        {
          id: "q-swing-1",
          role: "assistant",
          content:
            "Swing mode noted. What's your intended holding period (days/weeks) and key HTF bias?",
        },
      ]);
    }
  }

  function handleSend(text: string) {
    if (!text.trim()) return;
    setMessages((m) => [...m, { id: crypto.randomUUID(), role: "user", content: text }]);
    setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            "Thanks — I'll use that to draft a plan: entry, invalidation, targets, and notes for your journal.",
        },
      ]);
    }, 600);
  }

  return (
    <main className="mx-auto max-w-7xl px-6 lg:px-8 py-8">
      {/* HEADER: Back + Title */}
      <div className="mb-6 flex items-center gap-3">
        {/* Back button: using unified button style */}
        <Button
          variant="secondary"
          size="sm"
          asChild
        >
          <Link href="/dashboard">Back</Link>
        </Button>

        <h1 className="text-xl font-bold">AI Trade Chat</h1>
      </div>

      {/* GRID: chat left (wider), uploader right (narrower) */}
      <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
        {/* LEFT: Chat panel */}
        <section className="flex flex-col">
          <Card className="flex min-h-[620px] flex-1 rounded-2xl p-5 md:p-6 bg-white shadow-[0_10px_35px_-18px_rgba(0,0,0,0.15)]">
            <ChatPanel
              messages={messages}
              onSend={handleSend}
              onAction={handleAction}
              disabledInput={!imageUrl || isAnalyzing}
            />
          </Card>
        </section>

        {/* RIGHT: Terminal-shaped container WITHOUT header/traffic lights */}
        <section className="space-y-3">
          <div className="text-xs text-muted-foreground font-mono">
            trade-terminal — analysis
          </div>
          <TerminalWindow hideHeader>
            <UploadDropzone
              imageUrl={imageUrl}
              analyzing={isAnalyzing}
              onSelectImage={handleImageSelected}
            />
          </TerminalWindow>
          
          {/* Previous Trades Section */}
          <div className="mt-6">
            <TerminalWindow hideHeader>
              <div className="space-y-3">
                <h3 className="font-mono text-sm text-neutral-700">Previous trades</h3>
                <PreviousTrades />
              </div>
            </TerminalWindow>
          </div>
        </section>
      </div>
    </main>
  );
}