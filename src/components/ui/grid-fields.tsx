import { cn } from "@/lib/utils";

interface GridFieldsProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  columns?: number;
}

export function GridFields({
  children,
  columns = 2,
  className,
  ...props
}: GridFieldsProps) {
  return (
    <div
      className={cn(
        `grid gap-4`,
        {
          "grid-cols-1": columns === 1,
          "grid-cols-2": columns === 2,
          "grid-cols-3": columns === 3,
          "grid-cols-4": columns === 4,
        },
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
