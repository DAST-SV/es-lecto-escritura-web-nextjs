import React from "react";
import { Page } from "@/src/core/domain/types";

interface Props {
  page: Page;
}

export function ImageFullLayout({ page }: Props) {
  return (
    <div className="w-full h-full">
      {page.image ? (
        <img
          src={page.image}
          alt={page.title || ""}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
          <p className="text-gray-400 text-sm">📷 No hay imagen</p>
        </div>
      )}
    </div>
  );
}