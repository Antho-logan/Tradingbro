export default function ThinkingBar({visible, label="TradingBro is thinking…"}: {visible:boolean; label?:string}) {
  if (!visible) return null;
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black text-white shadow-lg">
      <span className="mr-2">{label}</span>
      <span className="inline-flex -mb-[2px]">
        <span className="mx-[2px] animate-bounce [animation-delay:-0.2s]">.</span>
        <span className="mx-[2px] animate-bounce [animation-delay:-0.1s]">.</span>
        <span className="mx-[2px] animate-bounce">.</span>
      </span>
    </div>
  );
}