import { CameraIcon } from "@/components/icons";
import { PostCard } from "@/components/PostCard";
import Sidebar from "@/components/Sidebar";
import { currentUser, room, todayPosts } from "@/data/mock/feed";

export default function HomePage() {
  const firstName = currentUser.name.split(" ")[0];

  return (
    <div className="flex min-h-screen bg-[#F6ECDF]">
      <Sidebar />
      <main className="h-screen min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-[760px] px-10 pb-20 pt-[34px]">
          <div className="mb-6">
            <div className="mb-1 text-[12.5px] font-extrabold tracking-[0.8px] text-[#D9583C]">
              {room.headlineLabel}
            </div>
            <h1 className="m-0 font-display text-[30px] font-semibold text-[#3F362E]">
              Buenas, {firstName}
            </h1>
            <p className="mt-[5px] text-[14.5px] text-[#94887B]">
              {room.childrenCount} niños · {room.dateLabel}
            </p>
          </div>

          <div className="mb-6 flex cursor-pointer items-center gap-[14px] rounded-[18px] border border-[#ECE0D0] bg-[#FFFDF9] px-[18px] py-[14px] shadow-[0_4px_14px_-10px_rgba(120,90,60,0.4)]">
            <div
              className="flex h-10 w-10 flex-none items-center justify-center rounded-full font-display text-[16px] font-semibold"
              style={{
                backgroundColor: currentUser.avatarColor,
                color: currentUser.avatarTextColor,
              }}
            >
              {currentUser.initials}
            </div>
            <span className="flex-1 text-[15px] text-[#A89A8B]">
              Compartí un momento…
            </span>
            <span className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-xl bg-[#FBE3D8] text-[#E0654A]">
              <CameraIcon className="h-[19px] w-[19px]" />
            </span>
          </div>

          <div className="mb-[14px] flex items-center gap-[14px]">
            <span className="text-[12.5px] font-extrabold tracking-[0.8px] text-[#8A7C6D]">
              PUBLICADO HOY
            </span>
            <span className="h-px flex-1 bg-[#E7DAC8]" />
          </div>

          <div className="flex flex-col gap-4">
            {todayPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
