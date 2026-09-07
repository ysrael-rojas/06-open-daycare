// --- Badges ---------------------------------------------------------------

export type BadgeKind = "achievement" | "activity" | "announcement";

export const BADGE_META: Record<BadgeKind, { label: string; bg: string; color: string }> = {
  achievement: { label: "LOGRO", bg: "#CFEBD8", color: "#3E9B6C" },
  activity: { label: "ACTIVIDAD", bg: "#C7E7F1", color: "#2E89A6" },
  announcement: { label: "ANUNCIO", bg: "#CCD8F4", color: "#4E72C8" },
};

// --- Audience -------------------------------------------------------------

export type Audience = { kind: "family"; familyName: string } | { kind: "room" };

export const AUDIENCE_PREFIX: Record<Audience["kind"], string> = {
  family: "Para: familia de",
  room: "Para: toda la sala",
};

export const audienceLabel = (audience: Audience): string =>
  audience.kind === "family"
    ? `${AUDIENCE_PREFIX.family} ${audience.familyName}`
    : AUDIENCE_PREFIX.room;

// --- Post -----------------------------------------------------------------

export interface Child {
  name: string;
  initials: string;
  avatarColor: string;
  avatarTextColor: string;
}

export type PostSubject = { type: "child"; child: Child } | { type: "announcement" };

export const ANNOUNCEMENT_HEADLINE = "Anuncio general";

export interface Post {
  id: string;
  badge: BadgeKind;
  subject: PostSubject;
  createdAt: string; // "14:20"
  publishedByMe: boolean; // true → "publicado por vos"
  audience: Audience;
  body: string;
  photo?: { label: string; height: number };
  likes: number;
  comments: number;
}

// --- User & room ----------------------------------------------------------

export const currentUser = {
  id: "user-caro",
  name: "Caro Giménez",
  roleLabel: "Maestra · Soles",
  initials: "C",
  avatarColor: "#F2937A",
  avatarTextColor: "#FFFFFF",
};

export const room = {
  headlineLabel: "GUARDERÍA · SALA SOLES",
  name: "Sala Soles",
  childrenCount: 12,
  dateLabel: "martes 17 jun",
};

// --- Mock data ------------------------------------------------------------

const mateo: Child = {
  name: "Mateo",
  initials: "M",
  avatarColor: "#A9D9E8",
  avatarTextColor: "#1F7A93",
};

export const todayPosts: Post[] = [
  {
    id: "post-1",
    badge: "achievement",
    subject: { type: "child", child: mateo },
    createdAt: "14:20",
    publishedByMe: true,
    audience: { kind: "family", familyName: "Mateo" },
    body: "¡Usó el orinal solito por primera vez! Estaba feliz de contárselo a todos. Un gran paso.",
    likes: 3,
    comments: 1,
  },
  {
    id: "post-2",
    badge: "activity",
    subject: { type: "child", child: mateo },
    createdAt: "09:40",
    publishedByMe: true,
    audience: { kind: "family", familyName: "Mateo" },
    body: "Pintamos con témperas esta mañana. Mateo eligió el azul para todo y se concentró un montón mezclando colores.",
    photo: { label: "Foto · pintando con témperas", height: 200 },
    likes: 5,
    comments: 2,
  },
  {
    id: "post-3",
    badge: "announcement",
    subject: { type: "announcement" },
    createdAt: "07:50",
    publishedByMe: true,
    audience: { kind: "room" },
    body: "El viernes salimos al parque por la mañana. Recuerden mandar gorra y una botellita de agua.",
    likes: 8,
    comments: 0,
  },
];
