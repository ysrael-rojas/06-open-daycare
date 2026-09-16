import { redirect } from "next/navigation";
import AddKidModal from "@/components/AddKidModal";
import { KidCard } from "@/components/KidCard";
import Sidebar from "@/components/Sidebar";
import { SearchIcon } from "@/components/icons";
import { kids, kidsRoom } from "@/data/mock/kids";
import { getCurrentUser } from "@/utils/auth";

export default async function KidsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-[#F6ECDF]">
      <Sidebar user={user} activeItem="children" />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[880px] px-10 pb-20 pt-[34px]">
          <div className="mb-[22px] flex items-end justify-between gap-4">
            <div>
              <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#D9583C]">
                GESTIÓN
              </div>
              <h1 className="m-0 font-display text-[30px] font-semibold text-[#3F362E]">
                Niños
              </h1>
            </div>
            <AddKidModal />
          </div>

          <div className="mb-[22px] flex items-center gap-[11px] rounded-[14px] border border-[#ECE0D0] bg-[#FFFDF9] px-4 py-3">
            <SearchIcon className="h-[18px] w-[18px] flex-none text-[#B0A290]" />
            <input
              placeholder="Buscar niño…"
              className="flex-1 border-none bg-transparent text-[15px] text-[#3F362E] placeholder:text-[#B6A99B]"
            />
          </div>

          <div className="mb-[14px] flex items-center gap-3">
            <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-[#3F362E]">
              {kidsRoom.name.toUpperCase()}
            </span>
            <span className="text-[13px] text-[#A89A8B]">
              {kids.length} {kids.length === 1 ? "niño" : "niños"}
            </span>
            <span className="h-px flex-1 bg-[#E7DAC8]" />
          </div>

          <div className="grid grid-cols-2 gap-[14px]">
            {kids.map((kid) => (
              <KidCard key={kid.id} kid={kid} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
