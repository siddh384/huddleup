import { cn } from "@/lib/utils";

type LoaderProps = {
  className?: string;
  size?: number; // pixel size of the spinner diameter
};

export default function Loader({ className, size = 40 }: LoaderProps) {
  const dimension = `${size}px`;
  return (
    <div
      className={cn("inline-flex items-center justify-center", className)}
      role="status"
      aria-label="Loading"
    >
      <div
        className="rounded-full border-2 border-muted-foreground/30 border-t-primary animate-spin"
        style={{ width: dimension, height: dimension }}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}
