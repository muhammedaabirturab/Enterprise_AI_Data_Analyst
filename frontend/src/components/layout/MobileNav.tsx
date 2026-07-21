import { motion } from "framer-motion";
import { NavLink, useLocation } from "react-router-dom";

import { NAV_ITEMS } from "./Sidebar";

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 glass border-t border-slate-200/70 dark:border-white/5 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-2 py-2">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink key={to} to={to} className="relative flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl min-w-[64px]">
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active-pill"
                  className="absolute inset-0 rounded-xl bg-brand-50 dark:bg-brand-500/10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                />
              )}
              <Icon size={19} className={`relative z-10 ${isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-400"}`} />
              <span className={`relative z-10 text-[10px] font-medium ${isActive ? "text-brand-600 dark:text-brand-400" : "text-slate-400"}`}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
