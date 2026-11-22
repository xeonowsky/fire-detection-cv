import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/cn";
import { SITE } from "@/lib/site";

export function EmergencyNotice({ title, className }: { title: string; className?: string }) {
  const [primary, secondary] = SITE.emergencyNumbers;
  return (
    <div className={cn("flex gap-4 rounded-2xl bg-ink p-5 text-cream", className)}>
      <ShieldAlert className="size-6 shrink-0 text-fire" aria-hidden="true" />
      <p className="text-sm leading-relaxed">
        <strong className="text-white">{title}</strong> Jeśli widzisz pożar, dzwoń pod{" "}
        <strong className="text-fire">{primary}</strong> lub{" "}
        <strong className="text-fire">{secondary}</strong>.
      </p>
    </div>
  );
}
