import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";

const toastStyles = {
  success: {
    icon: CheckCircle2,
    container: "border-emerald-200 bg-emerald-50 text-emerald-800",
    iconColor: "text-emerald-600",
  },
  error: {
    icon: XCircle,
    container: "border-red-200 bg-red-50 text-red-800",
    iconColor: "text-red-600",
  },
  info: {
    icon: Info,
    container: "border-blue-200 bg-blue-50 text-blue-800",
    iconColor: "text-blue-600",
  },
};

export default function Toast() {
  const [toast, setToast] = useState(null);
  const timeoutRef = useRef(null);
  const toastIdRef = useRef(0);

  useEffect(() => {
    const handleToast = (event) => {
      const toastId = ++toastIdRef.current;
      setToast({ ...event.detail, toastId });
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        setToast((currentToast) => currentToast?.toastId === toastId ? null : currentToast);
        timeoutRef.current = null;
      }, 3500);
    };

    window.addEventListener("app:toast", handleToast);
    return () => {
      window.removeEventListener("app:toast", handleToast);
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    };
  }, []);

  if (!toast) return null;

  const style = toastStyles[toast.type] || toastStyles.info;
  const Icon = style.icon;

  return (
    <div className={`fixed right-4 top-24 z-[100] flex max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl ${style.container}`} role="status">
      <Icon size={20} className={`mt-0.5 shrink-0 ${style.iconColor}`} />
      <p className="flex-1 text-sm font-medium leading-6">{toast.message}</p>
      <button
        type="button"
        onClick={() => {
          window.clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
          setToast(null);
        }}
        className="shrink-0 opacity-60 transition hover:opacity-100"
        aria-label="Dismiss notification"
      >
        <X size={17} />
      </button>
    </div>
  );
}
