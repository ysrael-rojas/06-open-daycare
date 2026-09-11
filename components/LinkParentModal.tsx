"use client";

import { useState } from "react";
import { CloseIcon, InfoIcon, PlusIcon, SendIcon } from "@/components/icons";

type LinkParentRelation = "mother" | "father" | "guardian";

const RELATION_OPTIONS: { value: LinkParentRelation; label: string }[] = [
  { value: "mother", label: "Mamá" },
  { value: "father", label: "Papá" },
  { value: "guardian", label: "Tutor/a" },
];

export default function LinkParentModal({ kidName }: { kidName: string }) {
  const [open, setOpen] = useState(false);
  const [relation, setRelation] = useState<LinkParentRelation>("mother");
  const firstName = kidName.split(" ")[0];

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

            <div className="px-[26px] py-[22px]">
              <div className="mb-5 flex gap-[11px] rounded-[14px] bg-[#E3ECFB] px-4 py-[13px]">
                <InfoIcon className="mt-[1px] h-5 w-5 flex-none text-[#4E72C8]" />
                <span className="text-[13.5px] leading-[1.45] text-[#3F5694]">
                  Le enviaremos un correo con un código para que active su
                  cuenta. Solo verá el feed de {firstName}.
                </span>
              </div>

              <label
                htmlFor="link-parent-name"
                className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]"
              >
                NOMBRE DEL PADRE/MADRE
              </label>
              <input
                id="link-parent-name"
                placeholder="Ej. Diego Fernández"
                className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B]"
              />

              <label
                htmlFor="link-parent-email"
                className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]"
              >
                EMAIL
              </label>
              <input
                id="link-parent-email"
                type="email"
                placeholder="correo@ejemplo.com"
                className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B]"
              />

              <div className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                PARENTESCO
              </div>
              <div className="mb-5 flex gap-[9px]">
                {RELATION_OPTIONS.map((option) => {
                  const selected = relation === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setRelation(option.value)}
                      className={`flex-1 rounded-full border-[1.5px] px-[11px] py-[11px] text-[14px] font-extrabold ${
                        selected
                          ? "border-[#9FB8EC] bg-[#CCD8F4] text-[#4E72C8]"
                          : "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>

              <div className="mb-5 rounded-[16px] border-[1.5px] border-dashed border-[#E6D08A] bg-[#FBF1D6] p-[18px] text-center">
                <div className="mb-2 text-[12px] font-extrabold tracking-[0.7px] text-[#A88526]">
                  CÓDIGO DE INVITACIÓN
                </div>
                <div className="font-display text-[34px] font-semibold tracking-[7px] text-[#8A7234]">
                  7K4P9
                </div>
                <div className="mt-[6px] text-[13px] text-[#A88526]">
                  Vence en 7 días
                </div>
              </div>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-[9px] rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-3 py-[14px] text-[15.5px] font-extrabold text-white shadow-[0_10px_22px_-8px_rgba(238,129,100,0.7)]"
              >
                <SendIcon className="h-[19px] w-[19px]" />
                Enviar invitación
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
