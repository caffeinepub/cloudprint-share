import { cn } from "@/lib/utils";
import { Layers, LayoutDashboard, List, Send, Settings } from "lucide-react";
import type { ReactNode } from "react";

export type Page = "dashboard" | "submit" | "myjobs" | "queue" | "admin";

interface Props {
  children: ReactNode;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  isAdmin: boolean;
  userName: string;
  onLogout: () => void;
}

export default function Layout({
  children,
  currentPage,
  onNavigate,
  isAdmin,
  userName,
  onLogout,
}: Props) {
  const navItems: { page: Page; label: string; icon: ReactNode }[] = [
    {
      page: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    { page: "submit", label: "Submit", icon: <Send className="w-5 h-5" /> },
    { page: "myjobs", label: "My Jobs", icon: <List className="w-5 h-5" /> },
    { page: "queue", label: "Queue", icon: <Layers className="w-5 h-5" /> },
    ...(isAdmin
      ? [
          {
            page: "admin" as Page,
            label: "Admin",
            icon: <Settings className="w-5 h-5" />,
          },
        ]
      : []),
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header
        className="sticky top-0 z-50 px-4 py-3 flex items-center justify-between"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.18 0.05 230), oklch(0.23 0.06 230))",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-400 flex items-center justify-center shadow">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <title>Printer</title>
              <path d="M6 9V2h12v7" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">
            CloudPrint
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-teal-100 text-sm font-medium truncate max-w-[120px]">
            {userName}
          </span>
          <button
            type="button"
            onClick={onLogout}
            className="text-white/70 hover:text-white text-xs border border-white/20 rounded-md px-2 py-1 transition-colors"
            data-ocid="header.button"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="flex-1 pb-20">
        <div className="max-w-[480px] mx-auto w-full">{children}</div>
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="max-w-[480px] mx-auto flex">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.page}
              onClick={() => onNavigate(item.page)}
              className={cn(
                "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs font-medium transition-colors",
                currentPage === item.page
                  ? "text-teal-500"
                  : "text-muted-foreground hover:text-foreground",
              )}
              data-ocid={`nav.${item.page}.link`}
            >
              {item.icon}
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
