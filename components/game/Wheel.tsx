"use client";

import type { WheelSegment } from "@/lib/types";

interface WheelProps {
  segments: WheelSegment[];
  rotation: number;
  isAnimating: boolean;
  lastResultLabel?: string | null;
}

function segmentColor(type: WheelSegment["type"], index: number): string {
  if (type === "bankrupt") {
    return "#d44f4f";
  }
  if (type === "lose-turn") {
    return "#334e78";
  }

  const palette = ["#f08b37", "#d47934", "#2a9a8e", "#236ca8", "#f0b73e", "#449166"];
  return palette[index % palette.length];
}

function polar(cx: number, cy: number, radius: number, angleDeg: number): { x: number; y: number } {
  const angle = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function ringSlicePath(
  cx: number,
  cy: number,
  innerRadius: number,
  outerRadius: number,
  startAngle: number,
  endAngle: number,
): string {
  const outerStart = polar(cx, cy, outerRadius, startAngle);
  const outerEnd = polar(cx, cy, outerRadius, endAngle);
  const innerStart = polar(cx, cy, innerRadius, startAngle);
  const innerEnd = polar(cx, cy, innerRadius, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerRadius} ${outerRadius} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    "Z",
  ].join(" ");
}

export function Wheel({ segments, rotation, isAnimating, lastResultLabel }: WheelProps) {
  const segmentAngle = 360 / segments.length;
  const size = 320;
  const center = size / 2;
  const outerRadius = 148;
  const innerRadius = 54;

  return (
    <section className="rounded-3xl border border-[#f2d6a8] bg-linear-to-b from-[#fff4de] to-[#ffeac5] p-4 shadow-xl shadow-[#d2933f]/20">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#7f5f35]">Vòng quay</h2>

      <div className="relative mx-auto h-[320px] w-[320px]">
        <div className="absolute left-1/2 top-[2px] z-20 h-0 w-0 -translate-x-1/2 border-x-[14px] border-t-[26px] border-x-transparent border-t-[#1f3445]" />
        <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full drop-shadow-lg">
          <g
            style={{
              transformOrigin: `${center}px ${center}px`,
              transform: `rotate(${rotation}deg)`,
              transition: isAnimating ? "transform 4s cubic-bezier(0.16, 1, 0.3, 1)" : "none",
            }}
          >
            {segments.map((segment, index) => {
              const startAngle = index * segmentAngle;
              const endAngle = (index + 1) * segmentAngle;
              const midAngle = startAngle + segmentAngle / 2;
              const textPoint = polar(center, center, 104, midAngle);

              return (
                <g key={segment.id}>
                  <path
                    d={ringSlicePath(center, center, innerRadius, outerRadius, startAngle, endAngle)}
                    fill={segmentColor(segment.type, index)}
                    stroke="#fff7ea"
                    strokeWidth="2"
                  />
                  <text
                    x={textPoint.x}
                    y={textPoint.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="#fff"
                    transform={`rotate(${midAngle}, ${textPoint.x}, ${textPoint.y})`}
                  >
                    {segment.label}
                  </text>
                </g>
              );
            })}

            <circle cx={center} cy={center} r={innerRadius} fill="#11453d" stroke="#ffffff" strokeWidth="8" />
          </g>
          <circle cx={center} cy={center} r={outerRadius + 6} fill="transparent" stroke="#fff7ea" strokeWidth="10" />
        </svg>

        {/* <div className="absolute inset-x-0 bottom-2 flex justify-center">
          <span className="rounded-full bg-[#1f6f78] px-4 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-[#f6f6f0]">
            Kết quả: {lastResultLabel || "--"}
          </span>
        </div> */}
      </div>
    </section>
  );
}
