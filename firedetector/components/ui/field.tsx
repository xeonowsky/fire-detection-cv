import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export const controlClass =
  "w-full rounded-xl border-2 border-ink bg-white px-4 text-[15px] font-medium text-ink outline-none transition-shadow placeholder:text-muted/70 focus:border-fire focus:shadow-[0_0_0_4px_rgb(255_91_20/0.18)]";

const controlErrorClass = "border-fire-strong bg-fire-soft";

type ShellProps = {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  aside?: ReactNode;
  children: ReactNode;
};

function FieldShell({ id, label, error, hint, aside, children }: ShellProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="font-mono text-[12.5px] font-semibold uppercase">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-[13px] font-semibold text-fire-deep">
          {error}
        </p>
      ) : hint ? (
        <div id={`${id}-hint`} className="text-[13px] text-muted">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

type CommonFieldProps = {
  label: string;
  error?: string;
  hint?: ReactNode;
  aside?: ReactNode;
};

function useFieldIds(id: string | undefined, error?: string, hint?: ReactNode) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const describedBy = error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined;
  return { fieldId, describedBy };
}

type FieldProps = CommonFieldProps &
  ComponentProps<"input"> & {
    endAdornment?: ReactNode;
  };

export function Field({ label, error, hint, aside, endAdornment, className, id, ...props }: FieldProps) {
  const { fieldId, describedBy } = useFieldIds(id, error, hint);

  return (
    <FieldShell id={fieldId} label={label} error={error} hint={hint} aside={aside}>
      <div className="relative">
        <input
          id={fieldId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(
            controlClass,
            "h-[50px]",
            error && controlErrorClass,
            endAdornment && "pr-12",
            className,
          )}
          {...props}
        />
        {endAdornment ? (
          <div className="absolute inset-y-0 right-1 flex items-center">{endAdornment}</div>
        ) : null}
      </div>
    </FieldShell>
  );
}

type SelectFieldProps = CommonFieldProps & ComponentProps<"select"> & { options: readonly string[] };

export function SelectField({
  label,
  error,
  hint,
  aside,
  options,
  className,
  id,
  ...props
}: SelectFieldProps) {
  const { fieldId, describedBy } = useFieldIds(id, error, hint);

  return (
    <FieldShell id={fieldId} label={label} error={error} hint={hint} aside={aside}>
      <select
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(controlClass, "h-[50px]", error && controlErrorClass, className)}
        {...props}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </FieldShell>
  );
}

type TextareaFieldProps = CommonFieldProps & ComponentProps<"textarea">;

export function TextareaField({ label, error, hint, aside, className, id, ...props }: TextareaFieldProps) {
  const { fieldId, describedBy } = useFieldIds(id, error, hint);

  return (
    <FieldShell id={fieldId} label={label} error={error} hint={hint} aside={aside}>
      <textarea
        id={fieldId}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(controlClass, "py-3", error && controlErrorClass, className)}
        {...props}
      />
    </FieldShell>
  );
}
