interface PhraseBoardProps {
  maskedPhrase: string;
}

export function PhraseBoard({ maskedPhrase }: PhraseBoardProps) {
  const letters = Array.from(maskedPhrase || "");

  return (
    <section className="rounded-3xl border border-[#f2dec2] bg-[#fff9ef] px-5 py-2 shadow-lg shadow-[#b58e57]/15">
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-[#7d6540]">Bảng chữ</h2>
      <div className="flex flex-wrap gap-2">
        {letters.map((char, index) => {
          const visibleChar = char === " " ? "" : char;
          const isBlank = char === " ";
          return (
            <div
              key={`${char}-${index}`}
              className={[
                "flex h-12 w-10 items-center justify-center rounded-lg border text-xl font-bold uppercase transition",
                isBlank
                  ? "border-transparent bg-transparent"
                  : visibleChar === "_"
                    ? "border-[#e5c596] bg-[#fce8c8] text-[#d7b17f]"
                    : "border-[#2f8f7d] bg-[#c6f1e8] text-[#11453d]",
              ].join(" ")}
            >
              {visibleChar}
            </div>
          );
        })}
      </div>
    </section>
  );
}
