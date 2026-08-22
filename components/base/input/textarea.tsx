"use client";

import type { ReactNode, Ref } from "react";
import { TextArea as AriaTextArea } from "react-aria-components";
import { TextField } from "./input";
import type { TextFieldProps } from "./input";
import { Label } from "./label";
import { HintText } from "./hint-text";
import { cx } from "@/utils/cx";

/**
 * Board UI textarea. BoardUI ships no Textarea primitive, so this mirrors
 * the Input composition (TextField → Label → field shell → HintText) with
 * the same shell recipe as InputBase: radius/2lg, background/tertiary, 2px
 * inset ring that surfaces on hover/focus, and the error/disabled surfaces.
 *
 * The shell is a wrapper div (like InputBase's AriaGroup) so focus/hover
 * states style the whole field, while react-aria wires label ↔ textarea ↔
 * hint association automatically inside TextField.
 */

export interface TextareaProps
  extends Omit<TextFieldProps, "children" | "size"> {
  label?: ReactNode;
  hint?: ReactNode;
  tooltip?: boolean | string;
  placeholder?: string;
  /** Native rows attribute. Controls the field's height. */
  rows?: number;
  /** Classes for the field shell wrapper. */
  fieldClassName?: string;
  /** Classes for the <textarea> element itself. */
  textareaClassName?: string;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({
  label,
  hint,
  tooltip,
  placeholder,
  rows = 3,
  fieldClassName,
  textareaClassName,
  className,
  ref,
  ...textFieldProps
}: TextareaProps) {
  return (
    <TextField {...textFieldProps} className={className}>
      {({ isRequired, isInvalid, isDisabled }) => (
        <>
          {label && (
            <Label isRequired={isRequired} isInvalid={isInvalid} tooltip={tooltip}>
              {label}
            </Label>
          )}
          <div
            className={cx(
              "w-full rounded-2lg",
              "bg-background-tertiary-default",
              "ring-2 ring-inset ring-transparent",
              "transition-[background-color,box-shadow] duration-[var(--input-transition-ms)] ease",
              !isDisabled && !isInvalid && "hover:ring-border-button-hover",
              !isDisabled && !isInvalid && "focus-within:ring-border-button-active",
              isInvalid && "bg-background-tertiary-error",
              isDisabled && "bg-input-disabled-background",
              fieldClassName,
            )}
          >
            <AriaTextArea
              ref={ref}
              rows={rows}
              placeholder={placeholder}
              className={cx(
                "w-full resize-none rounded-2lg bg-transparent p-2 pl-3 outline-none",
                "font-sans text-body-regular text-text-primary",
                "placeholder:text-text-tertiary focus:placeholder:text-text-primary",
                "disabled:cursor-not-allowed disabled:text-input-disabled-text",
                "disabled:placeholder:text-input-disabled-text",
                isInvalid && "aria-invalid:placeholder:text-text-error-placeholder",
                textareaClassName,
              )}
            />
          </div>
          {hint && <HintText isInvalid={isInvalid}>{hint}</HintText>}
        </>
      )}
    </TextField>
  );
}

Textarea.displayName = "Textarea";
