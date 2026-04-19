import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type DayHours = { day: string; hours: string };
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function HoursEditor({
  value,
  onChange,
}: {
  value: DayHours[] | null | undefined;
  onChange: (v: DayHours[]) => void;
}) {
  const map = new Map((value ?? []).map((h) => [h.day, h.hours]));
  const rows: DayHours[] = DAYS.map((d) => ({ day: d, hours: map.get(d) ?? "" }));

  function update(day: string, hours: string) {
    const next = rows.map((r) => (r.day === day ? { ...r, hours } : r));
    onChange(next);
  }

  return (
    <div className="space-y-2 rounded-lg border border-border bg-background p-4">
      <p className="text-xs text-muted-foreground">
        Examples: <span className="font-mono">12:00 – 22:00</span>, <span className="font-mono">Closed</span>
      </p>
      <div className="grid gap-2">
        {rows.map((r) => (
          <div key={r.day} className="grid grid-cols-[110px_1fr] items-center gap-3">
            <Label className="text-sm">{r.day}</Label>
            <Input
              value={r.hours}
              placeholder="12:00 – 22:00"
              onChange={(e) => update(r.day, e.target.value)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
