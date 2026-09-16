import type { ComponentType } from "react";
import Link from "next/link";
import { signOut } from "@/app/login/actions";
import { room } from "@/data/mock/feed";
import type { CurrentUser } from "@/utils/auth";
import {
  BellIcon,
  HomeIcon,
  LogoutIcon,
  SunIcon,
  UserIcon,
  UsersIcon,
} from "@/components/icons";
import NewPostModal from "@/components/NewPostModal";

export type NavItemKey = "feed" | "children" | "announcements" | "account";

export const NAV_ITEMS: { key: NavItemKey; label: string; href?: string }[] = [
  { key: "feed", label: "Feed", href: "/" },
  { key: "children", label: "Niños", href: "/kids" },
  { key: "announcements", label: "Avisos" },
  { key: "account", label: "Mi cuenta" },
];

const NAV_ICONS: Record<NavItemKey, ComponentType<{ className?: string }>> = {
  feed: HomeIcon,
  children: UsersIcon,
  announcements: BellIcon,
  account: UserIcon,
};

export default function Sidebar({
  user,
  activeItem = "feed",
}: {
  user: CurrentUser;
  activeItem?: NavItemKey;
}) {
  return (
    <aside className="sticky top-0 flex h-screen w-[248px] flex-none flex-col border-r border-[#ECE0D0] bg-[#FFFDF9] px-4 py-6">
      <div className="flex items-center gap-[11px] px-2 pb-[22px] pt-1">
        <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-xl bg-[linear-gradient(155deg,#F8C3A8,#F2937A)]">
          <SunIcon className="h-[21px] w-[21px] text-white" />
        </div>
        <div>
          <div className="font-display text-[17px] font-semibold leading-none text-[#3F362E]">
            OpenDayCare
          </div>
          <div className="mt-[2px] text-[11.5px] text-[#A89A8B]">{room.name}</div>
        </div>
      </div>

      <NewPostModal />

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = NAV_ICONS[item.key];
          const isActive = item.key === activeItem;
          const content = (
            <>
              <Icon className="h-[19px] w-[19px] flex-none" />
              {item.label}
            </>
          );
          const className = `flex items-center gap-3 rounded-xl px-3 py-[11px] text-[14.5px] ${
            isActive
              ? "bg-[#FBE3D8] font-extrabold text-[#D9583C]"
              : "font-semibold text-[#6E6359]"
          }`;
          if (item.href) {
            return (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={className}
              >
                {content}
              </Link>
            );
          }
          return (
            <span
              key={item.key}
              aria-current={isActive ? "page" : undefined}
              className={className}
            >
              {content}
            </span>
          );
        })}
      </nav>

      <div className="mt-[10px] border-t border-[#ECE0D0] pt-[14px]">
        <div className="flex items-center gap-[11px] px-2 py-[6px]">
          <div
            className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full font-display text-[16px] font-semibold"
            style={{
              backgroundColor: user.avatarColor,
              color: user.avatarTextColor,
            }}
          >
            {user.initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[14px] font-extrabold text-[#3F362E]">
              {user.fullName}
            </div>
            <div className="truncate text-[12px] text-[#A89A8B]">
              {user.roleLabel}
            </div>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
              className="flex h-8 w-8 flex-none cursor-pointer items-center justify-center rounded-[10px] bg-[#F6ECDF] text-[#94887B]"
            >
              <LogoutIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
