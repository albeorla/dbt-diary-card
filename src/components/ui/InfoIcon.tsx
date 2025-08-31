import React from "react";
import { Tooltip } from "./Tooltip";

export function InfoIcon({ title }: { title: string }) {
  return (
    <Tooltip content={title}>
      <span
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-gray-300 text-[10px] font-semibold text-gray-500 hover:bg-gray-50"
        role="img"
        aria-label="Info"
      >
        i
      </span>
    </Tooltip>
  );
}

export default InfoIcon;

