import { useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { NAV_ITEMS, titleForPath } from "../content/routes";
import { useAppState } from "../state/AppState";

export function AppShell() {
  const location = useLocation();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const { persistError } = useAppState();
  const sectionTitle = titleForPath(location.pathname);

  useEffect(() => {
    document.title = `${sectionTitle} · English Lab`;
    dialogRef.current?.close();
    setMenuOpen(false);
  }, [location.pathname, sectionTitle]);

  function openMenu() {
    dialogRef.current?.showModal();
    setMenuOpen(true);
  }

  function closeMenu() {
    dialogRef.current?.close();
    setMenuOpen(false);
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <Brand />
        <Navigation />
        <p className="sidebar-note">Step 1 of 6. This version is Home. The other sections come next.</p>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <button
            type="button"
            className="menu-button"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={openMenu}
          >
            Menu
          </button>
          <p className="section-label">{sectionTitle}</p>
        </header>
        {persistError ? (
          <p className="banner" role="alert">
            {persistError}
          </p>
        ) : null}
        <main id="main" className="content" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
      <dialog
        ref={dialogRef}
        id="mobile-nav"
        className="nav-dialog"
        aria-label="Sections"
        onClose={() => setMenuOpen(false)}
      >
        <div className="dialog-head">
          <Brand />
          <button type="button" className="text-button" onClick={closeMenu}>
            Close
          </button>
        </div>
        <Navigation onNavigate={closeMenu} />
      </dialog>
    </div>
  );
}

function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark" aria-hidden="true">
        E
      </span>
      <span>
        <span className="brand-name">English Lab</span>
        <span className="brand-tag">Personal practice</span>
      </span>
    </div>
  );
}

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="side-nav" aria-label="Main">
      <ul>
        {NAV_ITEMS.map((item) => (
          <li key={item.path}>
            <NavLink to={item.path} end={item.end} onClick={onNavigate}>
              {item.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
