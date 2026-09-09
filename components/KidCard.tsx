import Link from "next/link";
import { kidChip, kidSubtitle, type Kid } from "@/data/mock/kids";
import { ChevronRightIcon } from "@/components/icons";

export function KidCard({ kid }: { kid: Kid }) {
  const chip = kidChip(kid);

  return (
    <Link
      href={`/kids/${kid.slug}`}
      className="flex min-w-0 items-center gap-[14px] rounded-[18px] border border-[#ECE0D0] bg-[#FFFDF9] px-4 py-4 shadow-[0_4px_14px_-12px_rgba(120,90,60,0.5)] transition duration-150 hover:-translate-y-[2px] hover:border-[#F2A78E]"
    >
      <div
        className="flex h-12 w-12 flex-none items-center justify-center rounded-full font-display text-[19px] font-semibold"
        style={{ backgroundColor: kid.avatarColor, color: kid.avatarTextColor }}
      >
        {kid.initials}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate font-display text-[16px] font-semibold text-[#3F362E]">
          {kid.fullName}
        </div>
        <div className="truncate text-[13px] text-[#A89A8B]">{kidSubtitle(kid)}</div>
      </div>
      {chip ? (
        <span
          className="flex-none rounded-full px-[9px] py-[5px] text-[11px] font-extrabold"
          style={{ backgroundColor: chip.bg, color: chip.color }}
        >
          {chip.label}
        </span>
      ) : (
        <ChevronRightIcon className="h-[18px] w-[18px] flex-none text-[#CBB89F]" />
      )}
    </Link>
  );
}
