// config/roleNavigation.ts
import { Home } from "lucide-react";
import { UserRole } from "@/types";

export const roleDashboardMap: Record<UserRole, {
  label: string;
  path: string;
  icon: React.ElementType;
}> = {
  parent: {
    label: "Dashboard",
    path: "/parent-dashboard",
    icon: Home,
  },
  child: {
    label: "Dashboard",
    path: "/child-dashboard",
    icon: Home,
  },
  teacher: {
    label: "Dashboard",
    path: "/teacher-dashboard",
    icon: Home,
  },
};
