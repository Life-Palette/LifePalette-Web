interface GhostTextProps {
  suggestion: string;
}

export function GhostText({ suggestion }: GhostTextProps) {
  if (!suggestion) return null;

  return (
    <style>
      {`
        [data-slate-editor="true"] [data-slate-node="text"]:last-child::after {
          content: "${suggestion.replace(/"/g, '\\"').replace(/\n/g, "\\A")}";
          color: rgba(156, 163, 175, 0.5);
          pointer-events: none;
          user-select: none;
        }
      `}
    </style>
  );
}
