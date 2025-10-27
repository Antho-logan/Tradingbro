export default function Reasoning({step, details}:{step:string, details?:string}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
      <div className="flex-shrink-0 mt-0.5">
        <div className="relative flex h-3 w-3">
          <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></div>
          <div className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></div>
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-neutral-900 animate-pulse">{step}</div>
        {details && (
          <div className="text-xs text-neutral-600 mt-1 animate-pulse">{details}</div>
        )}
      </div>
    </div>
  );
}