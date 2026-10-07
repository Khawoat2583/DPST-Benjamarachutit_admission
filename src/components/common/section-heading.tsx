import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  title: ReactNode;
  description?: ReactNode;
  kicker?: ReactNode;
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

export function SectionHeading({
  title,
  description,
  kicker,
  className,
  titleClassName,
  descriptionClassName,
}: SectionHeadingProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {kicker ? <p className="dpst-kicker">{kicker}</p> : null}
      <h1 className={cn("dpst-section-title", titleClassName)}>{title}</h1>
      {description ? (
        <p className={cn("dpst-muted", descriptionClassName)}>{description}</p>
      ) : null}
    </div>
  );
}
