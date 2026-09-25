import { useEffect, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

export default function RequestLoader() {
  const [, setRequestCount] = useState(0);
  const [visible, setVisible] = useState(false);
  const hasShownRef = useRef(sessionStorage.getItem("free-tier-loader-shown") === "true");

  useEffect(() => {
    let showTimer;

    const handleStart = () => {
      setRequestCount((count) => {
        const nextCount = count + 1;
        if (nextCount === 1 && !hasShownRef.current) {
          showTimer = window.setTimeout(() => {
            hasShownRef.current = true;
            sessionStorage.setItem("free-tier-loader-shown", "true");
            setVisible(true);
          }, 700);
        }
        return nextCount;
      });
    };

    const handleEnd = () => {
      setRequestCount((count) => {
        const nextCount = Math.max(0, count - 1);
        if (nextCount === 0) {
          window.clearTimeout(showTimer);
          setVisible(false);
        }
        return nextCount;
      });
    };

    window.addEventListener("app:request-start", handleStart);
    window.addEventListener("app:request-end", handleEnd);

    return () => {
      window.clearTimeout(showTimer);
      window.removeEventListener("app:request-start", handleStart);
      window.removeEventListener("app:request-end", handleEnd);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-sm" role="status" aria-live="polite">
      <div className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-8 text-center shadow-2xl shadow-slate-900/20">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-lg shadow-blue-600/20">
          <Loader2 size={30} className="animate-spin" />
        </div>
        <div className="mb-2 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
          <Sparkles size={15} /> Waking things up
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Your request is on its way</h2>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          Our free server may take up to a minute to wake up. Thanks for hanging in there while we get everything ready.
        </p>
        <div className="mx-auto mt-6 h-1.5 max-w-xs overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-blue-600 to-cyan-400" />
        </div>
      </div>
    </div>
  );
}
