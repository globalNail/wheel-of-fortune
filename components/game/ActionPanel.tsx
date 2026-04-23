"use client";

import { useState } from "react";
import type { PublicGameSession } from "@/lib/types";

interface ActionPanelProps {
  session: PublicGameSession;
  isCurrentTeam: boolean;
  canSpin: boolean;
  onSpin: () => Promise<void>;
}

export function ActionPanel({
  session,
  isCurrentTeam,
  canSpin,
  onSpin,
}: ActionPanelProps) {
  const [loadingSpin, setLoadingSpin] = useState(false);

  return (
    <section className="rounded-3xl border border-[#efddc1] bg-[#fff9ee] p-4 shadow-lg shadow-[#c99d58]/10">
      <div className="flex"> 
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#8f6c44]">Thao tác</h2>

        <p className="mb-3 rounded-xl border border-[#f0ddc0] bg-white px-2 text-sm text-[#6c5132]">
          {isCurrentTeam ? "Đang đến lượt bạn. Chọn hành động." : "Đang chờ đội khác thao tác"}
        </p>
      </div>

      <div className="space-y-4">
        <button
          type="button"
          onClick={async () => {
            setLoadingSpin(true);
            try {
              await onSpin();
            } finally {
              setLoadingSpin(false);
            }
          }}
          disabled={!isCurrentTeam || !canSpin || loadingSpin || session.status !== "playing"}
          className="w-full rounded-2xl bg-[#1f6f78] px-4 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-white transition enabled:hover:bg-[#185860] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loadingSpin ? "Đang quay..." : "Quay vòng"}
        </button>
      </div>
    </section>
  );
}
