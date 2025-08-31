import React from "react";

export function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  return (
    <span className="relative inline-flex items-center group">
      {children}
      <span className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-full whitespace-pre rounded bg-gray-900 px-2 py-1 text-xs text-white opacity-0 shadow transition-opacity duration-150 group-hover:opacity-100">
        {content}
      </span>
    </span>
  );
}

export default Tooltip;

