"use client";

import { useState } from "react";
import { CloseIcon, PlusIcon } from "@/components/icons";

export default function LinkParentModal({ kidName }: { kidName: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex items-center gap-3 px-0 pb-2 pt-2"
      >
        <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border-[1.5px] border-dashed border-[#D8CBBA] text-[#B0A290]">
          <PlusIcon className="h-[18px] w-[18px]" />
        </span>
        <span className="text-[14.5px] font-extrabold text-[#C5503A]">
          Vincular otro padre
        </span>
      </button>

      {open && (
        <div
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(63,54,46,0.5)] p-6"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="link-parent-title"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[480px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#ECE0D0] px-[26px] py-5">
              <div>
                <div
                  id="link-parent-title"
                  className="font-display text-[18px] font-semibold text-[#3F362E]"
                >
                  Vincular padre
                </div>
                <div className="text-[13px] text-[#A89A8B]">a {kidName}</div>
              </div>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setOpen(false)}
                className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-[10px] bg-[#F0E6D8] text-[#94887B]"
              >
                <CloseIcon className="h-[18px] w-[18px]" />
              </button>
            </div>

            <div className="px-[26px] py-[22px]" />
          </div>
        </div>
      )}
    </>
  );
}
