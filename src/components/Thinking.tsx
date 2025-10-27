export default function Thinking({label="Thinking"}:{label?:string}) {
  return (
    <div className="inline-flex items-center gap-2 text-neutral-500 text-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neutral-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-neutral-500"></span>
      </span>
      <span className="animate-pulse">{label}…</span>
    </div>
  );
}