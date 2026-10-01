export const profile = {
  name: "Tin Grgić",
  role: "Hybrid Cloud Infrastructure Engineer",
  company: "Rimac Technology",
  linkedin: "https://linkedin.com/in/tingrgic",
  email: "", // Add your real email to enable the email links. Never use a placeholder.
};
export const projects = [
  {
    id: "komon",
    name: "Komon",
    url: "https://komon.hr",
    domain: "komon.hr",
    image: "/images/komon.webp",
    alt: "Komon website: burgundy serif wordmark and a clean cream layout.",
    description: "A website for an EU funding consultancy.",
    tags: ["EU funding", "Consultancy website"],
    note: "A little clarity goes a long way.",
  },
  {
    id: "pk-normal",
    name: "PK Normal",
    url: "https://tingrgic.github.io/pk-normal",
    domain: "tingrgic.github.io/pk-normal",
    image: "/images/pk-normal.webp",
    alt: "PK Normal website: bold white typography and an illuminated darts scene.",
    description:
      "A digital home for a Zagreb darts club.",
    tags: ["Club & community", "Interactive tools"],
    note: "Off the clock. On the board.",
  },
] as const;
export type Section = "intro" | "work" | "connect";
export const sections: { id: Section; label: string; number: string }[] = [
  { id: "intro", label: "Hello", number: "01" },
  { id: "work", label: "Work", number: "02" },
  { id: "connect", label: "Connect", number: "03" },
];
