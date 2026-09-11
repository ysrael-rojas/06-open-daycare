"use client";

import { useEffect, useState } from "react";
import { PlusIcon } from "@/components/icons";
import { kids } from "@/data/mock/kids";

type PostType =
  | "food"
  | "nap"
  | "activity"
  | "achievement"
  | "mood"
  | "photo"
  | "announcement";

interface NewPostForm {
  allRoom: boolean;
  kidIds: string[];
  type: PostType;
  description: string;
}

const INITIAL_FORM: NewPostForm = {
  allRoom: false,
  kidIds: ["kid-mateo-fernandez"],
  type: "food",
  description:
    "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón.",
};

const POST_TYPES: { id: PostType; label: string; bg: string; color: string }[] = [
  { id: "food", label: "Comida", bg: "#9A7B1E", color: "#FFFFFF" },
  { id: "nap", label: "Siesta", bg: "#E7DCF6", color: "#7B5FC0" },
  { id: "activity", label: "Actividad", bg: "#2E89A6", color: "#FFFFFF" },
  { id: "achievement", label: "Logro", bg: "#CFEBD8", color: "#3E9B6C" },
  { id: "mood", label: "Ánimo", bg: "#F9D2DE", color: "#C56486" },
  { id: "photo", label: "Foto", bg: "#FBD8CC", color: "#D9684A" },
  { id: "announcement", label: "Anuncio", bg: "#CCD8F4", color: "#4E72C8" },
];

export default function NewPostModal() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);

  const handleClose = () => {
    setOpen(false);
    setForm(INITIAL_FORM);
  };

  const toggleKid = (kidId: string) => {
    setForm((prev) => {
      if (prev.allRoom) return { ...prev, allRoom: false, kidIds: [kidId] };
      const selected = prev.kidIds.includes(kidId);
      return {
        ...prev,
        kidIds: selected
          ? prev.kidIds.filter((id) => id !== kidId)
          : [...prev.kidIds, kidId],
      };
    });
  };

  const toggleAllRoom = () => {
    setForm((prev) => ({ ...prev, allRoom: !prev.allRoom, kidIds: [] }));
  };

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
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
        className="mb-[18px] flex w-full items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(180deg,#F4977E,#EE8164)] px-3 py-3 text-[14.5px] font-extrabold text-white shadow-[0_8px_18px_-8px_rgba(238,129,100,0.75)]"
      >
        <PlusIcon className="h-[17px] w-[17px]" />
        Nueva publicación
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
            aria-labelledby="new-post-title"
            onClick={(event) => event.stopPropagation()}
            className="w-full max-w-[580px] overflow-hidden rounded-[24px] border border-[#ECE0D0] bg-[#FBF4EC] shadow-[0_20px_50px_-24px_rgba(63,54,46,0.35)]"
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
                id="new-post-title"
                className="font-display text-[18px] font-semibold text-[#3F362E]"
              >
                Nueva publicación
              </span>
              <button
                type="button"
                onClick={handleClose}
                className="text-[15px] font-extrabold text-[#D9583C]"
              >
                Publicar
              </button>
            </div>

            <div className="px-[26px] py-6">
              <div className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                PARA
              </div>
              <div className="mb-[22px] flex flex-wrap gap-[9px]">
                {kids.map((kid) => {
                  const selected = !form.allRoom && form.kidIds.includes(kid.id);
                  return (
                    <button
                      key={kid.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleKid(kid.id)}
                      className={`flex items-center gap-2 rounded-full border-[1.5px] py-[6px] pl-[6px] pr-[14px] text-[14px] font-bold ${
                        selected
                          ? "border-[#3F362E] bg-[#3F362E] text-white"
                          : "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                      }`}
                    >
                      <span
                        className="flex h-[26px] w-[26px] items-center justify-center rounded-full font-display text-[13px] font-semibold"
                        style={{
                          backgroundColor: kid.avatarColor,
                          color: kid.avatarTextColor,
                        }}
                      >
                        {kid.initials}
                      </span>
                      {kid.fullName.split(" ")[0]}
                    </button>
                  );
                })}
                <button
                  type="button"
                  aria-pressed={form.allRoom}
                  onClick={toggleAllRoom}
                  className={`rounded-full border-[1.5px] px-4 py-[6px] text-[14px] font-bold ${
                    form.allRoom
                      ? "border-[#3F362E] bg-[#3F362E] text-white"
                      : "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                  }`}
                >
                  Toda la sala
                </button>
              </div>

              <div className="mb-[10px] text-[12px] font-extrabold tracking-[0.7px] text-[#94887B]">
                TIPO
              </div>
              <div className="mb-[22px] flex flex-wrap gap-[9px]">
                {POST_TYPES.map((type) => {
                  const selected = form.type === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() =>
                        setForm((prev) => ({ ...prev, type: type.id }))
                      }
                      style={
                        selected
                          ? { backgroundColor: type.bg, color: type.color }
                          : undefined
                      }
                      className={`rounded-full border-[1.5px] px-4 py-2 text-[13.5px] font-extrabold ${
                        selected
                          ? "border-transparent"
                          : "border-[#ECE0D0] bg-[#FFFDF9] text-[#6E6359]"
                      }`}
                    >
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
