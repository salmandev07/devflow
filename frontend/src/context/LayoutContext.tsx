import { createContext, useContext } from "react";

interface LayoutContextType {
  sidebarCollapsed: boolean;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}

export const LayoutContext = createContext<LayoutContextType>({
  sidebarCollapsed: false,
  mobileOpen: false,
  setMobileOpen: () => {},
});

export const useLayout = () => useContext(LayoutContext);
