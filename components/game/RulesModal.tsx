"use client";

import { useState } from "react";

import { GameRulesSection } from "./GameRulesSection";

export function RulesModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-[#cc7251] to-[#ad5f42] text-2xl font-bold text-white shadow-lg shadow-[#cc7251]/30 transition-transform hover:scale-110 active:scale-95"
        aria-label="Xem luật chơi"
      >
        !
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-[#fff8ee] shadow-2xl">
            <div className="bg-gradient-to-r from-[#1f6f78] to-[#143e43] px-6 py-4 text-white">
              <h2 className="text-xl font-bold tracking-widest uppercase">Luật chơi chiếc nón kỳ diệu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="absolute right-4 top-4 rounded-full bg-white/20 p-2 text-white transition hover:bg-white/40"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>
            
            <div className="max-h-[70vh] overflow-y-auto p-2">
              <GameRulesSection />
            </div>
            
            <div className="bg-[#ebd7b8] px-6 py-4 text-right">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-xl bg-[#cc7251] px-6 py-2 font-bold text-white transition hover:bg-[#ad5f42]"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
