"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  actions?: { id: string; label: string; value: string }[];
};

export default function ChatPanel({
  messages,
  disabledInput,
  onSend,
  onAction,
}: {
  messages: ChatMessage[];
  disabledInput?: boolean;
  onSend: (text: string) => void;
  onAction: (value: string) => void;
}) {
  const [text, setText] = useState("");
  const viewportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="flex w-full flex-col">
      {/* Messages */}
      <div
        ref={viewportRef}
        className="flex-1 space-y-3 overflow-y-auto p-4"
        aria-live="polite"
        aria-label="Chat messages"
      >
        {messages.map((m) => (
          <MessageBubble key={m.id} {...m} onAction={onAction} />
        ))}
      </div>

      {/* Composer */}
      <div className="border-t p-3">
        <form
          className="flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onSend(text);
            setText("");
          }}
        >
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              disabledInput ? "Upload a chart first…" : "Type a message and press Enter…"
            }
            disabled={disabledInput}
            className={cn("font-mono")}
            aria-label="Message"
          />
          <Button type="submit" disabled={disabledInput || !text.trim()}>
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

function MessageBubble({
  role,
  content,
  actions,
  onAction,
}: ChatMessage & { onAction: (value: string) => void }) {
  const isAssistant = role === "assistant";
  return (
    <div
      className={cn(
        "max-w-[85%] rounded-lg border px-3 py-2 text-sm",
        isAssistant ? "bg-muted/40" : "ml-auto bg-background"
      )}
      role="article"
    >
      <div className="prose prose-invert:prose-neutral prose-sm max-w-none font-mono">
        {/* Allow simple markdown like **bold** */}
        <RichText text={content} />
      </div>

      {actions && actions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {actions.map((a) => (
            <Button
              key={a.id}
              size="sm"
              variant={isAssistant ? "default" : "outline"}
              onClick={() => onAction(a.value)}
              className="font-mono"
            >
              {a.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

function RichText({ text }: { text: string }) {
  // tiny markdown: bold only
  const parts = text.split(/(\*\*.+?\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}