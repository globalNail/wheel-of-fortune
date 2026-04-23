"use client";
import { useEffect } from "react";

export default function AntiCopyWrapper({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Chặn Ctrl + U (Xem Source)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") {
        e.preventDefault();
        return false;
      }

      // 2. Chặn F12 (DevTools)
      if (e.key === "F12") {
        e.preventDefault();
        return false;
      }

      // 3. Chặn Ctrl + Shift + I / J / C (Inspect/Console)
      if (
        (e.ctrlKey || e.metaKey) && 
        e.shiftKey && 
        ["i", "j", "c"].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
        return false;
      }

      // 4. Chặn Ctrl + S (Tránh lưu trang web)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        return false;
      }
    };

    // Chặn chuột phải
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  return <div className="select-none">{children}</div>;
}
