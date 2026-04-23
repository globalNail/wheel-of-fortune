export type ToastType = "success" | "error" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastStackProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

function tone(type: ToastType): string {
  if (type === "success") {
    return "border-[#8ed6ab] bg-[#ecfff3] text-[#135b35]";
  }
  if (type === "error") {
    return "border-[#efb1b1] bg-[#fff2f2] text-[#8e2f2f]";
  }
  return "border-[#b4d7e8] bg-[#f2fbff] text-[#1f546f]";
}

export function ToastStack({ toasts, onDismiss }: ToastStackProps) {
  return (
    <div className="fixed right-4 top-4 z-50 flex w-[min(90vw,360px)] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={[
            "animate-[toast-in_260ms_ease-out] rounded-2xl border px-4 py-3 text-sm shadow-lg",
            tone(toast.type),
          ].join(" ")}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start justify-between gap-3">
            <p className="leading-5">{toast.message}</p>
            <button
              type="button"
              className="rounded-full px-2 py-1 text-xs font-semibold opacity-70 transition hover:opacity-100"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dong thong bao"
            >
              Dong
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
