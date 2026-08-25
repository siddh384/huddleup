"use client";

import { useId } from "react";
import type { ReactNode } from "react";
import { Label } from "@/components/base/input/label";
import { HintText } from "@/components/base/input/hint-text";
import { Select } from "./select";
import type { SelectProps } from "./select";
import { cx } from "@/utils/cx";

/**
 * Composed counterpart to the base Input: Label → Select → HintText.
 *
 * BoardUI's Select is a bare trigger + popover (its Figma sources are
 * filter/status dropdowns that don't carry labels), so forms compose this
 * the way Input does. The label is wired to the select through
 * aria-labelledby with a generated id — react-aria only auto-wires labels
 * declared inside its own field components.
 */

export interface SelectFieldProps<T extends object>
  extends Omit<SelectProps<T>, "className"> {
  label?: ReactNode;
  hint?: ReactNode;
  /** Show an info icon next to the label. */
  tooltip?: boolean | string;
  /** Renders the hint in the error style (manual validation display). */
  isInvalid?: boolean;
  className?: string;
  children: ReactNode;
}

export function SelectField<T extends object>({
  label,
  hint,
  tooltip,
  isInvalid = false,
  className,
  children,
  ...props
}: SelectFieldProps<T>) {
  const labelId = useId();

  return (
    <div className={cx("flex w-full flex-col items-start gap-1", className)}>
      {label && (
        <Label id={labelId} isRequired={props.isRequired} tooltip={tooltip}>
          {label}
        </Label>
      )}
      <Select
        aria-labelledby={label ? labelId : undefined}
        className="w-full"
        {...props}
      >
        {children}
      </Select>
      {hint && <HintText isInvalid={isInvalid}>{hint}</HintText>}
    </div>
  );
}

SelectField.displayName = "SelectField";
