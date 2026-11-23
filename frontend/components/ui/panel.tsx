import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type PanelProps = {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  tone?: "light" | "dark";
  id?: string;
  className?: string;
  children: ReactNode;
};

export function Panel({ title, description, action, tone = "light", id, className, children }: PanelProps) {
  return (
    <section
      id={id}
      className={cn(
        "flex scroll-mt-6 flex-col gap-5 rounded-[20px] p-6",
        tone === "light" ? "border border-line bg-white" : "bg-ink text-cream",
        className,
      )}
    >
      {title || action ? (
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            {title ? <h2 className="text-xl font-extrabold tracking-[-0.03em]">{title}</h2> : null}
            {description ? (
              <p className={cn("text-sm", tone === "light" ? "text-body" : "text-muted-dark")}>
                {description}
              </p>
            ) : null}
          </div>
          {action}
        </div>
      ) : null}
      {children}
    </section>
  );
}
