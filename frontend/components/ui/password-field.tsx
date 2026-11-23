"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { Field } from "@/components/ui/field";

type PasswordFieldProps = Omit<ComponentProps<typeof Field>, "type" | "endAdornment">;

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Field
      {...props}
      type={visible ? "text" : "password"}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ukryj hasło" : "Pokaż hasło"}
          aria-pressed={visible}
          className="flex size-10 items-center justify-center rounded-lg text-muted transition-colors hover:text-ink focus-visible:text-fire-strong focus-visible:outline-none"
        >
          {visible ? (
            <EyeOff className="size-5" aria-hidden="true" />
          ) : (
            <Eye className="size-5" aria-hidden="true" />
          )}
        </button>
      }
    />
  );
}
