// --- Allergies ------------------------------------------------------------

export type AllergyKind = "peanut" | "lactose";

export const ALLERGY_META: Record<
  AllergyKind,
  { chipLabel: string; chipBg: string; chipColor: string; note: string }
> = {
  peanut: {
    chipLabel: "MANÍ",
    chipBg: "#FBD8CC",
    chipColor: "#D9684A",
    note: "Alergia al maní. Evitar frutos secos. Lleva inhalador en la mochila.",
  },
  lactose: {
    chipLabel: "LACTOSA",
    chipBg: "#FBD8CC",
    chipColor: "#D9684A",
    note: "Alergia a la lactosa. Sustituir la leche por bebida vegetal en la merienda.",
  },
};

export const LINK_CHIP = { label: "VINCULAR", bg: "#F9D2DE", color: "#C56486" };

// --- Parents --------------------------------------------------------------

export type ParentRelation = "mother" | "father";
export type ParentStatus = "active" | "pending";

export const PARENT_RELATION_LABEL: Record<ParentRelation, string> = {
  mother: "Mamá",
  father: "Papá",
};

export const PARENT_STATUS_META: Record<
  ParentStatus,
  { badgeLabel: string; badgeBg: string; badgeColor: string; suffix: string }
> = {
  active: { badgeLabel: "ACTIVA", badgeBg: "#CFEBD8", badgeColor: "#3E9B6C", suffix: "" },
  pending: { badgeLabel: "PENDIENTE", badgeBg: "#F7E7A6", badgeColor: "#9A7B1E", suffix: "invitación enviada" },
};

const ACTIVE_ADJECTIVE: Record<ParentRelation, string> = {
  mother: "activa",
  father: "activo",
};

export interface Parent {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  avatarTextColor: string;
  relation: ParentRelation;
  status: ParentStatus;
}

// --- Kid ------------------------------------------------------------------

export interface Kid {
  id: string;
  slug: string;
  fullName: string;
  initials: string;
  avatarColor: string;
  avatarTextColor: string;
  ageYears: number;
  birthDateLabel: string;
  enrollmentLabel: string;
  allergies: AllergyKind[];
  parents: Parent[];
}

export const kidsRoom = { name: "Sala Soles", shortName: "Soles" };

// --- Kid rooms ------------------------------------------------------------

export interface KidRoom {
  id: string; // "soles" | "lunas" | "estrellas"
  name: string; // "Soles" | "Lunas" | "Estrellas" (label visible, español)
}

export const kidRooms: KidRoom[] = [
  { id: "soles", name: "Soles" },
  { id: "lunas", name: "Lunas" },
  { id: "estrellas", name: "Estrellas" },
];

export const defaultRoomId = "soles"; // coherencia con kidsRoom (spec 02)

// --- Derived helpers (Spanish labels from English values) ------------------

export const ageLabel = (kid: Kid): string => `${kid.ageYears} años`;

export const parentCountLabel = (kid: Kid): string => {
  const count = kid.parents.length;
  if (count === 0) return "sin padres vinculados";
  if (count === 1) return "1 padre vinculado";
  return `${count} padres vinculados`;
};

export const kidSubtitle = (kid: Kid): string => `${ageLabel(kid)} · ${parentCountLabel(kid)}`;

export const kidChip = (kid: Kid): { label: string; bg: string; color: string } | null => {
  if (kid.allergies.length > 0) {
    const allergy = ALLERGY_META[kid.allergies[0]];
    return { label: allergy.chipLabel, bg: allergy.chipBg, color: allergy.chipColor };
  }
  if (kid.parents.length === 0) return LINK_CHIP;
  return null;
};

export const parentSubtitle = (p: Parent): string =>
  p.status === "pending"
    ? `${PARENT_RELATION_LABEL[p.relation]} · ${PARENT_STATUS_META.pending.suffix}`
    : `${PARENT_RELATION_LABEL[p.relation]} · ${ACTIVE_ADJECTIVE[p.relation]}`;

// --- Mock data (8 kids of Sala Soles) -------------------------------------

export const kids: Kid[] = [
  {
    id: "kid-mateo-fernandez",
    slug: "mateo-fernandez",
    fullName: "Mateo Fernández",
    initials: "M",
    avatarColor: "#A9D9E8",
    avatarTextColor: "#1F7A93",
    ageYears: 3,
    birthDateLabel: "12 mar 2022",
    enrollmentLabel: "feb 2025",
    allergies: ["peanut"],
    parents: [
      {
        id: "parent-lucia-fernandez",
        name: "Lucía Fernández",
        initials: "L",
        avatarColor: "#C9B6E8",
        avatarTextColor: "#FFFFFF",
        relation: "mother",
        status: "active",
      },
      {
        id: "parent-diego-fernandez",
        name: "Diego Fernández",
        initials: "D",
        avatarColor: "#A9C7E8",
        avatarTextColor: "#FFFFFF",
        relation: "father",
        status: "pending",
      },
    ],
  },
  {
    id: "kid-sofia-mendez",
    slug: "sofia-mendez",
    fullName: "Sofía Méndez",
    initials: "S",
    avatarColor: "#F4B8CC",
    avatarTextColor: "#C44A7A",
    ageYears: 2,
    birthDateLabel: "9 may 2023",
    enrollmentLabel: "sep 2024",
    allergies: [],
    parents: [
      {
        id: "parent-carla-mendez",
        name: "Carla Méndez",
        initials: "C",
        avatarColor: "#F2B8C8",
        avatarTextColor: "#FFFFFF",
        relation: "mother",
        status: "active",
      },
    ],
  },
  {
    id: "kid-benjamin-ruiz",
    slug: "benjamin-ruiz",
    fullName: "Benjamín Ruiz",
    initials: "B",
    avatarColor: "#B9DEC4",
    avatarTextColor: "#3E8B62",
    ageYears: 3,
    birthDateLabel: "2 ene 2022",
    enrollmentLabel: "mar 2024",
    allergies: [],
    parents: [
      {
        id: "parent-paula-ruiz",
        name: "Paula Ruiz",
        initials: "P",
        avatarColor: "#F2B8C8",
        avatarTextColor: "#FFFFFF",
        relation: "mother",
        status: "active",
      },
      {
        id: "parent-martin-ruiz",
        name: "Martín Ruiz",
        initials: "M",
        avatarColor: "#A9C7E8",
        avatarTextColor: "#FFFFFF",
        relation: "father",
        status: "active",
      },
    ],
  },
  {
    id: "kid-valentina-soto",
    slug: "valentina-soto",
    fullName: "Valentina Soto",
    initials: "V",
    avatarColor: "#F4DC8E",
    avatarTextColor: "#9A7B1E",
    ageYears: 2,
    birthDateLabel: "30 nov 2023",
    enrollmentLabel: "feb 2025",
    allergies: [],
    parents: [],
  },
  {
    id: "kid-tomas-diaz",
    slug: "tomas-diaz",
    fullName: "Tomás Díaz",
    initials: "T",
    avatarColor: "#C9B6E8",
    avatarTextColor: "#7B5FC0",
    ageYears: 3,
    birthDateLabel: "20 jul 2022",
    enrollmentLabel: "ene 2025",
    allergies: ["lactose"],
    parents: [
      {
        id: "parent-ana-diaz",
        name: "Ana Díaz",
        initials: "A",
        avatarColor: "#F2B8C8",
        avatarTextColor: "#FFFFFF",
        relation: "mother",
        status: "active",
      },
    ],
  },
  {
    id: "kid-emma-castro",
    slug: "emma-castro",
    fullName: "Emma Castro",
    initials: "E",
    avatarColor: "#F4B8CC",
    avatarTextColor: "#C44A7A",
    ageYears: 2,
    birthDateLabel: "14 abr 2023",
    enrollmentLabel: "ago 2024",
    allergies: [],
    parents: [
      {
        id: "parent-laura-castro",
        name: "Laura Castro",
        initials: "L",
        avatarColor: "#C9B6E8",
        avatarTextColor: "#FFFFFF",
        relation: "mother",
        status: "active",
      },
    ],
  },
  {
    id: "kid-lucas-romero",
    slug: "lucas-romero",
    fullName: "Lucas Romero",
    initials: "L",
    avatarColor: "#A9D9E8",
    avatarTextColor: "#1F7A93",
    ageYears: 3,
    birthDateLabel: "10 sep 2022",
    enrollmentLabel: "feb 2025",
    allergies: [],
    parents: [
      {
        id: "parent-julia-romero",
        name: "Julia Romero",
        initials: "J",
        avatarColor: "#F2B8C8",
        avatarTextColor: "#FFFFFF",
        relation: "mother",
        status: "active",
      },
    ],
  },
  {
    id: "kid-olivia-vega",
    slug: "olivia-vega",
    fullName: "Olivia Vega",
    initials: "O",
    avatarColor: "#B9DEC4",
    avatarTextColor: "#3E8B62",
    ageYears: 2,
    birthDateLabel: "25 jun 2023",
    enrollmentLabel: "oct 2024",
    allergies: [],
    parents: [
      {
        id: "parent-andres-vega",
        name: "Andrés Vega",
        initials: "A",
        avatarColor: "#A9C7E8",
        avatarTextColor: "#FFFFFF",
        relation: "father",
        status: "active",
      },
    ],
  },
];
