import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function AuthLink({ className, ...props }: ComponentProps<typeof Link>) {
  return <Link className={cn("font-bold text-fire-strong", className)} {...props} />;
}

export function AuthSwitch({ question, href, action }: { question: string; href: string; action: string }) {
  return (
    <p className="text-sm text-body">
      {question} <AuthLink href={href}>{action} →</AuthLink>
    </p>
  );
}
