import { cn } from "@lib/cn";

function Paragraph({ children, className, ...props }: React.ComponentProps<"p">) {
  return (
    <p className={cn("leading-relaxed", className)} {...props}>
      {children}
    </p>
  );
}

function Heading2({ children, className, ...props }: React.ComponentProps<"h2">) {
  return (
    <h2 className={cn("text-2xl font-bold tracking-tight", className)} {...props}>
      {children}
    </h2>
  );
}

function Heading3({ children, className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3 className={cn("text-xl font-semibold", className)} {...props}>
      {children}
    </h3>
  );
}

function Link({ children, className, ...props }: React.ComponentProps<"a">) {
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

function InlineCode({ children, className, ...props }: React.ComponentProps<"code">) {
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

function CodeBlock({ children, className, ...props }: React.ComponentProps<"pre">) {
  return (
    <pre
      className={cn(
        "overflow-x-auto rounded-lg border border-border bg-muted p-4 text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </pre>
  );
}

function UnorderedList({ children, className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul className={cn("list-disc space-y-1 pl-6", className)} {...props}>
      {children}
    </ul>
  );
}

function OrderedList({ children, className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol className={cn("list-decimal space-y-1 pl-6", className)} {...props}>
      {children}
    </ol>
  );
}

function Blockquote({ children, className, ...props }: React.ComponentProps<"blockquote">) {
  return (
    <blockquote
      className={cn("border-l-2 border-border pl-4 text-muted-foreground italic", className)}
      {...props}
    >
      {children}
    </blockquote>
  );
}

function Table({ children, className, ...props }: React.ComponentProps<"table">) {
  return (
    <table className={cn("w-full text-sm", className)} {...props}>
      {children}
    </table>
  );
}

function TableHead({ children, className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      className={cn("border-b border-border px-2 py-1.5 text-left font-semibold", className)}
      {...props}
    >
      {children}
    </th>
  );
}

function TableCell({ children, className, ...props }: React.ComponentProps<"td">) {
  return (
    <td className={cn("border-b border-border px-2 py-1.5 text-left", className)} {...props}>
      {children}
    </td>
  );
}

export const postComponents = {
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
