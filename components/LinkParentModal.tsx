"use client";

import { useCallback, useEffect, useState } from "react";
import { CloseIcon, InfoIcon, PlusIcon, SendIcon } from "@/components/icons";

type LinkParentRelation = "mother" | "father" | "guardian";

const RELATION_OPTIONS: { value: LinkParentRelation; label: string }[] = [
  { value: "mother", label: "Mamá" },
  { value: "father", label: "Papá" },
  { value: "guardian", label: "Tutor/a" },
];

const INITIAL_FORM: {
  fullName: string;
  email: string;
  relation: LinkParentRelation;
} = {
  fullName: "",
  email: "",
  relation: "mother",
};

type FormErrors = {
  fullName: boolean;
  email: boolean;
};

const INITIAL_ERRORS: FormErrors = {
  fullName: false,
  email: false,
};

const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;

function validate(form: typeof INITIAL_FORM): FormErrors {
  return {
    fullName: form.fullName.trim() === "",
    email: !EMAIL_PATTERN.test(form.email.trim()),
  };
}

type FormField = "fullName" | "email";

export default function LinkParentModal({ kidName }: { kidName: string }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [submitted, setSubmitted] = useState(false);
  const firstName = kidName.split(" ")[0];

  const reset = useCallback(() => {
    setForm(INITIAL_FORM);
    setErrors(INITIAL_ERRORS);
    setSubmitted(false);
  }, []);

  const handleOpen = () => {
    reset();
    setOpen(true);
  };

  const handleClose = useCallback(() => {
    setOpen(false);
    reset();
  }, [reset]);

  const updateField = (field: FormField, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    if (submitted) setErrors(validate(next));
  };

  const enviar = () => {
    setSubmitted(true);
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (!nextErrors.fullName && !nextErrors.email) handleClose();
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, handleClose]);

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
        onClick={handleOpen}
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
            if (event.target === event.currentTarget) handleClose();
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
                onClick={handleClose}
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
                value={form.fullName}
                onChange={(event) => updateField("fullName", event.target.value)}
                aria-invalid={errors.fullName || undefined}
                className={fieldClasses(errors.fullName, "mb-[18px]")}
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
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                aria-invalid={errors.email || undefined}
                className={fieldClasses(errors.email, "mb-[18px]")}
              />

              <div className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                PARENTESCO
              </div>
              <div className="mb-5 flex gap-[9px]">
                {RELATION_OPTIONS.map((option) => {
                  const selected = form.relation === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        setForm({ ...form, relation: option.value })
                      }
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
                onClick={enviar}
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
