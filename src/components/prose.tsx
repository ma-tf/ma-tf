import type { ComponentProps } from "react";

import { cn } from "cn";

function Paragraph({ children, className, ...props }: ComponentProps<"p">) {
  return (
    <p className={cn("animate-reveal leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

function Heading2({ children, className, ...props }: ComponentProps<"h2">) {
  return (
    <h2 className={cn("animate-reveal text-2xl font-bold tracking-tight", className)} {...props}>
      {children}
    </h2>
  );
}

function Heading3({ children, className, ...props }: ComponentProps<"h3">) {
  return (
    <h3 className={cn("animate-reveal text-xl font-semibold", className)} {...props}>
      {children}
    </h3>
  );
}

function Link({ children, className, ...props }: ComponentProps<"a">) {
  return (
    <a
      className={cn(
        "underline underline-offset-4 transition-colors hover:text-muted-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}

function InlineCode({ children, className, ...props }: ComponentProps<"code">) {
  const isBlock = typeof className === "string" && className.includes("language-");
  return (
    <code
      className={cn(!isBlock && "rounded bg-muted px-1.5 py-0.5 text-sm", className)}
      {...props}
    >
      {children}
    </code>
  );
}

function CodeBlock({
  children,
  className,
  tabindex,
  ...props
}: ComponentProps<"pre"> & { tabindex?: number | string }) {
  return (
    <pre
      className={cn(
        "animate-reveal overflow-x-auto rounded-lg border border-border bg-background p-4 text-sm",
        className,
      )}
      tabIndex={tabindex === undefined ? undefined : Number(tabindex)}
      {...props}
    >
      {children}
    </pre>
  );
}

function UnorderedList({ children, className, ...props }: ComponentProps<"ul">) {
  return (
    <ul className={cn("animate-reveal list-disc space-y-1 pl-6", className)} {...props}>
      {children}
    </ul>
  );
}

function OrderedList({ children, className, ...props }: ComponentProps<"ol">) {
  return (
    <ol className={cn("animate-reveal list-decimal space-y-1 pl-6", className)} {...props}>
      {children}
    </ol>
  );
}

function Blockquote({ children, className, ...props }: ComponentProps<"blockquote">) {
  return (
    <blockquote
      className={cn(
        "animate-reveal border-l-2 border-border pl-4 text-muted-foreground italic",
        className,
      )}
      {...props}
    >
      {children}
    </blockquote>
  );
}

function Table({ children, className, ...props }: ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto">
      <table className={cn("w-full animate-reveal text-sm", className)} {...props}>
        {children}
      </table>
    </div>
  );
}

function TableHead({ children, className, ...props }: ComponentProps<"th">) {
  return (
    <th
      className={cn("border-b border-border px-2 py-1.5 text-left font-semibold", className)}
      {...props}
    >
      {children}
    </th>
  );
}

function TableCell({ children, className, ...props }: ComponentProps<"td">) {
  return (
    <td className={cn("border-b border-border px-2 py-1.5 text-left", className)} {...props}>
      {children}
    </td>
  );
}

export const proseComponents = {
  p: Paragraph,
  h2: Heading2,
  h3: Heading3,
  a: Link,
  code: InlineCode,
  pre: CodeBlock,
  ul: UnorderedList,
  ol: OrderedList,
  blockquote: Blockquote,
  table: Table,
  th: TableHead,
  td: TableCell,
};
