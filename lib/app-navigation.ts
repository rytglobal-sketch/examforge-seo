export const workspaceHref = "https://examforge.academy";

export type IconName =
  | "home"
  | "pdf"
  | "pen"
  | "slides"
  | "check"
  | "draft"
  | "clock"
  | "biology"
  | "law"
  | "chart"
  | "users"
  | "search"
  | "review"
  | "diagram"
  | "presentation";

export type SidebarItem = {
  href: string;
  label: string;
  icon: IconName;
};

export type QuickAction = {
  href: string;
  label: string;
  icon: IconName;
};

export const sidebarItems: SidebarItem[] = [
  { href: "/", label: "Home", icon: "home" },
  {
    href: "/agent-gallery",
    label: "Agent Gallery",
    icon: "pdf",
  },
  {
    href: "/ai-writer",
    label: "AI Writer",
    icon: "pen",
  },
  {
    href: "/chat-with-pdf",
    label: "Chat with PDF",
    icon: "slides",
  },
  {
    href: "/literature-review",
    label: "Literature Review",
    icon: "review",
  },
  {
    href: "/find-topics",
    label: "Find Topics",
    icon: "search",
  },
  {
    href: "/paraphraser",
    label: "Paraphraser",
    icon: "draft",
  },
  {
    href: "/citation-generator",
    label: "Citation Generator",
    icon: "check",
  },
  {
    href: "/extract-data",
    label: "Extract Data",
    icon: "chart",
  },
  {
    href: "/ai-detector",
    label: "AI Detector",
    icon: "users",
  },
];

export const defaultQuickActions: QuickAction[] = [
  {
    href: "/find-topics",
    label: "Search Papers",
    icon: "search",
  },
  {
    href: "/literature-review",
    label: "Literature Review",
    icon: "review",
  },
  {
    href: "/ai-writer",
    label: "AI Writer",
    icon: "pen",
  },
  {
    href: "/chat-with-pdf",
    label: "Chat with PDF",
    icon: "pdf",
  },
  {
    href: "/citation-generator",
    label: "Citations",
    icon: "check",
  },
];
