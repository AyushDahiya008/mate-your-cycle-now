
import { cn } from "@/lib/utils";
import { useFlowMateStore } from "@/lib/store";
import { Home, Calendar, PlusCircle, BarChart2, Settings } from "lucide-react";

const Navigation = () => {
  const { currentView, setCurrentView } = useFlowMateStore();

  const navItems = [
    {
      label: "Home",
      icon: Home,
      value: "dashboard" as const
    },
    {
      label: "Calendar",
      icon: Calendar,
      value: "calendar" as const
    },
    {
      label: "Log",
      icon: PlusCircle,
      value: "log" as const
    },
    {
      label: "Insights",
      icon: BarChart2,
      value: "insights" as const
    },
    {
      label: "Settings",
      icon: Settings,
      value: "settings" as const
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border/40 pb-safe">
      <div className="max-w-md mx-auto flex justify-between px-4 py-2">
        {navItems.map((item) => (
          <button
            key={item.value}
            className={cn(
              "flex flex-col items-center justify-center p-2 rounded-lg w-16 transition-colors",
              currentView === item.value
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setCurrentView(item.value)}
          >
            <item.icon size={22} />
            <span className="text-xs mt-1">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Navigation;
