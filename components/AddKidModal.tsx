"use client";

import { useEffect, useState } from "react";
import { ChevronDownIcon, PlusIcon } from "@/components/icons";
import { defaultRoomId, kidRooms } from "@/data/mock/kids";

export default function AddKidModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-[18px] py-[11px] text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.7)]"
      >
        <PlusIcon className="h-[17px] w-[17px]" />
        Agregar niño
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
            aria-labelledby="add-kid-title"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[520px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]"
          >
            <div className="flex items-center justify-between gap-4 border-b border-[#ECE0D0] px-[26px] py-5">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[15px] font-bold text-[#94887B]"
              >
                Cancelar
              </button>
              <span
                id="add-kid-title"
                className="font-display text-[18px] font-semibold text-[#3F362E]"
              >
                Agregar niño
              </span>
              <button
                type="button"
                className="text-[15px] font-extrabold text-[#D9583C]"
              >
                Guardar
              </button>
            </div>

            <div className="px-[26px] py-6">
              <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                NOMBRE COMPLETO
              </label>
              <input
                placeholder="Ej. Martina López"
                className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B]"
              />

              <div className="mb-[18px] flex gap-[14px]">
                <div className="flex-1">
                  <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                    FECHA DE NACIMIENTO
                  </label>
                  <input
                    placeholder="dd/mm/aaaa"
                    inputMode="numeric"
                    className="w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B]"
                  />
                </div>
                <div className="flex-1">
                  <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                    SALA
                  </label>
                  <div className="relative">
                    <select
                      defaultValue={defaultRoomId}
                      className="w-full cursor-pointer appearance-none rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] font-bold text-[#3F362E]"
                    >
                      {kidRooms.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#B0A290]" />
                  </div>
                </div>
              </div>

              <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                ALERGIAS (ETIQUETAS)
              </label>
              <input
                placeholder="Ej. Maní, Lactosa"
                className="mb-[18px] w-full rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B]"
              />

              <label className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                NOTAS MÉDICAS
              </label>
              <textarea
                placeholder="Indicaciones, medicación, contactos…"
                rows={5}
                className="w-full resize-y rounded-[14px] border-[1.5px] border-[#EADFD0] bg-white px-4 py-[13px] text-[15px] leading-[1.5] text-[#3F362E] placeholder:text-[#B6A99B]"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
