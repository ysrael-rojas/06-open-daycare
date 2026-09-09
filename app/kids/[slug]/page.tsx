import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangleIcon,
  ChevronLeftIcon,
  PlusIcon,
  SunIcon,
} from "@/components/icons";
import Sidebar from "@/components/Sidebar";
import {
  ALLERGY_META,
  PARENT_STATUS_META,
  ageLabel,
  kids,
  kidsRoom,
  parentSubtitle,
} from "@/data/mock/kids";

export default async function KidProfilePage(props: PageProps<"/kids/[slug]">) {
  const { slug } = await props.params;
  const kid = kids.find((k) => k.slug === slug);

  if (!kid) {
    notFound();
  }

  const allergyNotes = kid.allergies.map((a) => ALLERGY_META[a].note).join(" ");

  return (
    <div className="flex min-h-screen bg-[#F6ECDF]">
      <Sidebar activeItem="children" />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[820px] px-10 pb-20 pt-[34px]">
          <Link
            href="/kids"
            className="mb-5 flex items-center gap-[7px] text-[14px] font-bold text-[#94887B]"
          >
            <ChevronLeftIcon className="h-[18px] w-[18px]" />
            Volver a Niños
          </Link>

          <div className="flex flex-wrap items-start gap-[26px]">
            <div className="flex min-w-[300px] flex-1 flex-col gap-[18px]">
              <div className="flex items-center gap-[18px]">
                <div
                  className="flex h-[84px] w-[84px] flex-none items-center justify-center rounded-full font-display text-[34px] font-semibold"
                  style={{
                    backgroundColor: kid.avatarColor,
                    color: kid.avatarTextColor,
                  }}
                >
                  {kid.initials}
                </div>
                <div className="flex-1">
                  <h1 className="m-0 font-display text-[28px] font-semibold text-[#3F362E]">
                    {kid.fullName}
                  </h1>
                  <p className="m-0 mt-[3px] text-[15px] text-[#94887B]">
                    {ageLabel(kid)} · {kidsRoom.name}
                  </p>
                </div>
                <a className="rounded-[12px] border-[1.5px] border-[#ECE0D0] bg-[#FFFDF9] px-4 py-[9px] text-[14px] font-bold text-[#6E6359]">
                  Editar
                </a>
              </div>

              {allergyNotes.length > 0 && (
                <div className="flex gap-[14px] rounded-[16px] bg-[#FBDAD6] px-[18px] py-4">
                  <div className="flex h-10 w-10 flex-none items-center justify-center rounded-[11px] bg-[#F4A8A0]">
                    <AlertTriangleIcon className="h-[22px] w-[22px] text-white" />
                  </div>
                  <div>
                    <div className="mb-[2px] text-[15px] font-extrabold text-[#C5413A]">
                      Alergias y notas
                    </div>
                    <div className="text-[14.5px] leading-[1.5] text-[#B25249]">
                      {allergyNotes}
                    </div>
                  </div>
                </div>
              )}

              <div className="overflow-hidden rounded-[16px] border border-[#ECE0D0] bg-[#FFFDF9]">
                <div className="flex justify-between border-b border-[#F0E6D8] px-[18px] py-[15px]">
                  <span className="text-[14.5px] text-[#94887B]">Fecha de nacimiento</span>
                  <span className="text-[14.5px] font-extrabold text-[#3F362E]">
                    {kid.birthDateLabel}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#F0E6D8] px-[18px] py-[15px]">
                  <span className="text-[14.5px] text-[#94887B]">Sala</span>
                  <span className="text-[14.5px] font-extrabold text-[#3F362E]">
                    {kidsRoom.shortName}
                  </span>
                </div>
                <div className="flex justify-between px-[18px] py-[15px]">
                  <span className="text-[14.5px] text-[#94887B]">Ingreso</span>
                  <span className="text-[14.5px] font-extrabold text-[#3F362E]">
                    {kid.enrollmentLabel}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex w-[300px] flex-none flex-col gap-[14px]">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-[9px] rounded-[14px] bg-[#3F362E] px-3 py-[13px] text-[15px] font-extrabold text-white"
              >
                <SunIcon className="h-[18px] w-[18px]" />
                Resumen del día
              </button>

              <div className="rounded-[16px] border border-[#ECE0D0] bg-[#FFFDF9] px-[18px] py-4">
                <div className="mb-[14px] text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D]">
                  PADRES VINCULADOS
                </div>
                <div className="flex flex-col gap-[14px]">
                  {kid.parents.map((parent) => {
                    const status = PARENT_STATUS_META[parent.status];
                    return (
                      <div
                        key={parent.id}
                        className="flex items-center gap-3"
                      >
                        <div
                          className="flex h-10 w-10 flex-none items-center justify-center rounded-full font-display text-[16px] font-semibold"
                          style={{
                            backgroundColor: parent.avatarColor,
                            color: parent.avatarTextColor,
                          }}
                        >
                          {parent.initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[14.5px] font-extrabold text-[#3F362E]">
                            {parent.name}
                          </div>
                          <div className="truncate text-[12.5px] text-[#A89A8B]">
                            {parentSubtitle(parent)}
                          </div>
                        </div>
                        <span
                          className="flex-none rounded-full px-[9px] py-1 text-[10.5px] font-extrabold"
                          style={{
                            backgroundColor: status.badgeBg,
                            color: status.badgeColor,
                          }}
                        >
                          {status.badgeLabel}
                        </span>
                      </div>
                    );
                  })}
                  <a className="flex items-center gap-3 px-0 pb-2 pt-2">
                    <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full border-[1.5px] border-dashed border-[#D8CBBA] text-[#B0A290]">
                      <PlusIcon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="text-[14.5px] font-extrabold text-[#C5503A]">
                      Vincular otro padre
                    </span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
