import { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

type Seat = {
  id: string;
  row_label: string;
  seat_number: number;
  status: "available" | "held" | "booked" | "disabled";
  price: number | string;
  category?: { name: string; color: string } | null;
};

export function SeatMap({ seats, selected, onToggle }: {
  seats: Seat[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  const rows = useMemo(() => {
    const m = new Map<string, Seat[]>();
    seats.forEach((s) => {
      if (!m.has(s.row_label)) m.set(s.row_label, []);
      m.get(s.row_label)!.push(s);
    });
    for (const [, arr] of m) arr.sort((a, b) => a.seat_number - b.seat_number);
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  const [zoom, setZoom] = useState(1);
  const wrapRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">Pinch or use controls to zoom</div>
        <div className="flex gap-1">
          <Button size="icon" variant="outline" className="h-8 w-8 bg-white/5" onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}><ZoomOut className="h-4 w-4" /></Button>
          <Button size="icon" variant="outline" className="h-8 w-8 bg-white/5" onClick={() => setZoom(1)}><Maximize2 className="h-4 w-4" /></Button>
          <Button size="icon" variant="outline" className="h-8 w-8 bg-white/5" onClick={() => setZoom((z) => Math.min(2, z + 0.15))}><ZoomIn className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="mb-4">
        <div className="mx-auto h-1.5 max-w-md rounded-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
        <div className="mt-1 text-center text-xs text-muted-foreground">SCREEN</div>
      </div>
      <div ref={wrapRef} className="overflow-auto rounded-2xl bg-black/20 p-4 touch-pan-x touch-pan-y">
        <div
          className="mx-auto inline-block origin-top transition-transform"
          style={{ transform: `scale(${zoom})` }}
        >
          {rows.map(([row, seatList]) => (
            <div key={row} className="flex items-center gap-1.5">
              <div className="w-6 text-xs text-muted-foreground text-center">{row}</div>
              <div className="flex gap-1.5">
                {seatList.map((s) => {
                  const isSel = selected.includes(s.id);
                  let cls = "bg-success/70 hover:bg-success text-black";
                  if (s.status === "held") cls = "bg-warn/60 cursor-not-allowed text-black";
                  else if (s.status === "booked") cls = "bg-destructive/60 cursor-not-allowed text-white";
                  else if (s.status === "disabled") cls = "bg-muted cursor-not-allowed text-muted-foreground";
                  if (isSel) cls = "bg-primary text-primary-foreground ring-2 ring-primary";
                  const disabled = s.status !== "available" && !isSel;
                  return (
                    <button
                      key={s.id}
                      title={`${s.row_label}${s.seat_number} · ${s.category?.name ?? ""}`}
                      disabled={disabled}
                      onClick={() => onToggle(s.id)}
                      className={`h-7 w-7 rounded-md text-[10px] font-semibold transition ${cls}`}
                    >
                      {s.seat_number}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
