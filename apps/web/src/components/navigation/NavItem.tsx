import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import type { MenuItem, SubMenuItem } from "./menuConfig";

interface NavItemProps {
  item: MenuItem;
  collapsed?: boolean;
}

function SubNavItem({ sub }: { sub: SubMenuItem }) {
  const location = useLocation();
  const pathname = location.pathname;
  const search = location.search;
  const fullPath = pathname + search;

  const hasNested = sub.submenu && sub.submenu.length > 0;

  const isSubActive = sub.href
    ? pathname === sub.href || fullPath === sub.href
    : false;

  const isChildActive =
    sub.submenu?.some((child) => pathname === child.href || fullPath === child.href) ?? false;

  const [isNestedOpen, setIsNestedOpen] = useState(isSubActive || isChildActive);

  useEffect(() => {
    if (isSubActive || isChildActive) {
      setIsNestedOpen(true);
    }
  }, [isSubActive, isChildActive]);

  if (hasNested) {
    return (
      <div className="space-y-0.5">
        <button
          onClick={() => setIsNestedOpen(!isNestedOpen)}
          className={`
            w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left
            ${isSubActive || isChildActive
              ? "text-[var(--primary)] bg-[var(--primary-bg)] font-bold"
              : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent)]"
            }
          `}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                isSubActive || isChildActive ? "bg-[var(--primary)]" : "bg-[var(--border)]"
              }`}
            />
            <span className="truncate">{sub.label}</span>
          </div>
          <ChevronDown
            className={`h-3.5 w-3.5 text-[var(--text-muted)] transition-transform duration-200 shrink-0 ${
              isNestedOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {/* 3rd level nested accordion */}
        <div
          className={`overflow-hidden transition-all duration-200 ease-in-out ${
            isNestedOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="ml-3 pl-2.5 border-l border-[var(--border)] space-y-0.5 py-0.5">
            {sub.submenu!.map((child) => {
              const isChildItemActive = pathname === child.href || fullPath === child.href;
              return (
                <Link
                  key={child.href}
                  to={child.href ?? "#"}
                  className={`
                    flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[0.72rem] font-medium transition-all
                    ${isChildItemActive
                      ? "text-[var(--primary)] bg-[var(--primary-bg)] font-bold"
                      : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent)]"
                    }
                  `}
                >
                  <span
                    className={`w-1 h-1 rounded-full flex-shrink-0 ${
                      isChildItemActive ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                    }`}
                  />
                  <span className="flex-1 leading-tight">{child.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Link
      to={sub.href ?? "#"}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all
        ${isSubActive
          ? "text-[var(--primary)] bg-[var(--primary-bg)] font-bold"
          : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--accent)]"
        }
      `}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
          isSubActive ? "bg-[var(--primary)]" : "bg-[var(--border)]"
        }`}
      />
      <span className="flex-1">{sub.label}</span>
      {sub.badge && (
        <span className={`badge badge-${sub.badgeVariant ?? "gray"}`}>
          {sub.badge}
        </span>
      )}
    </Link>
  );
}

export default function NavItem({ item, collapsed = false }: NavItemProps) {
  const location = useLocation();
  const pathname = location.pathname;
  const hasSubmenu = item.submenu && item.submenu.length > 0;

  const isActive = item.href
    ? pathname === item.href
    : item.submenu?.some((sub) => {
        const fullPath = pathname + location.search;
        const subMatch = pathname === sub.href || fullPath === sub.href;
        const childMatch = sub.submenu?.some(
          (child) => pathname === child.href || fullPath === child.href
        );
        return subMatch || childMatch;
      }) ?? false;

  const [isOpen, setIsOpen] = useState(isActive);

  useEffect(() => {
    if (isActive) {
      setIsOpen(true);
    }
  }, [isActive]);

  const Icon = item.icon;

  // ══════════════════════════════════════════
  // COLLAPSED MODE (Desktop icon-rail only)
  // ══════════════════════════════════════════
  const collapsedItem = (
    <div className="hidden lg:block relative group/tooltip">
      {hasSubmenu ? (
        <button
          className={`
            sidebar-nav-item justify-center px-0 w-full cursor-pointer
            ${isActive ? "active" : ""}
          `}
          title={item.label}
          onClick={() => setIsOpen(!isOpen)}
          style={{ paddingLeft: 0, paddingRight: 0 }}
        >
          <span
            className={`
              flex-shrink-0 p-2 rounded-lg transition-colors
              ${isActive
                ? "bg-[var(--primary-bg)] text-[var(--primary)]"
                : "text-[var(--text-muted)] group-hover/tooltip:bg-[var(--primary-bg)] group-hover/tooltip:text-[var(--primary)]"
              }
            `}
          >
            <Icon className="h-5 w-5" />
          </span>
        </button>
      ) : (
        <Link
          to={item.href ?? "#"}
          title={item.label}
          className={`sidebar-nav-item justify-center px-0 ${isActive ? "active" : ""}`}
          style={{ paddingLeft: 0, paddingRight: 0 }}
        >
          <span
            className={`
              flex-shrink-0 p-2 rounded-lg transition-colors
              ${isActive
                ? "bg-[var(--primary-bg)] text-[var(--primary)]"
                : "text-[var(--text-muted)] group-hover/tooltip:bg-[var(--primary-bg)] group-hover/tooltip:text-[var(--primary)]"
              }
            `}
          >
            <Icon className="h-5 w-5" />
          </span>
        </Link>
      )}

      {/* Tooltip on hover */}
      <div className="
        absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50
        pointer-events-none opacity-0 group-hover/tooltip:opacity-100
        transition-opacity duration-150
      ">
        <div className="
          bg-[var(--card)] border border-[var(--border)] shadow-lg
          text-[var(--text)] text-xs font-medium
          px-2.5 py-1.5 rounded-lg whitespace-nowrap
          flex items-center gap-1.5
        ">
          {item.label}
          {item.badge && (
            <span className={`badge badge-${item.badgeVariant ?? "gray"}`}>
              {item.badge}
            </span>
          )}
        </div>
        {/* Tooltip arrow */}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[var(--border)]" />
      </div>
    </div>
  );

  // ══════════════════════════════════════════
  // FULL MODE (Mobile always, Desktop expanded)
  // ══════════════════════════════════════════

  // Item WITH submenu
  if (hasSubmenu) {
    return (
      <>
        {/* Icon-only (collapsed desktop) */}
        {collapsed && collapsedItem}

        {/* Full item */}
        <div className={collapsed ? "lg:hidden" : ""}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`sidebar-nav-item group w-full text-left cursor-pointer ${isActive ? "active" : ""}`}
            aria-expanded={isOpen}
          >
            {/* Icon */}
            <span
              className={`
                flex-shrink-0 p-1.5 rounded-lg mr-3 transition-colors
                ${isActive
                  ? "bg-[var(--primary-bg)] text-[var(--primary)]"
                  : "bg-[var(--accent)] text-[var(--text-muted)] group-hover:bg-[var(--primary-bg)] group-hover:text-[var(--primary)]"
                }
              `}
            >
              <Icon className="h-4 w-4" />
            </span>

            {/* Label */}
            <span className="flex-1 text-left leading-tight">{item.label}</span>

            {/* Badge */}
            {item.badge && (
              <span className={`badge badge-${item.badgeVariant ?? "gray"} mr-1`}>
                {item.badge}
              </span>
            )}

            {/* Chevron */}
            <ChevronDown
              className={`h-3.5 w-3.5 ml-1 text-[var(--text-muted)] transition-transform duration-200 flex-shrink-0 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Submenu accordion */}
          <div
            className={`overflow-hidden transition-all duration-200 ease-in-out ${
              isOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="mt-0.5 ml-4 pl-3 border-l border-[var(--border)] space-y-0.5 py-0.5">
              {item.submenu!.map((sub) => (
                <SubNavItem key={sub.label} sub={sub} />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Item WITHOUT submenu (simple link)
  return (
    <>
      {/* Icon-only (collapsed desktop) */}
      {collapsed && (
        <div className="hidden lg:block relative group/tooltip">
          <Link
            to={item.href ?? "#"}
            title={item.label}
            className={`sidebar-nav-item justify-center px-0 ${isActive ? "active" : ""}`}
            style={{ paddingLeft: 0, paddingRight: 0 }}
          >
            <span
              className={`
                flex-shrink-0 p-2 rounded-lg transition-colors
                ${isActive
                  ? "bg-[var(--primary-bg)] text-[var(--primary)]"
                  : "text-[var(--text-muted)] group-hover/tooltip:bg-[var(--primary-bg)] group-hover/tooltip:text-[var(--primary)]"
                }
              `}
            >
              <Icon className="h-5 w-5" />
            </span>
          </Link>
          {/* Tooltip */}
          <div className="
            absolute left-full top-1/2 -translate-y-1/2 ml-2 z-50
            pointer-events-none opacity-0 group-hover/tooltip:opacity-100
            transition-opacity duration-150
          ">
            <div className="bg-[var(--card)] border border-[var(--border)] shadow-lg text-[var(--text)] text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap">
              {item.label}
            </div>
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[var(--border)]" />
          </div>
        </div>
      )}

      {/* Full item */}
      <Link
        to={item.href ?? "#"}
        className={`sidebar-nav-item group ${isActive ? "active" : ""} ${collapsed ? "lg:hidden" : ""}`}
      >
        <span
          className={`
            flex-shrink-0 p-1.5 rounded-lg mr-3 transition-colors
            ${isActive
              ? "bg-[var(--primary-bg)] text-[var(--primary)]"
              : "bg-[var(--accent)] text-[var(--text-muted)] group-hover:bg-[var(--primary-bg)] group-hover:text-[var(--primary)]"
            }
          `}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="flex-1 leading-tight">{item.label}</span>
        {item.badge && (
          <span className={`badge badge-${item.badgeVariant ?? "gray"}`}>
            {item.badge}
          </span>
        )}
      </Link>
    </>
  );
}
