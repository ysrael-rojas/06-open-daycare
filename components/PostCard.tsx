import {
  ANNOUNCEMENT_HEADLINE,
  BADGE_META,
  audienceLabel,
  type Post,
} from "@/data/mock/feed";
import {
  CommentIcon,
  HeartIcon,
  ImageIcon,
  MegaphoneIcon,
} from "@/components/icons";

const ANNOUNCEMENT_AVATAR = {
  bg: "#CCD8F4",
  color: "#4E72C8",
};

function PostSubjectAvatar({ post }: { post: Post }) {
  if (post.subject.type === "announcement") {
    return (
      <div
        className="flex h-11 w-11 flex-none items-center justify-center rounded-full"
        style={{ backgroundColor: ANNOUNCEMENT_AVATAR.bg, color: ANNOUNCEMENT_AVATAR.color }}
      >
        <MegaphoneIcon className="h-5 w-5" />
      </div>
    );
  }
  const child = post.subject.child;
  return (
    <div
      className="flex h-11 w-11 flex-none items-center justify-center rounded-full font-display text-[17px] font-semibold"
      style={{ backgroundColor: child.avatarColor, color: child.avatarTextColor }}
    >
      {child.initials}
    </div>
  );
}

function BadgePill({ badge }: { badge: Post["badge"] }) {
  const meta = BADGE_META[badge];
  return (
    <span
      className="flex flex-none items-center gap-[7px] rounded-full px-3 py-[6px]"
      style={{ backgroundColor: meta.bg }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: meta.color }} />
      <span
        className="text-[12px] font-extrabold tracking-[0.5px]"
        style={{ color: meta.color }}
      >
        {meta.label}
      </span>
    </span>
  );
}

function PhotoPlaceholder({
  label,
  height,
}: {
  label: string;
  height: number;
}) {
  return (
    <div
      className="mt-[14px] flex flex-col items-center justify-center gap-2 rounded-[16px] border-[1.5px] border-dashed border-[#DBCDBA] bg-[#F4ECE1] text-[#B0A290]"
      style={{ height }}
    >
      <ImageIcon className="h-[30px] w-[30px]" />
      <span className="text-[13.5px]">{label}</span>
    </div>
  );
}

export function PostCard({ post }: { post: Post }) {
  const time = post.publishedByMe
    ? `${post.createdAt} · publicado por vos`
    : post.createdAt;
  const subjectName =
    post.subject.type === "child" ? post.subject.child.name : ANNOUNCEMENT_HEADLINE;

  return (
    <article className="rounded-[20px] border border-[#ECE0D0] bg-[#FFFDF9] px-[22px] py-5 shadow-[0_4px_16px_-12px_rgba(120,90,60,0.5)]">
      <div className="mb-[14px] flex items-center gap-3">
        <PostSubjectAvatar post={post} />
        <div className="min-w-0 flex-1">
          <div className="font-display text-[16.5px] font-semibold text-[#3F362E]">
            {subjectName}
          </div>
          <div className="text-[12.5px] text-[#A89A8B]">{time}</div>
        </div>
        <BadgePill badge={post.badge} />
      </div>

      <div className="mb-[10px] text-[12.5px] text-[#A89A8B]">
        {audienceLabel(post.audience)}
      </div>
      <p className="m-0 text-[15.5px] leading-[1.55] text-[#4A4038]">{post.body}</p>
      {post.photo && <PhotoPlaceholder label={post.photo.label} height={post.photo.height} />}

      <div className="mt-[16px] flex items-center gap-[18px] border-t border-[#F0E6D8] pt-[14px]">
        <span className="flex items-center gap-[7px] text-[14px] font-bold text-[#E0654A]">
          <HeartIcon className="h-[19px] w-[19px]" />
          {post.likes}
        </span>
        <span className="flex items-center gap-[7px] text-[14px] font-bold text-[#94887B]">
          <CommentIcon className="h-[18px] w-[18px]" />
          {post.comments}
        </span>
        <span className="flex-1" />
        <a className="text-[14px] font-extrabold text-[#C5503A]">Editar</a>
      </div>
    </article>
  );
}
