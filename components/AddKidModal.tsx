"use client";

import { useEffect, useState } from "react";
import { ChevronDownIcon, PlusIcon } from "@/components/icons";
import { defaultRoomId, kidRooms } from "@/data/mock/kids";

const INITIAL_FORM = {
  fullName: "",
  birthDate: "",
  roomId: defaultRoomId,
  allergies: "",
  medicalNotes: "",
};

const INITIAL_ERRORS = {
  fullName: false,
  birthDate: false,
  roomId: false,
};

const isCompleteDate = (value: string) => /^\d{2}\/\d{2}\/\d{4}$/.test(value);

function formatDateMask(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter((part) => part.length > 0)
    .join("/");
}

type FormField = keyof typeof INITIAL_FORM;
type ErrorField = keyof typeof INITIAL_ERRORS;

export default function AddKidModal() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState(INITIAL_ERRORS);

  const handleClose = () => {
    setOpen(false);
    setForm(INITIAL_FORM);
    setErrors(INITIAL_ERRORS);
  };

  const updateField = (field: FormField, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const guardar = () => {
    const nextErrors = {
      fullName: form.fullName.trim() === "",
      birthDate: !isCompleteDate(form.birthDate),
      roomId: form.roomId === "",
    };
    setErrors(nextErrors);
    const hasErrors = Object.values(nextErrors).some(Boolean);
    if (!hasErrors) handleClose();
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const fieldClasses = (hasError: boolean, extra = "") =>
    `w-full rounded-[14px] border-[1.5px] bg-white px-4 py-[13px] text-[15px] text-[#3F362E] placeholder:text-[#B6A99B] ${
      hasError ? "border-[#E46A4F]" : "border-[#EADFD0]"
    } ${extra}`;

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
            if (event.target === event.currentTarget) handleClose();
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
                onClick={handleClose}
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
                onClick={guardar}
                className="text-[15px] font-extrabold text-[#D9583C]"
              >
                Guardar
              </button>
            </div>

            <div className="px-[26px] py-6">
              <label
                htmlFor="add-kid-full-name"
                className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]"
              >
                NOMBRE COMPLETO
              </label>
              <input
                id="add-kid-full-name"
                placeholder="Ej. Martina López"
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                className={fieldClasses(errors.fullName, "mb-[18px]")}
              />

              <div className="mb-[18px] flex gap-[14px]">
                <div className="flex-1">
                  <label
                    htmlFor="add-kid-birth-date"
                    className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]"
                  >
                    FECHA DE NACIMIENTO
                  </label>
                  <input
                    id="add-kid-birth-date"
                    placeholder="dd/mm/aaaa"
                    inputMode="numeric"
                    autoComplete="off"
                    value={form.birthDate}
                    onChange={(event) =>
                      updateField("birthDate", formatDateMask(event.target.value))
                    }
                    className={fieldClasses(errors.birthDate)}
                  />
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="add-kid-room"
                    className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]"
                  >
                    SALA
                  </label>
                  <div className="relative">
                    <select
                      id="add-kid-room"
                      value={form.roomId}
                      onChange={(event) => updateField("roomId", event.target.value)}
                      className={fieldClasses(
                        errors.roomId,
                        "cursor-pointer appearance-none font-bold",
                      )}
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

              <label
                htmlFor="add-kid-allergies"
                className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]"
              >
                ALERGIAS (ETIQUETAS)
              </label>
              <input
                id="add-kid-allergies"
                placeholder="Ej. Maní, Lactosa"
                value={form.allergies}
                onChange={(event) => updateField("allergies", event.target.value)}
                className={fieldClasses(false, "mb-[18px]")}
              />

              <label
                htmlFor="add-kid-medical-notes"
                className="mb-2 block text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]"
              >
                NOTAS MÉDICAS
              </label>
              <textarea
                id="add-kid-medical-notes"
                placeholder="Indicaciones, medicación, contactos…"
                rows={5}
                value={form.medicalNotes}
                onChange={(event) => updateField("medicalNotes", event.target.value)}
                className={fieldClasses(false, "resize-y leading-[1.5]")}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
