import { useLocation, useNavigate } from "react-router-dom";
import { Home, Users, BookOpen, DollarSign, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Início", path: "/autoescola" },
  { icon: Users, label: "Leads", path: "/autoescola/leads" },
  { icon: BookOpen, label: "Turmas", path: "/autoescola/turmas" },
  { icon: DollarSign, label: "Financeiro", path: "/autoescola/financeiro" },
  { icon: Building2, label: "Perfil", path: "/autoescola/perfil" },
];

export function AutoescolaBottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-50">
      <div className="max-w-md mx-auto flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || 
            (item.path !== "/autoescola" && location.pathname.startsWith(item.path));

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all min-w-[64px]",
                isActive
                  ? "text-emerald-600"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "text-emerald-500")} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
