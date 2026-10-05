import NavItem from "./NavItem";
import type { MenuGroup } from "./menuConfig";

interface NavGroupProps {
  group: MenuGroup;
  collapsed?: boolean;
}

export default function NavGroup({ group, collapsed = false }: NavGroupProps) {
  return (
    <div className="mb-4">
      {/* Group label — hidden when collapsed on desktop */}
      <span
        className={`
          block px-2 mb-1.5 text-[0.6rem] font-semibold uppercase tracking-widest text-[var(--text-muted)]
          ${collapsed ? "lg:hidden" : ""}
        `}
      >
        {group.groupLabel}
      </span>

      {/* Divider line when collapsed (desktop only) */}
      {collapsed && (
        <div className="hidden lg:block w-6 h-px bg-[var(--border)] mx-auto mb-2" />
      )}

      <div className="space-y-0.5">
        {group.items.map((item) => (
          <NavItem key={item.label} item={item} collapsed={collapsed} />
        ))}
      </div>
    </div>
  );
}
